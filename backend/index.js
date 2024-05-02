import express from 'express';
import session from 'express-session';
import crypto from 'crypto';
import { createDbConnection } from "./createDbConnection.js";

const app = express();
const port = process.env.PORT || 3000;
// app.use(express.json());

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


// Get the current year
const currentYear = new Date().getFullYear();

// Define routes
app.get('/list_assessments', (req, res) => {
  try {
    const db = createDbConnection();
    try {
      //retrieve teacher id from session
      let teacherId = req.session.teacherId;
      teacherId = 209;
      // if (teacherId) {
        // const sql = `
        //   select wt.name as Title, c.name as Class, wt.assessed_date as TaskDate, wtc.class_id, wtc.writing_task_id
        //   from writing_task_class as wtc 
        //   left join writing_task as wt on wtc.writing_task_id = wt.id
        //   left join class as c on wtc.class_id = c.id
        //   where wtc.class_id in
        //     (select class_id
        //     from teacher_class
        //     where teacher_id = ${teacherId} and status_flag = "active")
        //   and c.teaching_period_id in
        //     (select id
        //     from teaching_period
        //     where year = "${currentYear}");`;
        const sql = `select * from writing_task_class limit 2;`;
        // let [rows] = db.query(sql);
        let rows = db.query(sql);
        console.log(rows);
        // res.status(200).json(rows);
      // } else {
      //   // Teacher is not logged in
      //   res.status(401).json({ error: 'Unauthorized user' });
      // }
    } catch (error) {
      console.error("error:", error.message);
      res.status(500).json({ error: error.message });
    } finally {
      db.end();
    }
  } catch (error) {
    console.error("error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/search_by_ass_title', (req, res) => {
  const db = createDbConnection();
  console.log(db);
  try {
    //retrieve teacher id from session
    let teacherId = req.session.teacherId;
    teacherId = 111;
    if (teacherId) {
      // Get user input
      let title = req.query.title;
      // Split the title into an array of letters
      const letters = title.split('');
      // Map over the array of letters and add '%' between two letters
      let processedTitle = letters.map(letter => letter).join('%');
      processedTitle = '%' + processedTitle + '%';
      const sql = `
      select wt.name as Title, c.name as Class, wt.assessed_date as TaskDate, wtc.class_id, wtc.writing_task_id
      from writing_task_class as wtc 
      left join writing_task as wt on wtc.writing_task_id = wt.id
      left join class as c on wtc.class_id = c.id
      where wtc.class_id in
          (select class_id
      from teacher_class
      where teacher_id = ${teacherId} and status_flag = "active")
      and c.teaching_period_id in
          (select id
      from teaching_period
      where year = '${currentYear}')
      and lower(wt.name) like lower('${processedTitle}');`;
      
      let [rows] = db.query(sql);
      res.status(200).json(rows);
    } else {
      // Teacher is not logged in
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error("error:", error.stack);
    res.status(500).json({ error: error.stack });
  } finally {
    db.end();
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
