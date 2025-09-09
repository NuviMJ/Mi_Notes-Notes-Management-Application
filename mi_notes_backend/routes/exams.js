const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

module.exports = (db) => {
  // Get all exams
  router.get('/', (req, res) => {
    const query = `
      SELECT 
        e.*,
        m.module_name,
        m.code as module_code
      FROM exams e
      LEFT JOIN modules m ON e.module_id = m.id
      ORDER BY e.exam_date DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const exams = results.map(exam => ({
        exam_id: exam.exam_id,
        module_id: exam.module_id,
        module_name: exam.module_name,
        module_code: exam.module_code,
        exam_name: exam.exam_name,
        exam_date: exam.exam_date,
        exam_type: exam.exam_type,
        created_at: exam.created_at,
        updated_at: exam.updated_at
      }));
      
      res.json(exams);
    });
  });

  // Get exams by module
  router.get('/module/:moduleId', (req, res) => {
    const moduleId = parseInt(req.params.moduleId);
    
    const query = `
      SELECT 
        e.*,
        m.module_name,
        m.code as module_code
      FROM exams e
      LEFT JOIN modules m ON e.module_id = m.id
      WHERE e.module_id = ?
      ORDER BY e.exam_date DESC
    `;
    
    db.query(query, [moduleId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const exams = results.map(exam => ({
        exam_id: exam.exam_id,
        module_id: exam.module_id,
        module_name: exam.module_name,
        module_code: exam.module_code,
        exam_name: exam.exam_name,
        exam_date: exam.exam_date,
        exam_type: exam.exam_type,
        created_at: exam.created_at,
        updated_at: exam.updated_at
      }));
      
      res.json(exams);
    });
  });

  // Get upcoming exams
  router.get('/upcoming', (req, res) => {
    const query = `
      SELECT 
        e.*,
        m.module_name,
        m.code as module_code
      FROM exams e
      LEFT JOIN modules m ON e.module_id = m.id
      WHERE e.exam_date >= CURDATE()
      ORDER BY e.exam_date ASC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const exams = results.map(exam => ({
        exam_id: exam.exam_id,
        module_id: exam.module_id,
        module_name: exam.module_name,
        module_code: exam.module_code,
        exam_name: exam.exam_name,
        exam_date: exam.exam_date,
        exam_type: exam.exam_type,
        created_at: exam.created_at,
        updated_at: exam.updated_at
      }));
      
      res.json(exams);
    });
  });

  // Get exams by date range
  router.get('/range', (req, res) => {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const query = `
      SELECT 
        e.*,
        m.module_name,
        m.code as module_code
      FROM exams e
      LEFT JOIN modules m ON e.module_id = m.id
      WHERE e.exam_date BETWEEN ? AND ?
      ORDER BY e.exam_date ASC
    `;
    
    db.query(query, [start_date, end_date], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const exams = results.map(exam => ({
        exam_id: exam.exam_id,
        module_id: exam.module_id,
        module_name: exam.module_name,
        module_code: exam.module_code,
        exam_name: exam.exam_name,
        exam_date: exam.exam_date,
        exam_type: exam.exam_type,
        created_at: exam.created_at,
        updated_at: exam.updated_at
      }));
      
      res.json(exams);
    });
  });

  // Get single exam by ID
  router.get('/:id', (req, res) => {
    const examId = req.params.id;
    
    const query = `
      SELECT 
        e.*,
        m.module_name,
        m.code as module_code
      FROM exams e
      LEFT JOIN modules m ON e.module_id = m.id
      WHERE e.exam_id = ?
    `;
    
    db.query(query, [examId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      const exam = results[0];
      res.json({
        exam_id: exam.exam_id,
        module_id: exam.module_id,
        module_name: exam.module_name,
        module_code: exam.module_code,
        exam_name: exam.exam_name,
        exam_date: exam.exam_date,
        exam_type: exam.exam_type,
        created_at: exam.created_at,
        updated_at: exam.updated_at
      });
    });
  });

  // Create new exam (requires authentication)
  router.post('/', authMiddleware, (req, res) => {
    const { module_id, exam_name, exam_date, exam_type } = req.body;
    
    if (!module_id || !exam_name || !exam_date || !exam_type) {
      return res.status(400).json({ 
        message: 'Module ID, exam name, exam date, and exam type are required' 
      });
    }
    
    // Validate exam_type
    const validTypes = ['Midterm', 'Final', 'Quiz', 'Assignment'];
    if (!validTypes.includes(exam_type)) {
      return res.status(400).json({ 
        message: 'Invalid exam type. Must be one of: Midterm, Final, Quiz, Assignment' 
      });
    }
    
    const query = `
      INSERT INTO exams (module_id, exam_name, exam_date, exam_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    db.query(query, [module_id, exam_name, exam_date, exam_type], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.status(201).json({
        message: 'Exam created successfully',
        exam_id: result.insertId
      });
    });
  });

  // Update exam (requires authentication)
  router.put('/:id', authMiddleware, (req, res) => {
    const examId = req.params.id;
    const { module_id, exam_name, exam_date, exam_type } = req.body;
    
    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    
    if (module_id !== undefined) {
      updates.push('module_id = ?');
      values.push(module_id);
    }
    
    if (exam_name !== undefined) {
      updates.push('exam_name = ?');
      values.push(exam_name);
    }
    
    if (exam_date !== undefined) {
      updates.push('exam_date = ?');
      values.push(exam_date);
    }
    
    if (exam_type !== undefined) {
      // Validate exam_type
      const validTypes = ['Midterm', 'Final', 'Quiz', 'Assignment'];
      if (!validTypes.includes(exam_type)) {
        return res.status(400).json({ 
          message: 'Invalid exam type. Must be one of: Midterm, Final, Quiz, Assignment' 
        });
      }
      updates.push('exam_type = ?');
      values.push(exam_type);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    // Add updated_at timestamp
    updates.push('updated_at = NOW()');
    
    // Add exam ID to values array for WHERE clause
    values.push(examId);
    
    const query = `
      UPDATE exams 
      SET ${updates.join(', ')}
      WHERE exam_id = ?
    `;
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      res.json({ message: 'Exam updated successfully' });
    });
  });

  // Delete exam (requires authentication)
  router.delete('/:id', authMiddleware, (req, res) => {
    const examId = req.params.id;
    
    const query = 'DELETE FROM exams WHERE exam_id = ?';
    
    db.query(query, [examId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      res.json({ message: 'Exam deleted successfully' });
    });
  });

  return router;
};