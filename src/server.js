import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Serve static files (CSS, JS) from the 'public' folder
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));


// Serve your index.html, exam.html, etc. with the following routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/exam', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exam.html'));
});

app.get('/end', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'end.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
