import express from 'express';
import path from 'path';  // Correct use of 'import'

const app = express();
const port = process.env.PORT || 3000;

// Serve static files (adjust 'public' to your actual static folder name)
app.use(express.static('public'));

// Basic route example
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
