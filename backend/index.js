import express from 'express';
import session from 'express-session';
import crypto from 'crypto';
import moment from 'moment-timezone';
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

let teacherId;

// Define routes
app.get('/list_assessments', (req, res) => {
  try {
    const db = createDbConnection();
    try {
      //retrieve teacher id from session
      teacherId = req.session.teacherId;
      teacherId = 111; //for testing
      if (teacherId) {
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
          where year = "${currentYear}");`;

        db.query(sql, (error, results) => {
          if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }

          // Convert TaskDate format to Melbourne timezone and format it as 'YYYY-MM-DD'
          results.forEach(result => {
            result.TaskDate = moment(result.TaskDate).tz('Australia/Melbourne').format('YYYY-MM-DD');
          });

          console.log('Query results:', results);
          res.status(200).json(results);
        });

      } else {
        // Teacher is not logged in
        res.status(401).json({ error: 'Unauthorized user' });
      }
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
  try {
    teacherId = 111; //for testing
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
      db.query(sql, (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        // Convert TaskDate format to Melbourne timezone and format it as 'YYYY-MM-DD'
        results.forEach(result => {
          result.TaskDate = moment(result.TaskDate).tz('Australia/Melbourne').format('YYYY-MM-DD');
        });

        console.log('Query results:', results);
        res.status(200).json(results);
      });
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

let classId;
let writingTaskId;
app.post('/list_students', (req, res) => {
  try {
    const db = createDbConnection();
    try {
      //get class_id and writing_task_id from frontend
      classId = req.query.class_id;
      writingTaskId = req.query.writing_task_id;

      const sql = `
        select CONCAT(s.first_name, ", ", s.last_name) as full_name, wts.student_id, count(wp.url) as number_of_uploaded_files
        from writing_task_student as wts
        left join student as s on wts.student_id = s.id
        left join writing_piece as wp on wp.writing_task_student_id = wts.id
        where wts.writing_task_id = ${writingTaskId}
        and s.id in 
          (select student_id 
            from student_class 
            where class_id = ${classId})
        group by wts.student_id
        order by s.first_name, s.last_name;`;

      db.query(sql, (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        console.log('Query results:', results);
        res.status(200).json(results);
      });

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

app.post('/search_by_student_name', (req, res) => {
  try {
    const db = createDbConnection();
    try {
      //get user input
      let studentName = req.query.student_name;

      const sql = `
        select CONCAT(s.first_name, ", ", s.last_name) as full_name, wts.student_id, count(wp.url) as number_of_uploaded_files
        from writing_task_student as wts
        left join student as s on wts.student_id = s.id
        left join writing_piece as wp on wp.writing_task_student_id = wts.id
        where wts.writing_task_id = ${writingTaskId}
        and s.id in 
          (select student_id 
            from student_class 
            where class_id = ${classId})
        and lower(CONCAT(s.first_name, ", ", s.last_name)) like lower("%${studentName}%")
        group by wts.student_id
        order by s.first_name, s.last_name;`;

      db.query(sql, (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        console.log('Query results:', results);
        res.status(200).json(results);
      });

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

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
