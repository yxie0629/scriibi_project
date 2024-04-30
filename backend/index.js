import express from 'express';
import session from 'express-session';
import crypto from 'crypto';
import { createDbConnection } from "./createDbConnection.js";

const app = express();
const port = process.env.PORT || 3000;

// Generate a random buffer
const randomBuffer = crypto.randomBytes(32);
// Convert the buffer to a hexadecimal string
const randomString = randomBuffer.toString('hex');

// Configure express-session middleware
app.use(session({
  secret: randomString,
  resave: false,
  saveUninitialized: true
}));

// Define routes
app.get('/list_assessments', (req, res) => {
  res.send('Hello World!');
  try {
    
    const teacherId = req.session.teacherId;
    if (teacherId) {
      // Teacher is logged in, do something with the ID
      res.send(`Teacher ID: ${teacherId}`);
      
    // Get the current year
    const currentYear = new Date().getFullYear();
    const sql =  `WHERE ClinicCode = '${clinicCode}'`;
    const db = createDbConnection();
    db.query(sql);
    } else {
      // Teacher is not logged in
      res.status(401).send('Unauthorized');
    }
  } catch (error) {

  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
