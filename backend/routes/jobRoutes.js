const express = require("express");
const router = express.Router();
const {
  getJobsByEmployerIdAsync,
  insertJobAsync,
  getJobByIdAsync,
  updateJobAsync,
  deleteJobAsync
} = require("./tools");


router.get("/company/:employerId", async (req, res) => {
  try {
    const jobs = await getJobsByEmployerIdAsync(req.params.employerId);
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});


router.post("/company/add", async (req, res) => {
  try {
    const jobId = await insertJobAsync(req.body);
    res.json({ success: true, jobId });
  } catch (error) {
    console.error("Error inserting job:", error);
    res.status(500).json({ error: "Failed to add job." });
  }
});


router.get("/update/:jobId", async (req, res) => {
  try {
    const job = await getJobByIdAsync(req.params.jobId);
    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(404).json({ error: "Job not found." });
  }
});


router.put("/company/:jobId", async (req, res) => {
  try {
    await updateJobAsync(req.params.jobId, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Failed to update job." });
  }
});


router.delete('/company/:jobId', async (req, res) => {
  try {
    await deleteJobAsync(req.params.jobId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ error: 'Failed to delete job.' });
  }
});


module.exports = router;
