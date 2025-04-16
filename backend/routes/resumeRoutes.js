const express = require('express');
const db = require('../db/connect');
const { getFullResume, updateFullResume } = require('./tools');
const router = express.Router();

router.get('/:candidateId', (req, res) => {
  getFullResume(req.params.candidateId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      resume: {
        candidate_id: req.params.candidateId,
        summary: result.summary,
        phone: result.phone,
        email: result.email,
        id: result.resumeId
      },
      education: result.education,
      experience: result.experience,
      skills: result.skills
    });
  });
});

router.post('/:candidateId/update', (req, res) => {
  const { resume, education, experience, skills, deleted } = req.body;
  updateFullResume(resume, education, experience, skills, deleted, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(200);
  });
});

module.exports = router;
