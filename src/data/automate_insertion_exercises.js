const fs = require('fs');
const mysql = require('mysql2');

// Database connection config
const connection = mysql.createConnection({
  host: 'localhost',     // your DB host
  user: 'root',          // your DB user
  password: '2000',          // your DB password
  database: 'fitnesstracker2' // your DB name
});

// Read and parse the JSON file
const data = JSON.parse(fs.readFileSync('./exercises_with_youtube.json', 'utf8'));

// Prepare SQL Insert statement
const insertQuery = `
  INSERT INTO exercise (title, description, type, equipment, level, rating, youtube_video, body_part)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to database.');

  const bodyParts = data.exercises_by_body_part;

  let counter = 0;
  for (const [bodyPart, exercises] of Object.entries(bodyParts)) {
    exercises.forEach((exercise) => {
      const values = [
        exercise.title || null,
        exercise.description || null,
        exercise.type || null,
        exercise.equipment || null,
        exercise.level || null,
        exercise.rating || 0,
        exercise.youtube_video || null,
        bodyPart
      ];

      connection.query(insertQuery, values, (err) => {
        if (err) console.error(`Error inserting ${exercise.title}:`, err);
      });

      counter++;
    });
  }

  console.log(`Inserted ${counter} exercises.`);
  connection.end();
});
