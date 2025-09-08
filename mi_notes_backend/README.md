# Mi_Notes Backend API

Backend API for the Mi_Notes application - a note sharing platform for students.

## Features

- User authentication (Register, Login, Logout)
- JWT-based authorization
- Module management
- Note upload and download
- Search and filter notes
- File upload handling

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
   - Make sure MySQL is running
   - Run the SQL script to create tables:
   ```bash
   mysql -u root -p < database.sql
   ```

3. Configure environment variables:
   - The `.env` file is already created with default values
   - Update the database credentials if needed

4. Start the server:
```bash
# For development (with auto-reload)
npm run dev

# For production
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)

### Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/semester/:semester` - Get modules by semester
- `GET /api/modules/:id` - Get single module
- `POST /api/modules` - Create new module (admin only)

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/module/:moduleId` - Get notes by module
- `GET /api/notes/:id` - Get single note
- `POST /api/notes/upload` - Upload new note (requires auth)
- `GET /api/notes/download/:id` - Download note
- `GET /api/notes/search?q=query` - Search notes
- `GET /api/notes/filter` - Filter notes by semester/module/tags

### Other
- `GET /api/semesters` - Get all semesters
- `GET /api/health` - Health check endpoint

## Testing the API

You can test the authentication endpoints using curl or any API client:

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get current user (with token):
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
mi_notes_backend/
├── middleware/
│   └── auth.js          # Authentication middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── modules.js       # Module routes
│   └── notes.js         # Note routes
├── uploads/             # Uploaded files directory
├── .env                 # Environment variables
├── database.sql         # Database schema
├── package.json         # Dependencies
├── server.js            # Main server file
└── README.md           # Documentation
```

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- File uploads are restricted to specific file types
- CORS is configured for the frontend application

## Environment Variables

- `PORT` - Server port (default: 5000)
- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time (default: 7d)
- `NODE_ENV` - Environment (development/production)