const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Define routes
app.get('/list_assessments', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
