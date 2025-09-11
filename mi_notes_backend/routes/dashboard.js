const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

module.exports = (db) => {
  // Get dashboard statistics
  router.get('/stats', (req, res) => {
    const queries = [
      // Count total notes
      'SELECT COUNT(*) as totalNotes FROM notes',
      // Count total users
      'SELECT COUNT(*) as totalUsers FROM users',
      // Count total modules
      'SELECT COUNT(*) as totalModules FROM modules',
      // Count total semesters (distinct semester_id from modules)
      'SELECT COUNT(DISTINCT semester_id) as totalSemesters FROM modules',
      // Count total assignments
      'SELECT COUNT(*) as totalAssignments FROM assignments',
      // Count ongoing assignments
      'SELECT COUNT(*) as ongoingAssignments FROM assignments WHERE status = "Ongoing"',
      // Count completed assignments
      'SELECT COUNT(*) as completedAssignments FROM assignments WHERE status = "Complete"',
      // Count total exams
      'SELECT COUNT(*) as totalExams FROM exams',
      // Get notes by semester
      `SELECT 
        s.name as semester_name, 
        s.id as semester_id,
        COUNT(n.id) as notes_count
       FROM semesters s
       LEFT JOIN modules m ON s.id = m.semester_id
       LEFT JOIN notes n ON m.id = n.module_id
       GROUP BY s.id, s.name
       ORDER BY s.id`,
      // Get top modules by note count
      `SELECT 
        m.module_name,
        m.code,
        COUNT(n.id) as note_count
       FROM modules m
       LEFT JOIN notes n ON m.id = n.module_id
       GROUP BY m.id, m.module_name, m.code
       ORDER BY note_count DESC
       LIMIT 5`,
      // Get recent activity (last 10 notes uploaded)
      `SELECT 
        n.title,
        n.upload_date,
        m.module_name,
        u.name as uploaded_by
       FROM notes n
       LEFT JOIN modules m ON n.module_id = m.id
       LEFT JOIN users u ON n.user_id = u.id
       ORDER BY n.upload_date DESC
       LIMIT 10`,
      // Get assignment status distribution
      `SELECT 
        status,
        COUNT(*) as count
       FROM assignments
       GROUP BY status`
    ];

    // Execute all queries in parallel
    Promise.all(queries.map(query => {
      return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }))
    .then(results => {
      const [
        totalNotesResult,
        totalUsersResult,
        totalModulesResult,
        totalSemestersResult,
        totalAssignmentsResult,
        ongoingAssignmentsResult,
        completedAssignmentsResult,
        totalExamsResult,
        notesBySemesterResult,
        topModulesResult,
        recentActivityResult,
        assignmentStatusResult
      ] = results;

      const stats = {
        totalNotes: totalNotesResult[0]?.totalNotes || 0,
        totalUsers: totalUsersResult[0]?.totalUsers || 0,
        totalModules: totalModulesResult[0]?.totalModules || 0,
        totalSemesters: totalSemestersResult[0]?.totalSemesters || 0,
        totalAssignments: totalAssignmentsResult[0]?.totalAssignments || 0,
        ongoingAssignments: ongoingAssignmentsResult[0]?.ongoingAssignments || 0,
        completedAssignments: completedAssignmentsResult[0]?.completedAssignments || 0,
        totalExams: totalExamsResult[0]?.totalExams || 0,
        notesBySemester: notesBySemesterResult || [],
        topModules: topModulesResult || [],
        recentActivity: recentActivityResult || [],
        assignmentStatus: assignmentStatusResult || []
      };

      res.json(stats);
    })
    .catch(err => {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Server error' });
    });
  });

  // Get detailed stats for a specific semester
  router.get('/stats/semester/:id', (req, res) => {
    const semesterId = req.params.id;
    
    const queries = [
      // Modules in this semester
      'SELECT COUNT(*) as moduleCount FROM modules WHERE semester_id = ?',
      // Notes in this semester
      `SELECT COUNT(n.id) as noteCount 
       FROM notes n 
       JOIN modules m ON n.module_id = m.id 
       WHERE m.semester_id = ?`,
      // Assignments in this semester
      `SELECT COUNT(a.assignment_id) as assignmentCount 
       FROM assignments a 
       JOIN modules m ON a.module_id = m.id 
       WHERE m.semester_id = ?`,
      // Exams in this semester
      `SELECT COUNT(e.exam_id) as examCount 
       FROM exams e 
       JOIN modules m ON e.module_id = m.id 
       WHERE m.semester_id = ?`
    ];

    Promise.all(queries.map(query => {
      return new Promise((resolve, reject) => {
        db.query(query, [semesterId], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }))
    .then(results => {
      const [moduleCountResult, noteCountResult, assignmentCountResult, examCountResult] = results;
      
      const semesterStats = {
        moduleCount: moduleCountResult[0]?.moduleCount || 0,
        noteCount: noteCountResult[0]?.noteCount || 0,
        assignmentCount: assignmentCountResult[0]?.assignmentCount || 0,
        examCount: examCountResult[0]?.examCount || 0
      };

      res.json(semesterStats);
    })
    .catch(err => {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Server error' });
    });
  });

  return router;
};