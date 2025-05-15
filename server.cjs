// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL DB setup
const pool = new Pool({
  connectionString: 'postgresql://cambright_placement_test_user:r2IxteLFmQi3h32iVMMtIAAWON7QolAa@dpg-d0i45va4d50c73b334gg-a.singapore-postgres.render.com/cambright_placement_test',
  ssl: { rejectUnauthorized: false },
});



// Cloudinary setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

// Ensure tables exist
async function setupTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS codes (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name TEXT,
      passport TEXT,
      email TEXT,
      code_used TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id),
      mcq_score INTEGER,
      writing_answer TEXT,
      video_url TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
setupTables();

// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

// ROUTES

// Generate a 6-digit code
app.post('/generate-code', async (req, res) => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
  await pool.query('INSERT INTO codes (code, expires_at) VALUES ($1, $2)', [code, expiresAt]);
  res.json({ code, expiresAt });
});

// Validate Code
app.get('/validate-code/:code', async (req, res) => {
  const { code } = req.params;
  const result = await pool.query('SELECT * FROM codes WHERE code = $1 AND expires_at > NOW()', [code]);
  if (result.rows.length > 0) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

// Submit Exam Data
app.post('/submit', upload.single('video'), async (req, res) => {
  const { name, passport, email, code, mcq_score, writing_answer } = req.body;
  const videoPath = req.file.path;

  try {
    const uploadResult = await cloudinary.uploader.upload(videoPath, {
      resource_type: 'video',
      folder: 'cambright_videos',
      public_id: uuidv4(),
    });
    fs.unlinkSync(videoPath);

    const studentRes = await pool.query(
      'INSERT INTO students (name, passport, email, code_used) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, passport, email, code]
    );

    const studentId = studentRes.rows[0].id;

    await pool.query(
      'INSERT INTO results (student_id, mcq_score, writing_answer, video_url) VALUES ($1, $2, $3, $4)',
      [studentId, mcq_score, writing_answer, uploadResult.secure_url]
    );

    res.status(200).json({ message: 'Submission saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Submission failed.' });
  }
});

// Get all submissions for admin
app.get('/submissions', async (req, res) => {
  const result = await pool.query(`
    SELECT students.name, students.email, students.passport, results.mcq_score,
           results.writing_answer, results.video_url
    FROM students
    JOIN results ON students.id = results.student_id
    ORDER BY students.created_at DESC
  `);
  res.json(result.rows);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

pool.query('SELECT NOW()')
  .then(res => console.log('DB connected at:', res.rows[0].now))
  .catch(err => console.error('DB connection error:', err));
