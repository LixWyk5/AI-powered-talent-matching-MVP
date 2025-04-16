import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, TextField, Typography, Select, MenuItem, IconButton, Snackbar, Alert } from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import axios from 'axios';

const CandidateResumeEdit = () => {
  const [resume, setResume] = useState({});
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [deleted, setDeleted] = useState({ educationIds: [], experienceIds: [], skillIds: [] });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get(`/api/resumes/${user.id}`)
      .then(res => {
        setResume(res.data.resume);
        setEducation(res.data.education);
        setExperience(res.data.experience);
        setSkills(res.data.skills);
      })
      .catch(err => {
        console.error("Failed to load resume", err);
        setSnackbar({ open: true, message: 'Resume not found for this candidate.', severity: 'error' });
      });
  }, [user.id]);

  const handleDelete = (i, type) => {
    const update = (setFn, list, idListName) => {
      const item = list[i];
      if (item.id) setDeleted(prev => ({ ...prev, [idListName]: [...prev[idListName], item.id] }));
      const newList = [...list];
      newList.splice(i, 1);
      setFn(newList);
    };
    if (type === 'edu') update(setEducation, education, 'educationIds');
    if (type === 'exp') update(setExperience, experience, 'experienceIds');
    if (type === 'skill') update(setSkills, skills, 'skillIds');
  };

  const handleAddEducation = () => setEducation([...education, { school: '', degree: '', major: '' }]);
  const handleAddExperience = () => setExperience([...experience, { company: '', title: '', description: '' }]);
  const handleAddSkill = () => setSkills([...skills, { skill_name: '', proficiency: '' }]);

  const handleResumeChange = (e) => setResume({ ...resume, [e.target.name]: e.target.value });
  const handleEduChange = (i, e) => {
    const newEdu = [...education];
    newEdu[i][e.target.name] = e.target.value;
    setEducation(newEdu);
  };
  const handleExpChange = (i, e) => {
    const newExp = [...experience];
    newExp[i][e.target.name] = e.target.value;
    setExperience(newExp);
  };
  const handleSkillChange = (i, e) => {
    const newSkills = [...skills];
    newSkills[i][e.target.name] = e.target.value;
    setSkills(newSkills);
  };

  const handleSubmit = () => {
    axios.post(`/api/resumes/${user.id}/update`, { resume, education, experience, skills, deleted })
      .then(() => {
        setSnackbar({
          open: true,
          message: 'Resume saved successfully. Page will reload in 4 seconds.',
          severity: 'success'
        });
        setTimeout(() => window.location.reload(), 4000);
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: 'Failed to save resume.',
          severity: 'error'
        });
      });
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Card sx={{ mb: 4 }}><CardContent>
        <Typography variant="h6">Basic Info</Typography>
        <TextField name="phone" label="Phone" fullWidth margin="normal" value={resume.phone || ''} onChange={handleResumeChange} />
        <TextField name="email" label="Email" fullWidth margin="normal" value={resume.email || ''} onChange={handleResumeChange} />
        <TextField name="summary" label="Summary" fullWidth margin="normal" multiline rows={3} value={resume.summary || ''} onChange={handleResumeChange} />
      </CardContent></Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Education</Typography>
            <IconButton color="primary" onClick={handleAddEducation}><Add /></IconButton>
          </Box>
          {education.map((edu, i) => (
            <Grid container spacing={2} key={i} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={6}><TextField name="school" label="School" fullWidth value={edu.school} onChange={(e) => handleEduChange(i, e)} /></Grid>
              <Grid item xs={3}><TextField name="degree" label="Degree" fullWidth value={edu.degree} onChange={(e) => handleEduChange(i, e)} /></Grid>
              <Grid item xs={2}><TextField name="major" label="Major" fullWidth value={edu.major} onChange={(e) => handleEduChange(i, e)} /></Grid>
              <Grid item xs={1}><IconButton color="error" onClick={() => handleDelete(i, 'edu')}><Delete /></IconButton></Grid>
            </Grid>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Experience</Typography>
            <IconButton color="primary" onClick={handleAddExperience}><Add /></IconButton>
          </Box>
          {experience.map((exp, i) => (
            <Grid container spacing={2} key={i} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={6}><TextField name="company" label="Company" fullWidth value={exp.company} onChange={(e) => handleExpChange(i, e)} /></Grid>
              <Grid item xs={5}><TextField name="title" label="Title" fullWidth value={exp.title} onChange={(e) => handleExpChange(i, e)} /></Grid>
              <Grid item xs={1}><IconButton color="error" onClick={() => handleDelete(i, 'exp')}><Delete /></IconButton></Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={exp.description}
                  onChange={(e) => handleExpChange(i, e)}
                />
              </Grid>
            </Grid>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Skills</Typography>
            <IconButton color="primary" onClick={handleAddSkill}><Add /></IconButton>
          </Box>
          {skills.map((s, i) => (
            <Grid container spacing={2} key={i} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={5}><TextField name="skill_name" label="Skill" fullWidth value={s.skill_name} onChange={(e) => handleSkillChange(i, e)} /></Grid>
              <Grid item xs={6}>
                <Select name="proficiency" fullWidth value={s.proficiency} onChange={(e) => handleSkillChange(i, e)}>
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={1}><IconButton color="error" onClick={() => handleDelete(i, 'skill')}><Delete /></IconButton></Grid>
            </Grid>
          ))}
        </CardContent>
      </Card>

      {/* Button placed at the bottom right of the normal content flow */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save Resume
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidateResumeEdit;
