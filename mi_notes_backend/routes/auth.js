const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = (db) => {
  // Register endpoint
  router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }

    try {
      // Check if user already exists
      db.query(
        'SELECT id FROM users WHERE email = ?',
        [email],
        async (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
          }

          if (results.length > 0) {
            return res.status(400).json({ 
              message: 'User with this email already exists' 
            });
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create new user
          db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword],
            (err, result) => {
              if (err) {
                console.error('Error creating user:', err);
                return res.status(500).json({ message: 'Server error' });
              }

              // Get the created user
              db.query(
                'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
                [result.insertId],
                (err, users) => {
                  if (err || users.length === 0) {
                    return res.status(500).json({ message: 'Server error' });
                  }

                  const user = users[0];
                  const token = generateToken(user);

                  res.status(201).json({
                    message: 'User registered successfully',
                    user: {
                      id: user.id.toString(),
                      name: user.name,
                      email: user.email,
                      role: user.role,
                      createdAt: user.created_at
                    },
                    token
                  });
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Login endpoint
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    try {
      db.query(
        'SELECT id, name, email, password, role, created_at FROM users WHERE email = ?',
        [email],
        async (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
          }

          if (results.length === 0) {
            return res.status(401).json({ 
              message: 'Invalid email or password' 
            });
          }

          const user = results[0];

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res.status(401).json({ 
              message: 'Invalid email or password' 
            });
          }

          // Generate token
          const token = generateToken(user);

          res.json({
            message: 'Login successful',
            user: {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              createdAt: user.created_at
            },
            token
          });
        }
      );
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get current user endpoint
  router.get('/me', authMiddleware, (req, res) => {
    db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];
        res.json({
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at
        });
      }
    );
    
  });

  // Logout endpoint (optional - mainly for client-side token removal)
  router.post('/logout', authMiddleware, (req, res) => {
    // In a stateless JWT system, logout is handled client-side
    // This endpoint can be used for logging or cleanup if needed
    res.json({ message: 'Logout successful' });
  });

  return router;
};