import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Grid, TextField, Typography, Select,
  MenuItem, Snackbar, Alert, FormControl, InputLabel
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const JobForm = ({ initialData = {}, onSubmit, isEdit }) => {
  const [formData, setFormData] = useState({
    job_title: '',
    job_description: '',
    location: '',
    job_type: '',
    salary_min: '',
    salary_max: '',
    experience_level: '',
    education_level: '',
    industry: '',
    application_deadline: null,
    status: 'Open',
    skills_required: [],
    ...initialData
  });

  const [newSkill, setNewSkill] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'salary_min' || name === 'salary_max') && !/^\d*$/.test(value)) {
      setErrors(prev => ({ ...prev, [name]: 'Must be a valid number' }));
      setFormData(prev => ({ ...prev, [name]: '' }));
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };
        if (name === 'salary_min' || name === 'salary_max') {
          const min = parseInt(updated.salary_min) || 0;
          const max = parseInt(updated.salary_max) || 0;
          if (updated.salary_min !== '' && updated.salary_max !== '' && max < min) {
            setErrors(prevErrors => ({ ...prevErrors, salary_max: 'Max salary must be greater than or equal to min salary' }));
          } else {
            setErrors(prevErrors => ({ ...prevErrors, salary_max: null }));
          }
        }
        return updated;
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({ 
      ...formData, 
      application_deadline: date ? dayjs(date).format('YYYY-MM-DD') : '' 
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills_required.includes(newSkill.trim())) {
      setFormData({ 
        ...formData, 
        skills_required: [...formData.skills_required, newSkill.trim()] 
      });
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (index) => {
    const updated = [...formData.skills_required];
    updated.splice(index, 1);
    setFormData({ ...formData, skills_required: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const salaryMin = parseInt(formData.salary_min) || 0;
    const salaryMax = parseInt(formData.salary_max) || 0;
    if (salaryMax < salaryMin) {
      setErrors(prev => ({ ...prev, salary_max: 'Max salary must be greater than or equal to min salary' }));
      return;
    }
    const payload = {
      ...formData,
      salary_min: salaryMin,
      salary_max: salaryMax,
    };
    onSubmit(payload, setSnackbar);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Job Basic Info</Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <TextField
                name="job_title"
                label="Job Title"
                fullWidth
                required
                inputProps={{ maxLength: 100 }}
                value={formData.job_title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  label="Location"
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="Onsite">Onsite</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  label="Job Type"
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  label="Experience Level"
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  <MenuItem value="Entry">Entry Level</MenuItem>
                  <MenuItem value="Mid">Mid Level</MenuItem>
                  <MenuItem value="Senior">Senior Level</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={4} sx={{ mt: 4 }}>
          <TextField
                name="job_description"
                label="Job Description"
                fullWidth
                multiline
                rows={4}
                required
                value={formData.job_description}
                onChange={handleChange}
              />
          </Grid>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="salary_min"
                label="Min Salary"
                type="text"
                fullWidth
                required
                value={formData.salary_min}
                onChange={handleChange}
                error={!!errors.salary_min}
                helperText={errors.salary_min || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="salary_max"
                label="Max Salary"
                type="text"
                fullWidth
                required
                value={formData.salary_max}
                onChange={handleChange}
                error={!!errors.salary_max}
                helperText={errors.salary_max || ''}
              />
            </Grid>
          </Grid>


          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12}>
              <TextField
                name="education_level"
                label="Education Level"
                fullWidth
                required
                value={formData.education_level}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="industry"
                label="Industry"
                fullWidth
                required
                value={formData.industry}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                <DatePicker
                  label="Application Deadline"
                  value={formData.application_deadline ? dayjs(formData.application_deadline) : null}
                  onChange={handleDateChange}
                  format="YYYY-MM-DD"
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Skills Required</Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={10}>
              <TextField
                fullWidth
                label="Add Skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              <Button variant="outlined" onClick={handleAddSkill}>
                <Add />
              </Button>
            </Grid>
          </Grid>
          <Box mt={4}>
            {formData.skills_required.map((skill, index) => (
              <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={11}>
                  <TextField fullWidth value={skill} disabled />
                </Grid>
                <Grid item xs={1}>
                  <Button color="error" onClick={() => handleDeleteSkill(index)}>
                    <Delete />
                  </Button>
                </Grid>
              </Grid>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {isEdit ? 'Update Job' : 'Create Job'}
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

export default JobForm;
