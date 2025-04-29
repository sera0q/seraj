const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (if applicable)
app.use(express.static('public'));  // adjust 'public' to your actual static folder name

// Basic route example
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
