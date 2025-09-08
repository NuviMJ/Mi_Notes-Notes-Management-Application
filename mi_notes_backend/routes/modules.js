const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

module.exports = (db) => {
  // Get all modules
  router.get('/', (req, res) => {
    const query = `
      SELECT 
        m.*,
        COUNT(n.id) as noteCount
      FROM modules m
      LEFT JOIN notes n ON m.id = n.module_id
      GROUP BY m.id
      ORDER BY m.semester_id, m.module_name
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const modules = results.map(module => ({
        id: module.id.toString(),
        name: module.module_name,
        code: module.code,
        semester: module.semester_id,
        noteCount: module.noteCount
      }));
      
      res.json(modules);
    });
  });

  // Get modules by semester
  router.get('/semester/:semester', (req, res) => {
    const semester = parseInt(req.params.semester);
    
    const query = `
      SELECT 
        m.*,
        COUNT(n.id) as noteCount
      FROM modules m
      LEFT JOIN notes n ON m.id = n.module_id
      WHERE m.semester_id = ?
      GROUP BY m.id
      ORDER BY m.module_name
    `;
    
    db.query(query, [semester], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const modules = results.map(module => ({
        id: module.id.toString(),
        name: module.module_name,
        code: module.code,
        semester: module.semester_id,
        noteCount: module.noteCount
      }));
      
      res.json(modules);
    });
  });

  // Get single module by ID
  router.get('/:id', (req, res) => {
    const moduleId = req.params.id;
    
    const query = `
      SELECT 
        m.*,
        COUNT(n.id) as noteCount
      FROM modules m
      LEFT JOIN notes n ON m.id = n.module_id
      WHERE m.id = ?
      GROUP BY m.id
    `;
    
    db.query(query, [moduleId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Module not found' });
      }
      
      const module = results[0];
      res.json({
        id: module.id.toString(),
        name: module.module_name,
        code: module.code,
        semester: module.semester_id,
        noteCount: module.noteCount
      });
    });
  });

  return router;
};