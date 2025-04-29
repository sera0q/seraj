const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static('public')); // put your pages inside a folder called "public"

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // welcome page
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
