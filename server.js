import express from 'express';
import path from 'path'; // Correct use of 'import'

const app = express();

// Use the dynamic port that Render provides, otherwise default to 3000
const port = process.env.PORT || 3000;

// Serve static files (ensure that the 'public' folder contains your assets like HTML, CSS, JS files)
app.use(express.static('public'));  // Adjust 'public' to your actual static folder name

// Basic route to serve 'index.html'
app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serve the index.html file
});

// Additional routes for other HTML files
app.get('/exam', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'exam.html'));  // Serve the exam.html file
});

app.get('/end', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'end.html'));  // Serve the end.html file
});

app.get('/admin', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'admin.html'));  // Serve the admin.html file
});

// Example of other route (e.g., if you want to serve a specific page or JSON data)
app.get('/about', (req, res) => {
  res.send('About page content here.');
});

// Start the server and listen to the correct port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
