const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, email, student_id, access_code } = req.body;

  const codesPath = path.join(__dirname, '../data/accessCodes.json');
  const codes = JSON.parse(fs.readFileSync(codesPath, 'utf-8'));

  const match = codes.find(c =>
    c.code === access_code && c.student_id === student_id && !c.used
  );

  if (match) {
    // Mark as used
    match.used = true;
    fs.writeFileSync(codesPath, JSON.stringify(codes, null, 2));

    // Redirect to test
    return res.redirect('/test.html'); // Create this page later
  }

  return res.send('Invalid or already used code.');
});

module.exports = router;
