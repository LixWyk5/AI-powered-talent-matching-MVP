import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import Dashboard from './screens/Dashboard';
import EditCandidateProfile from './screens/EditCandidateProfile';
import PageLayout from './components/PageLayout/PageLayout';
import SpecificEmployerJobList from './screens/employerJobs/SpecificEmployerJobList';
import SpecificEmployerAddJobs from './screens/employerJobs/SpecificEmployerAddJobs';
import SpecificEmployerEditJob from './screens/employerJobs/SpecificEmployerEditJob';
const AppRouter = () => (
  <Routes>

<Route path="/" element={<App />} />
    <Route element={<PageLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/edit_candidate_profile" element={<EditCandidateProfile />} />
      <Route path="/specific_employer_jobs" element={<SpecificEmployerJobList />} />
      <Route path="/specific_employer_addjobs" element={<SpecificEmployerAddJobs />} />
      <Route path="/specific_employer_editjobs/:jobId" element={<SpecificEmployerEditJob />} />
    </Route>
  </Routes>
);

export default AppRouter;
