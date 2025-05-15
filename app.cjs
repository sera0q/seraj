const express = require('express');
const bodyParser = require('body-parser');
const verifyRoute = require('./routes/verify'); // make sure this matches your file name

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api', verifyRoute); // Now your route will be at /api/verify

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
