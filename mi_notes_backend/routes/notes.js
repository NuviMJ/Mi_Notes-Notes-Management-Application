const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'));
    }
  }
});

module.exports = (db) => {
  // Get all notes
  router.get('/', optionalAuth, (req, res) => {
    const query = `
      SELECT 
        n.*,
        u.name as uploaderName,
        u.email as uploaderEmail,
        m.module_name as moduleName,
        m.code as moduleCode
      FROM notes n
      JOIN users u ON n.user_id = u.id
      JOIN modules m ON n.module_id = m.id
      ORDER BY n.upload_date DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const notes = results.map(note => ({
        id: note.id.toString(),
        title: note.title,
        description: note.description,
        moduleId: note.module_id.toString(),
        moduleName: note.moduleName,
        moduleCode: note.moduleCode,
        fileUrl: note.file_url,
        uploadedBy: {
          id: note.user_id.toString(),
          name: note.uploaderName,
          email: note.uploaderEmail
        },
        uploadDate: note.upload_date
      }));
      
      res.json(notes);
    });
  });

  // Get notes by module
  router.get('/module/:moduleId', optionalAuth, (req, res) => {
    const moduleId = req.params.moduleId;
    
    const query = `
      SELECT 
        n.*,
        u.name as uploaderName,
        u.email as uploaderEmail,
        m.module_name as moduleName,
        m.code as moduleCode,
        m.semester_id as moduleSemester
      FROM notes n
      JOIN users u ON n.user_id = u.id
      JOIN modules m ON n.module_id = m.id
      WHERE n.module_id = ?
      ORDER BY n.upload_date DESC
    `;
    
    db.query(query, [moduleId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const notes = results.map(note => ({
        id: note.id.toString(),
        title: note.title,
        description: note.description,
        moduleId: note.module_id.toString(),
        moduleName: note.moduleName,
        moduleCode: note.moduleCode,
        semesterId: note.moduleSemester,
        fileUrl: note.file_url,
        uploadedBy: {
          id: note.user_id.toString(),
          name: note.uploaderName,
          email: note.uploaderEmail
        },
        uploadDate: note.upload_date
      }));
      
      res.json(notes);
    });
  });

  // Get single note by ID
  router.get('/:id', optionalAuth, (req, res) => {
    const noteId = req.params.id;
    
    const query = `
      SELECT 
        n.*,
        u.name as uploaderName,
        u.email as uploaderEmail,
        m.module_name as moduleName,
        m.code as moduleCode,
        m.semester_id
      FROM notes n
      JOIN users u ON n.user_id = u.id
      JOIN modules m ON n.module_id = m.id
      WHERE n.id = ?
    `;
    
    db.query(query, [noteId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      const note = results[0];
      res.json({
        id: note.id.toString(),
        title: note.title,
        description: note.description,
        moduleId: note.module_id.toString(),
        moduleName: note.moduleName,
        moduleCode: note.moduleCode,
        semesterId: note.semester_id,
        fileUrl: note.file_url,
        uploadedBy: {
          id: note.user_id.toString(),
          name: note.uploaderName,
          email: note.uploaderEmail
        },
        uploadDate: note.upload_date
      });
    });
  });

  // Upload new note
  router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, description, moduleId } = req.body;

    if (!title || !moduleId) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: 'Please provide title and module ID' 
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    db.query(
      'INSERT INTO notes (title, description, module_id, user_id, file_url) VALUES (?, ?, ?, ?, ?)',
      [
        title,
        description || null,
        moduleId,
        req.user.id,
        fileUrl
      ],
      (err, result) => {
        if (err) {
          // Remove uploaded file if database insert fails
          fs.unlinkSync(req.file.path);
          console.error('Error creating note:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        // Get the created note with full details
        const query = `
          SELECT 
            n.*,
            u.name as uploaderName,
            u.email as uploaderEmail,
            m.module_name as moduleName,
            m.code as moduleCode,
            m.semester_id
          FROM notes n
          JOIN users u ON n.user_id = u.id
          JOIN modules m ON n.module_id = m.id
          WHERE n.id = ?
        `;

        db.query(query, [result.insertId], (err, results) => {
          if (err || results.length === 0) {
            return res.status(500).json({ message: 'Server error' });
          }

          const note = results[0];
          res.status(201).json({
            message: 'Note uploaded successfully',
            id: note.id.toString(),
            title: note.title,
            description: note.description,
            moduleId: note.module_id.toString(),
            moduleName: note.moduleName,
            moduleCode: note.moduleCode,
            semesterId: note.semester_id,
            fileUrl: note.file_url,
            fileName: req.file.originalname,
            uploadedBy: {
              id: note.user_id.toString(),
              name: note.uploaderName,
              email: note.uploaderEmail
            },
            uploadDate: note.upload_date
          });
        });
      }
    );
  });

  // Download note
  router.get('/download/:id', optionalAuth, (req, res) => {
    const noteId = req.params.id;

    // First, get the note details
    db.query(
      'SELECT file_url, title FROM notes WHERE id = ?',
      [noteId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'Note not found' });
        }

        const note = results[0];
        const filePath = path.join(__dirname, '..', note.file_url);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ message: 'File not found' });
        }

        // Send file with note title as filename
        const fileName = path.basename(note.file_url);
        res.download(filePath, fileName);
      }
    );
  });

  // Search notes
  router.get('/search', optionalAuth, (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    const query = `
      SELECT 
        n.*,
        u.name as uploaderName,
        u.email as uploaderEmail,
        m.module_name as moduleName,
        m.code as moduleCode,
        m.semester_id
      FROM notes n
      JOIN users u ON n.user_id = u.id
      JOIN modules m ON n.module_id = m.id
      WHERE n.title LIKE ? OR n.description LIKE ? OR m.module_name LIKE ?
      ORDER BY n.upload_date DESC
    `;

    const searchPattern = `%${searchQuery}%`;
    
    db.query(query, [searchPattern, searchPattern, searchPattern], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const notes = results.map(note => ({
        id: note.id.toString(),
        title: note.title,
        description: note.description,
        moduleId: note.module_id.toString(),
        moduleName: note.moduleName,
        moduleCode: note.moduleCode,
        semesterId: note.semester_id,
        fileUrl: note.file_url,
        uploadedBy: {
          id: note.user_id.toString(),
          name: note.uploaderName,
          email: note.uploaderEmail
        },
        uploadDate: note.upload_date
      }));
      
      res.json(notes);
    });
  });

  // Filter notes
  router.get('/filter', optionalAuth, (req, res) => {
    const { semester, moduleId } = req.query;
    
    let query = `
      SELECT 
        n.*,
        u.name as uploaderName,
        u.email as uploaderEmail,
        m.module_name as moduleName,
        m.code as moduleCode,
        m.semester_id
      FROM notes n
      JOIN users u ON n.user_id = u.id
      JOIN modules m ON n.module_id = m.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (semester) {
      query += ' AND m.semester_id = ?';
      params.push(semester);
    }
    
    if (moduleId) {
      query += ' AND n.module_id = ?';
      params.push(moduleId);
    }
    
    query += ' ORDER BY n.upload_date DESC';
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const notes = results.map(note => ({
        id: note.id.toString(),
        title: note.title,
        description: note.description,
        moduleId: note.module_id.toString(),
        moduleName: note.moduleName,
        moduleCode: note.moduleCode,
        semesterId: note.semester_id,
        fileUrl: note.file_url,
        uploadedBy: {
          id: note.user_id.toString(),
          name: note.uploaderName,
          email: note.uploaderEmail
        },
        uploadDate: note.upload_date
      }));
      
      res.json(notes);
    });
  });

  return router;
};