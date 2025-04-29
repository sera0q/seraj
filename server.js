import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Serve static files from the 'public' folder
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Root route - Display a message or serve an HTML page
app.get('/', (req, res) => {
  res.send('Welcome to Cambright Placement Test!');
  // Alternatively, you can serve an HTML file like:
  // res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
