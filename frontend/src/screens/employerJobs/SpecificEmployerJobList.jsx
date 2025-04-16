import React, { useState, useEffect } from "react";
import { Snackbar, Alert, IconButton as MuiIconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const JobListTitle = () => (
  <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
    Company Job Listings
  </div>
);

const handleJobClick = (jobId, navigate) => {
  navigate(`/specific_employer_editjobs/${jobId}`);
};

const renderCell = (value, tableMeta, navigate) => {
  const columnIndex = tableMeta.columnIndex;
  return columnIndex === 0 ? (
    <div
      style={{ color: "#007BFF", cursor: "pointer" }}
      onClick={() => handleJobClick(tableMeta.rowData[1], navigate)}
    >
      {value}
    </div>
  ) : (
    <div>{value}</div>
  );
};

const CustomToolbar = ({ navigate }) => (
  <MuiIconButton onClick={() => navigate("/specific_employer_addjobs")}>
    <AddIcon />
  </MuiIconButton>
);

const createColumns = (navigate, onDeleteClick) => [
  { name: "job_title", label: "Title", options: { customBodyRender: (value, tableMeta) => renderCell(value, tableMeta, navigate) } },
  { name: "id", label: "Job ID", options: { display: false } },
  { name: "location", label: "Location" },
  { name: "job_type", label: "Type" },
  { name: "salary_min", label: "Min Salary" },
  { name: "salary_max", label: "Max Salary" },
  { name: "experience_level", label: "Experience" },
  { name: "education_level", label: "Education" },
  { name: "industry", label: "Industry" },
  {
    name: "Actions",
    label: "",
    options: {
      customBodyRenderLite: (dataIndex, rowIndex) => (
        <MuiIconButton onClick={() => onDeleteClick(dataIndex)}>
          <DeleteIcon color="error" />
        </MuiIconButton>
      ),
    },
  },
];

const createOptions = (navigate) => ({
  selectableRows: "none",
  download: false,
  print: false,
  viewColumns: true,
  rowsPerPage: 5,
  rowsPerPageOptions: [5, 10, 20],
  customToolbar: () => <CustomToolbar navigate={navigate} />,
});

const SpecificEmployerJobList = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [jobList, setJobList] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJobIndex, setSelectedJobIndex] = useState(null);

  const fetchJobs = () => {
    axios.get(`/api/jobs/company/${user.id}`)
      .then((res) => setJobList(res.data))
      .catch((err) => {
        console.error("Failed to load jobs", err);
        setSnackbar({ open: true, message: "Failed to load jobs.", severity: "error" });
      });
  };

  useEffect(() => {
    fetchJobs();
  }, [user.id]);

  const handleDeleteClick = (index) => {
    setSelectedJobIndex(index);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const jobId = jobList[selectedJobIndex].id;
      await axios.delete(`/api/jobs/company/${jobId}`);
      setSnackbar({ open: true, message: "Job deleted successfully.", severity: "success" });
      setConfirmOpen(false);
      fetchJobs();
    } catch (error) {
      console.error("Failed to delete job", error);
      setSnackbar({ open: true, message: "Failed to delete job.", severity: "error" });
      setConfirmOpen(false);
    }
  };

  const columns = createColumns(navigate, handleDeleteClick);
  const options = createOptions(navigate);

  return (
    <>
      <MUIDataTable
        title={<JobListTitle />}
        data={jobList}
        columns={columns}
        options={options}
      />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this job?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SpecificEmployerJobList;
