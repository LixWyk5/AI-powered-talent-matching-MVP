const db = require('../db/connect');

function getWelcomeMessage(botName) {
  const defaultWelcomes = {
    CareerBot: "**Hi! I'm CareerBot**, your personalized job advisor.\n\nWould you like me to suggest some job opportunities based on your profile? You can also tell me additional preferences like preferred **location**, **company type**, or **industry**.",
    SkillBot: "**Hello, I'm SkillBot!**\n\nTell me your **dream job** or direction and I'll suggest the right skills to help you get there.",
    MatchBot: "**Hi! I'm MatchBot.**\n\nI'm here to help you find the **right candidates** based on your job postings.",
    JobWriterBot: "**Hi! I'm JobWriterBot.**\n\nTell me the **role** you're hiring for and I'll help you write an **attractive job description**."
  };
  return defaultWelcomes[botName];
}

function getFullResume(candidateId, callback) {
  db.query('SELECT * FROM resumes WHERE candidate_id = ?', [candidateId], (err, resumeResults) => {
    if (err || resumeResults.length === 0) return callback(err || new Error('Resume not found'));
    const resumeId = resumeResults[0].id;
    const { summary, phone, email } = resumeResults[0];

    db.query('SELECT * FROM resume_education WHERE resume_id = ?', [resumeId], (errEdu, education) => {
      if (errEdu) return callback(errEdu);
      db.query('SELECT * FROM resume_experience WHERE resume_id = ?', [resumeId], (errExp, experience) => {
        if (errExp) return callback(errExp);
        db.query('SELECT * FROM resume_skills WHERE resume_id = ?', [resumeId], (errSkill, skills) => {
          if (errSkill) return callback(errSkill);
          return callback(null, { resumeId, summary, phone, email, education, experience, skills });
        });
      });
    });
  });
}

function getFullResumeAsync(candidateId) {
  return new Promise((resolve, reject) => {
    getFullResume(candidateId, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function updateFullResume(resume, education, experience, skills, deleted, callback) {
  const resumeId = resume.id;

  db.query('UPDATE resumes SET phone = ?, email = ?, summary = ? WHERE id = ?',
    [resume.phone, resume.email, resume.summary, resumeId], (err) => {
      if (err) return callback(err);

      education.forEach(e => {
        if (e.id) {
          db.query('UPDATE resume_education SET school=?, degree=?, major=?, start_date=?, end_date=? WHERE id=?',
            [e.school, e.degree, e.major, e.start_date, e.end_date, e.id]);
        } else {
          db.query('INSERT INTO resume_education (resume_id, school, degree, major, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
            [resumeId, e.school, e.degree, e.major, e.start_date, e.end_date]);
        }
      });

      experience.forEach(e => {
        if (e.id) {
          db.query('UPDATE resume_experience SET company=?, title=?, start_date=?, end_date=?, description=? WHERE id=?',
            [e.company, e.title, e.start_date, e.end_date, e.description, e.id]);
        } else {
          db.query('INSERT INTO resume_experience (resume_id, company, title, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
            [resumeId, e.company, e.title, e.start_date, e.end_date, e.description]);
        }
      });

      skills.forEach(s => {
        if (s.id) {
          db.query('UPDATE resume_skills SET skill_name=?, proficiency=? WHERE id=?',
            [s.skill_name, s.proficiency, s.id]);
        } else {
          db.query('INSERT INTO resume_skills (resume_id, skill_name, proficiency) VALUES (?, ?, ?)',
            [resumeId, s.skill_name, s.proficiency]);
        }
      });

      deleted.educationIds.forEach(id => {
        db.query('DELETE FROM resume_education WHERE id = ?', [id]);
      });
      deleted.experienceIds.forEach(id => {
        db.query('DELETE FROM resume_experience WHERE id = ?', [id]);
      });
      deleted.skillIds.forEach(id => {
        db.query('DELETE FROM resume_skills WHERE id = ?', [id]);
      });

      callback(null);
    });
}

function updateFullResumeAsync(resume, education, experience, skills, deleted) {
  return new Promise((resolve, reject) => {
    updateFullResume(resume, education, experience, skills, deleted, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getAllCandidates(callback) {
  db.query('SELECT id, username, skills, experience, location FROM candidates', (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

function getAllCandidatesAsync() {
  return new Promise((resolve, reject) => {
    getAllCandidates((err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function getAllJobs(callback) {
  const sql = `
    SELECT 
      jobs.id AS job_id,
      jobs.job_title,
      jobs.job_description,
      jobs.employer_id,
      employers.username AS employer_username,
      employers.company_name
    FROM jobs
    JOIN employers ON jobs.employer_id = employers.id
  `;

  db.query(sql, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}


function getAllJobsAsync() {
  return new Promise((resolve, reject) => {
    getAllJobs((err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function getJobsByEmployerId(employerId, callback) {
  db.query('SELECT * FROM jobs WHERE employer_id = ?', [employerId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

function getJobsByEmployerIdAsync(employerId) {
  return new Promise((resolve, reject) => {
    getJobsByEmployerId(employerId, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function insertJob(jobData, callback) {
  const {
    job_title,
    job_description,
    location,
    job_type,
    salary_min,
    salary_max,
    experience_level,
    education_level,
    industry,
    skills_required,
    employer_id
  } = jobData;

  const sql = `
    INSERT INTO jobs (
      job_title, job_description, location, job_type,
      salary_min, salary_max, experience_level,
      education_level, industry, skills_required, employer_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    job_title,
    job_description,
    location,
    job_type,
    salary_min,
    salary_max,
    experience_level,
    education_level,
    industry,
    JSON.stringify(skills_required || []),
    employer_id
  ];

  db.query(sql, values, (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
}

function insertJobAsync(jobData) {
  return new Promise((resolve, reject) => {
    insertJob(jobData, (err, jobId) => {
      if (err) reject(err);
      else resolve(jobId);
    });
  });
}

function getJobById(jobId, callback) {
  const sql = 'SELECT * FROM jobs WHERE id = ?';
  db.query(sql, [jobId], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(new Error('Job not found'));
    callback(null, results[0]);
  });
}

function getJobByIdAsync(jobId) {
  return new Promise((resolve, reject) => {
    getJobById(jobId, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}


function updateJob(jobId, jobData, callback) {
  const {
    job_title,
    job_description,
    location,
    job_type,
    salary_min,
    salary_max,
    experience_level,
    education_level,
    industry,
    skills_required
  } = jobData;

  const sql = `
    UPDATE jobs SET
      job_title = ?, job_description = ?, location = ?, job_type = ?,
      salary_min = ?, salary_max = ?, experience_level = ?, education_level = ?,
      industry = ?, skills_required = ?
    WHERE id = ?
  `;

  db.query(sql, [
    job_title,
    job_description,
    location,
    job_type,
    salary_min,
    salary_max,
    experience_level,
    education_level,
    industry,
    JSON.stringify(skills_required || []),
    jobId
  ], callback);
}

function updateJobAsync(jobId, jobData) {
  return new Promise((resolve, reject) => {
    updateJob(jobId, jobData, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function deleteJob(jobId, callback) {
  db.query('DELETE FROM jobs WHERE id = ?', [jobId], callback);
}

function deleteJobAsync(jobId) {
  return new Promise((resolve, reject) => {
    deleteJob(jobId, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}




module.exports = {
  getWelcomeMessage,
  getFullResume,
  getFullResumeAsync,
  updateFullResume,
  updateFullResumeAsync,
  getAllCandidates,
  getAllCandidatesAsync,
  getAllJobs,
  getAllJobsAsync,
  getJobsByEmployerId,
  getJobsByEmployerIdAsync,
  insertJob,
  insertJobAsync,
  getJobById,
  getJobByIdAsync,
  updateJob,
  updateJobAsync,
  deleteJob,
  deleteJobAsync
};