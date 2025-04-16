import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JobForm from './JobForm';

const SpecificEmployerEditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);

  useEffect(() => {
    axios.get(`/api/jobs/update/${jobId}`)
      .then(res => {
        const job = res.data;
        const parsedJob = {
          ...job,
          skills_required: Array.isArray(job.skills_required)
            ? job.skills_required
            : typeof job.skills_required === 'string'
              ? JSON.parse(job.skills_required)
              : []
        };
        setJobData(parsedJob);
      })
      .catch(err => {
        console.error("Failed to fetch job data", err);
        alert("Job not found or error loading data");
        navigate('/jobs');
      });
  }, [jobId, navigate]);

  const handleUpdate = async (formData, setSnackbar) => {
    try {
      await axios.put(`/api/jobs/company/${jobId}`, formData);
      setSnackbar({ open: true, message: 'Job updated successfully!', severity: 'success' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to update job.', severity: 'error' });
    }
  };

  return jobData ? (
    <JobForm initialData={jobData} onSubmit={handleUpdate} isEdit={true} />
  ) : null;
};

export default SpecificEmployerEditJob;
