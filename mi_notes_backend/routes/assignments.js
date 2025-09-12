const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'assignments');
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
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx|zip|rar)$/i;
    const extname = allowedExtensions.test(file.originalname);
    
    // Define allowed MIME types for better validation
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar'
    ];
    
    const mimetypeValid = allowedMimeTypes.includes(file.mimetype);
    
    if (extname || mimetypeValid) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, ZIP, RAR'));
    }
  }
});

module.exports = (db) => {
  // Get all assignments
  router.get('/', authMiddleware, (req, res) => {
    const query = `
      SELECT 
        a.assignment_id,
        a.module_id,
        a.title,
        a.deadline,
        a.status,
        m.module_name,
        m.code as module_code,
        ad.doc_id,
        ad.doc_name,
        ad.file_path,
        ad.file_type,
        ad.uploaded_at
      FROM assignments a
      LEFT JOIN modules m ON a.module_id = m.id
      LEFT JOIN assignment_documents ad ON a.assignment_id = ad.assignment_id
      ORDER BY a.deadline ASC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      // Group documents by assignment
      const assignmentsMap = new Map();
      
      results.forEach(row => {
        if (!assignmentsMap.has(row.assignment_id)) {
          assignmentsMap.set(row.assignment_id, {
            assignment_id: row.assignment_id,
            module_id: row.module_id,
            title: row.title,
            deadline: row.deadline,
            status: row.status,
            module_name: row.module_name,
            module_code: row.module_code,
            documents: []
          });
        }
        
        if (row.doc_id) {
          assignmentsMap.get(row.assignment_id).documents.push({
            doc_id: row.doc_id,
            doc_name: row.doc_name,
            file_path: row.file_path,
            file_type: row.file_type,
            uploaded_at: row.uploaded_at
          });
        }
      });
      
      const assignments = Array.from(assignmentsMap.values());
      res.json(assignments);
    });
  });

  // Get assignments by module
  router.get('/module/:moduleId', authMiddleware, (req, res) => {
    const moduleId = req.params.moduleId;
    
    const query = `
      SELECT 
        a.assignment_id,
        a.module_id,
        a.title,
        a.deadline,
        a.status,
        m.module_name,
        m.code as module_code,
        ad.doc_id,
        ad.doc_name,
        ad.file_path,
        ad.file_type,
        ad.uploaded_at
      FROM assignments a
      LEFT JOIN modules m ON a.module_id = m.id
      LEFT JOIN assignment_documents ad ON a.assignment_id = ad.assignment_id
      WHERE a.module_id = ?
      ORDER BY a.deadline ASC
    `;
    
    db.query(query, [moduleId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      // Group documents by assignment
      const assignmentsMap = new Map();
      
      results.forEach(row => {
        if (!assignmentsMap.has(row.assignment_id)) {
          assignmentsMap.set(row.assignment_id, {
            assignment_id: row.assignment_id,
            module_id: row.module_id,
            title: row.title,
            deadline: row.deadline,
            status: row.status,
            module_name: row.module_name,
            module_code: row.module_code,
            documents: []
          });
        }
        
        if (row.doc_id) {
          assignmentsMap.get(row.assignment_id).documents.push({
            doc_id: row.doc_id,
            doc_name: row.doc_name,
            file_path: row.file_path,
            file_type: row.file_type,
            uploaded_at: row.uploaded_at
          });
        }
      });
      
      const assignments = Array.from(assignmentsMap.values());
      res.json(assignments);
    });
  });

  // Get single assignment by ID
  router.get('/:id', authMiddleware, (req, res) => {
    const assignmentId = req.params.id;
    
    const query = `
      SELECT 
        a.assignment_id,
        a.module_id,
        a.title,
        a.deadline,
        a.status,
        m.module_name,
        m.code as module_code,
        ad.doc_id,
        ad.doc_name,
        ad.file_path,
        ad.file_type,
        ad.uploaded_at
      FROM assignments a
      LEFT JOIN modules m ON a.module_id = m.id
      LEFT JOIN assignment_documents ad ON a.assignment_id = ad.assignment_id
      WHERE a.assignment_id = ?
    `;
    
    db.query(query, [assignmentId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      const assignment = {
        assignment_id: results[0].assignment_id,
        module_id: results[0].module_id,
        title: results[0].title,
        deadline: results[0].deadline,
        status: results[0].status,
        module_name: results[0].module_name,
        module_code: results[0].module_code,
        documents: []
      };
      
      results.forEach(row => {
        if (row.doc_id) {
          assignment.documents.push({
            doc_id: row.doc_id,
            doc_name: row.doc_name,
            file_path: row.file_path,
            file_type: row.file_type,
            uploaded_at: row.uploaded_at
          });
        }
      });
      
      res.json(assignment);
    });
  });

  // Create new assignment
  router.post('/', authMiddleware, (req, res) => {
    const { module_id, title, deadline } = req.body;
    
    if (!module_id || !title || !deadline) {
      return res.status(400).json({ message: 'Module ID, title, and deadline are required' });
    }
    
    const query = 'INSERT INTO assignments (module_id, title, deadline, status) VALUES (?, ?, ?, ?)';
    const status = 'Ongoing';
    
    db.query(query, [module_id, title, deadline, status], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.status(201).json({
        assignment_id: result.insertId,
        module_id,
        title,
        deadline,
        status,
        documents: []
      });
    });
  });

  // Update assignment
  router.put('/:id', authMiddleware, (req, res) => {
    const assignmentId = req.params.id;
    const { title, deadline, status } = req.body;
    
    let query = 'UPDATE assignments SET ';
    const params = [];
    const updates = [];
    
    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (deadline) {
      updates.push('deadline = ?');
      params.push(deadline);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    query += updates.join(', ') + ' WHERE assignment_id = ?';
    params.push(assignmentId);
    
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      res.json({ message: 'Assignment updated successfully' });
    });
  });

  // Delete assignment
  router.delete('/:id', authMiddleware, (req, res) => {
    const assignmentId = req.params.id;
    
    // First delete associated documents
    db.query('DELETE FROM assignment_documents WHERE assignment_id = ?', [assignmentId], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      // Then delete the assignment
      db.query('DELETE FROM assignments WHERE assignment_id = ?', [assignmentId], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Assignment not found' });
        }
        
        res.json({ message: 'Assignment deleted successfully' });
      });
    });
  });

  // Upload document for assignment
  router.post('/:id/upload', authMiddleware, upload.single('document'), (req, res) => {
    const assignmentId = req.params.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { originalname, filename, mimetype } = req.file;
    const filePath = `/uploads/assignments/${filename}`;
    
    const query = 'INSERT INTO assignment_documents (assignment_id, doc_name, file_path, file_type) VALUES (?, ?, ?, ?)';
    
    db.query(query, [assignmentId, originalname, filePath, mimetype], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        // Delete uploaded file if database insert fails
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.status(201).json({
        doc_id: result.insertId,
        assignment_id: assignmentId,
        doc_name: originalname,
        file_path: filePath,
        file_type: mimetype,
        uploaded_at: new Date()
      });
    });
  });

  // Delete document from assignment
  router.delete('/:assignmentId/document/:docId', authMiddleware, (req, res) => {
    const { assignmentId, docId } = req.params;
    
    // First get the file path
    db.query('SELECT file_path FROM assignment_documents WHERE doc_id = ? AND assignment_id = ?', 
      [docId, assignmentId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      const filePath = path.join(__dirname, '..', results[0].file_path);
      
      // Delete from database
      db.query('DELETE FROM assignment_documents WHERE doc_id = ? AND assignment_id = ?', 
        [docId, assignmentId], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        // Delete file from filesystem
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        res.json({ message: 'Document deleted successfully' });
      });
    });
  });

  return router;
};