const pool = require('./connect');
const util = require('util');

const databaseName = 'AI-powered-talent-matching-lixwyk';

function initDatabase() {
  pool.getConnection((err, connection) => {
    if (err) return console.error('❌ Failed to get connection from pool:', err);

    connection.query(`SHOW DATABASES LIKE '${databaseName}'`, (err, results) => {
      if (err) {
        connection.release();
        return console.error('❌ Failed to check database:', err);
      }

      const dbExists = results.length > 0;

      if (!dbExists) {
        console.log('📦 Database does not exist. Creating and initializing...');
        connection.query(`CREATE DATABASE \`${databaseName}\``, (err) => {
          if (err) {
            connection.release();
            return console.error('❌ Failed to create database:', err);
          }

          console.log('✅ Database created.');

          connection.changeUser({ database: databaseName }, async (err) => {
            if (err) {
              connection.release();
              return console.error('❌ Failed to switch database:', err);
            }

            try {
              await createTablesAndData(connection);
            } catch (error) {
              console.error('❌ Error during table creation/data insertion:', error);
            } finally {
              connection.release();
            }
          });
        });
      } else {
        connection.changeUser({ database: databaseName }, async (err) => {
          if (err) {
            connection.release();
            return console.error('❌ Failed to switch to existing database:', err);
          }
          console.log('✅ Switched to existing database.');

          try {
            await createTablesAndData(connection);
          } catch (error) {
            console.error('❌ Error during table creation/data insertion:', error);
          } finally {
            connection.release();
          }
        });
      }
    });
  });
}

async function createTablesAndData(conn) {
  const query = util.promisify(conn.query).bind(conn);

  const createTableQueries = [
    `CREATE TABLE IF NOT EXISTS employers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(100),
      password VARCHAR(100),
      company_name VARCHAR(100)
    )`,
    `CREATE TABLE IF NOT EXISTS candidates (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(100),
      password VARCHAR(100),
      skills TEXT,
      experience INT,
      location VARCHAR(100)
    )`,
    `CREATE TABLE IF NOT EXISTS jobs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      employer_id INT,
      job_title VARCHAR(100),
      job_description TEXT,
      location VARCHAR(100),
      job_type ENUM('Full-time', 'Part-time', 'Contract', 'Internship'),
      salary_min INT,
      salary_max INT,
      experience_level ENUM('Entry', 'Mid', 'Senior'),
      skills_required TEXT,
      education_level VARCHAR(100),
      industry VARCHAR(100),
      posted_date DATETIME,
      application_deadline DATETIME,
      status ENUM('Open', 'Closed'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS resumes (
      id INT PRIMARY KEY,
      candidate_id INT,
      phone VARCHAR(20),
      email VARCHAR(100),
      summary TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS resume_education (
      id INT PRIMARY KEY AUTO_INCREMENT,
      resume_id INT,
      school VARCHAR(100),
      degree VARCHAR(100),
      major VARCHAR(100),
      start_date DATE,
      end_date DATE
    )`,
    `CREATE TABLE IF NOT EXISTS resume_experience (
      id INT PRIMARY KEY AUTO_INCREMENT,
      resume_id INT,
      company VARCHAR(100),
      title VARCHAR(100),
      start_date DATE,
      end_date DATE,
      description TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS resume_skills (
      id INT PRIMARY KEY AUTO_INCREMENT,
      resume_id INT,
      skill_name VARCHAR(100),
      proficiency ENUM('Beginner', 'Intermediate', 'Advanced')
    )`,
    `CREATE TABLE IF NOT EXISTS conversations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      bot_name VARCHAR(100),
      user_role ENUM('candidate', 'employer'),
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS messages_careerbot (
      id INT PRIMARY KEY AUTO_INCREMENT,
      conversation_id INT,
      type ENUM('send', 'receive'),
      content TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS messages_skillbot (
      id INT PRIMARY KEY AUTO_INCREMENT,
      conversation_id INT,
      type ENUM('send', 'receive'),
      content TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS messages_matchbot (
      id INT PRIMARY KEY AUTO_INCREMENT,
      conversation_id INT,
      type ENUM('send', 'receive'),
      content TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS messages_jobwriterbot (
      id INT PRIMARY KEY AUTO_INCREMENT,
      conversation_id INT,
      type ENUM('send', 'receive'),
      content TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )`
  ];

  for (const sql of createTableQueries) {
    await query(sql);
  }

  const result = await query(`SELECT COUNT(*) AS count FROM employers`);
  if (result[0].count > 0) {
    console.log('✅ Sample data already exists. Skipping inserts.');
    return;
  }

  console.log('📥 Inserting sample data...');

  const employers = [
    ['employer1', 'pass123', 'HealthTech AI'],
    ['employer2', 'pass234', 'GreenData Solutions'],
    ['employer3', 'pass345', 'NeuralCloud Inc'],
    ['employer4', 'pass456', 'CyberNet AI'],
    ['employer5', 'pass567', 'FinWise Analytics']
  ];
  await query(`INSERT INTO employers (username, password, company_name) VALUES ?`, [employers]);

  const skillsPool = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'AI', 'ML', 'Data Science', 'DevOps', 'Vue'];
  const locations = ['Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Ottawa'];
  const candidates = [];

  for (let i = 1; i <= 30; i++) {
    const username = `candidate${i}`;
    const password = `pwd${1000 + i}`;
    const selectedSkills = skillsPool.sort(() => 0.5 - Math.random()).slice(0, 3).join(', ');
    const experience = Math.floor(Math.random() * 10) + 1;
    const location = locations[Math.floor(Math.random() * locations.length)];
    candidates.push([username, password, selectedSkills, experience, location]);
  }
  await query(`INSERT INTO candidates (username, password, skills, experience, location) VALUES ?`, [candidates]);

  const jobTitles = [
    ['AI Researcher', 'Looking for AI specialist with ML/NLP experience.', 'Remote', 'Full-time', 90000, 120000, 'Senior', ['Machine Learning', 'NLP', 'Python'], 'Master', 'Tech'],
    ['Full Stack Engineer', 'React & Node.js developer needed for web apps.', 'Toronto', 'Full-time', 75000, 100000, 'Mid', ['React', 'Node.js', 'MongoDB'], 'Bachelor', 'Tech'],
    ['Data Analyst', 'Work with large datasets and SQL queries.', 'Vancouver', 'Full-time', 65000, 90000, 'Entry', ['SQL', 'Excel', 'Python'], 'Bachelor', 'Finance'],
    ['DevOps Engineer', 'Cloud CI/CD automation experience preferred.', 'Remote', 'Contract', 80000, 110000, 'Mid', ['AWS', 'Docker', 'CI/CD'], 'Bachelor', 'Tech'],
    ['Frontend Developer', 'Vue/React skills required.', 'Calgary', 'Full-time', 70000, 95000, 'Mid', ['Vue.js', 'React', 'HTML/CSS'], 'Bachelor', 'Tech'],
    ['Backend Engineer', 'Build scalable APIs with Node.js.', 'Remote', 'Full-time', 80000, 110000, 'Mid', ['Node.js', 'Express', 'PostgreSQL'], 'Bachelor', 'Tech'],
    ['Security Engineer', 'Cybersecurity experience required.', 'Ottawa', 'Full-time', 90000, 125000, 'Senior', ['Cybersecurity', 'Penetration Testing', 'Firewalls'], 'Bachelor', 'Tech'],
    ['Data Scientist', 'Experience with pandas, scikit-learn, Python.', 'Toronto', 'Full-time', 95000, 130000, 'Senior', ['pandas', 'scikit-learn', 'Python'], 'Master', 'Healthcare'],
    ['Software Tester', 'Manual and automated testing.', 'Montreal', 'Part-time', 50000, 70000, 'Entry', ['Selenium', 'Test Cases', 'JIRA'], 'Bachelor', 'Tech'],
    ['Cloud Architect', 'AWS, GCP or Azure certification is a plus.', 'Remote', 'Full-time', 110000, 150000, 'Senior', ['AWS', 'GCP', 'Azure'], 'Master', 'Tech']
  ];

  const jobs = jobTitles.map((job, index) => [
    (index % 5) + 1,
    job[0], job[1], job[2], job[3], job[4], job[5], job[6],
    JSON.stringify(job[7]), job[8], job[9],
    new Date(), new Date(new Date().setMonth(new Date().getMonth() + 1)), 'Open'
  ]);
  await query(`INSERT INTO jobs (
    employer_id, job_title, job_description, location, job_type, salary_min, salary_max,
    experience_level, skills_required, education_level, industry, posted_date, application_deadline, status
  ) VALUES ?`, [jobs]);

  const resumes = [];
  const eduEntries = [];
  const expEntries = [];
  const skillEntries = [];
  const skillSet = ['Python', 'React', 'SQL', 'Node.js', 'Java'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  for (let i = 1; i <= 30; i++) {
    const resumeId = i;
    resumes.push([resumeId, i, `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      `candidate${i}@mail.com`, `A passionate candidate with ${Math.floor(Math.random() * 8 + 1)} years of experience.`]);

    eduEntries.push([resumeId, 'University of Toronto', 'Bachelor', 'Computer Science', '2015-09-01', '2019-06-30']);
    eduEntries.push([resumeId, 'University of Waterloo', 'Master', 'Data Science', '2020-09-01', '2022-06-30']);

    expEntries.push([resumeId, 'TechCorp', 'Software Engineer', '2020-01-01', '2021-12-31', 'Worked on enterprise projects.']);
    expEntries.push([resumeId, 'DataWorks', 'Full Stack Developer', '2022-01-01', '2023-12-31', 'Built scalable systems.']);

    for (let j = 0; j < 3; j++) {
      const skill = skillSet[Math.floor(Math.random() * skillSet.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      skillEntries.push([resumeId, skill, level]);
    }
  }

  await query(`INSERT INTO resumes (id, candidate_id, phone, email, summary) VALUES ?`, [resumes]);
  await query(`INSERT INTO resume_education (resume_id, school, degree, major, start_date, end_date) VALUES ?`, [eduEntries]);
  await query(`INSERT INTO resume_experience (resume_id, company, title, start_date, end_date, description) VALUES ?`, [expEntries]);
  await query(`INSERT INTO resume_skills (resume_id, skill_name, proficiency) VALUES ?`, [skillEntries]);

  console.log('✅ Sample data inserted.');
}

module.exports = initDatabase;
