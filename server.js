// Use import instead of require
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/exam', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'exam.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
