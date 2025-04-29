import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
