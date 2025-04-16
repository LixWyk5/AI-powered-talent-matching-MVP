const express = require('express');
const router = express.Router();
require('dotenv').config();
const OpenAI = require('openai');
const db = require('../db/connect');
const {
  getAllJobsAsync,
  getJobsByEmployerIdAsync,
  getAllCandidatesAsync,
  getFullResumeAsync
} = require('./tools');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const promptMap = {
  candidate: {
    careerbot: async (user, message) => {
      const jobs = await getAllJobsAsync();
      const resume = await getFullResumeAsync(user.id);

      // Construct resume context
      let context = `User Resume Summary: ${resume.summary}\n`;
      resume.education.forEach(e => context += `Education: ${e.degree} in ${e.major} from ${e.school}\n`);
      resume.experience.forEach(e => context += `Experience: ${e.title} at ${e.company} (${e.start_date} - ${e.end_date})\nDescription: ${e.description}\n`);
      resume.skills.forEach(s => context += `Skill: ${s.skill_name} (${s.proficiency})\n`);

      context += `\nAvailable Job Listings:\n`;

      jobs.forEach((job, idx) => {
        const company = job.company_name || 'Unknown Company';
        const skills = JSON.parse(job.skills_required || '[]').join(', ');
        
        context += `\n#${idx + 1}: ${job.job_title} at ${company}\n` +
          `Description: ${job.job_description}\n` +
          `Location: ${job.location} | Type: ${job.job_type} | Salary: $${job.salary_min} - $${job.salary_max}\n` +
          `Experience: ${job.experience_level} | Education: ${job.education_level} | Industry: ${job.industry}\n` +
          `Required Skills: ${skills}\n`;
      });

      return {
        system: `You are CareerBot, an intelligent and empathetic job advisor. Your job is to help users explore job opportunities that fit their background and interests. You will receive the user's resume, along with a list of available job postings and associated employer information. If the user doesn’t specify how many recommendations they want, provide 5 of the most relevant jobs.
For each recommendation, do the following:
1. Clearly state the job title and the company offering it, briefly summarize the job description and location.
2. Explain why this job matches the user's background.
3. Encourage the user with constructive, friendly tone and suggest what to do next.
Be concise, insightful, and friendly.`,
        user: `${context}\nUser message: ${message}`
      };
    },
    skillbot: async (user, message) => {
      const resume = await getFullResumeAsync(user.id);
      let context = `User Resume Summary: ${resume.summary}\n`;
      resume.education.forEach(e => context += `Education: ${e.degree} in ${e.major} from ${e.school}\n`);
      resume.experience.forEach(e => context += `Experience: ${e.title} at ${e.company} (${e.start_date} - ${e.end_date})\nDescription: ${e.description}\n`);
      resume.skills.forEach(s => context += `Skill: ${s.skill_name} (${s.proficiency})\n`);

      return {
        system: 'You are SkillBot, an intelligent and supportive skill mentor. Your goal is to help the user enhance their employability\
        \ by identifying practical skills aligned with their career goals. Carefully analyze the user’s resume,\
        \ 1. Suggest new skills to learn or improve, and explain how each one can strengthen their job prospects\
        \ 2. Explain how the user can get started\
        \Be concise, insightful, and friendly.',
        user: `${context}\nUser message: ${message}`
      };
    }
  },
  employer: {
    matchbot: async (user, message) => {
      const jobs = await getJobsByEmployerIdAsync(user.id);
      const candidates = await getAllCandidatesAsync();
    
      let context = `🧾 Employer: ${user.username}\n\n📌 Job Postings:\n`;
      jobs.forEach((job, idx) => {
        const skills = JSON.parse(job.skills_required || '[]').join(', ');
        context += `\n#${idx + 1}: ${job.job_title} at ${job.company_name || 'Unknown Company'}\n` +
          `Description: ${job.job_description}\n` +
          `Location: ${job.location} | Type: ${job.job_type} | Salary: $${job.salary_min} - $${job.salary_max}\n` +
          `Experience Level: ${job.experience_level} | Education Required: ${job.education_level} | Industry: ${job.industry}\n` +
          `Required Skills: ${skills}\n`;
      });
    
      context += `\n\n📋 Candidate Pool:\n`;
    
      for (const c of candidates) {
        context += `\n👤 Candidate: ${c.username}\n`;
        context += `Email: ${c.email} | Phone: ${c.phone}\n`;
    
        if (!c.resume) continue;
        const resume = c.resume;
    
        context += `Resume Summary: ${resume.summary}\n`;
        resume.education?.forEach(e => context += `Education: ${e.degree} in ${e.major} from ${e.school}\n`);
        resume.experience?.forEach(e => context += `Experience: ${e.title} at ${e.company} (${e.start_date} - ${e.end_date})\nDescription: ${e.description}\n`);
        resume.skills?.forEach(s => context += `Skill: ${s.skill_name} (${s.proficiency})\n`);
      }
    
      return {
        system: 'You are MatchBot, an efficient and insightful hiring assistant. Your task is to help employers find the best-fit candidates ' +
          'for their job postings. Carefully review the available job descriptions and candidate resumes.\n' +
          'For each job, do the following:\n' +
          '1. Recommend 2-3 most suitable candidates and explain why they match.\n' +
          '2. List the candidate’s name, email, and a summary of fit.\n' +
          'Use a concise, analytical, and employer-friendly tone.',
        user: `${context}\n\nUser instruction: ${message}`
      };
    },
    jobwriterbot: async (_user, message) => ({
      system: 'You are JobWriterBot, a professional and detail-oriented job description writer. Based on the user’s input,\
      \ write clear and compelling job descriptions. Ensure the responsibilities, requirements, and qualifications are aligned with the intended role.\
      \ Use industry-appropriate language, and keep the tone informative and inclusive.',
      user: message
    })
  }
};

async function fetchMessageHistory(botName, conversationId) {
  const table = botName?.toLowerCase();
  if (!table) throw new Error('Missing or invalid botName in user object');

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT type, content FROM messages_${table} WHERE conversation_id = ? ORDER BY timestamp ASC`,
      [conversationId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => ({
          role: row.type === 'send' ? 'assistant' : 'user',
          content: row.content
        })));
      }
    );
  });
}

router.post('/', async (req, res) => {
  const { message = '', role, taskType, user, conversationId } = req.body;
  console.log('[🔍 OpenAI Request Body]', req.body);

  if (!message.trim() || !role || !taskType || !user || !conversationId) {
    return res.status(400).json({ reply: 'Missing required fields.' });
  }

  try {
    const builder = promptMap?.[role]?.[taskType];
    if (!builder) return res.status(400).json({ reply: 'Invalid task type.' });

    const { system, user: userMsg } = await builder(user, message);
    const history = await fetchMessageHistory(taskType, conversationId);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: userMsg }
      ],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ reply: 'OpenAI error occurred.' });
  }
});

module.exports = router;
