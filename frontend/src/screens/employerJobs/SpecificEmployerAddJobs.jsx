import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JobForm from './JobForm';

const SpecificEmployerAddJobs = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleAdd = async (formData, setSnackbar) => {
    try {
      const payload = { ...formData, employer_id: user.id };
      await axios.post('/api/jobs/company/add', payload);
      setSnackbar({ open: true, message: 'Job created successfully!', severity: 'success' });
      setTimeout(() => navigate('/specific_employer_jobs'), 1000);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to create job.', severity: 'error' });
    }
  };

  return <JobForm onSubmit={handleAdd} isEdit={false} />;
};

export default SpecificEmployerAddJobs;
