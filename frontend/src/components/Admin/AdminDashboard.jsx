/* eslint-disable */
// Admin dashboard for managing doctor verifications
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  School as EducationIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { apiEndpoints } from '../../services/api';

const AdminDashboard = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Load pending doctors
  const loadPendingDoctors = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getPendingVerifications();
      if (response.data.success) {
        setPendingDoctors(response.data.doctors || []);
      }
    } catch (error) {
      console.error('Error loading pending doctors:', error);
      setError('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  // Load verified doctors
  const loadVerifiedDoctors = async () => {
    try {
      const response = await apiEndpoints.getVerifiedDoctors();
      if (response.data.success) {
        setVerifiedDoctors(response.data.doctors || []);
      }
    } catch (error) {
      console.error('Error loading verified doctors:', error);
    }
  };

  useEffect(() => {
    loadPendingDoctors();
    loadVerifiedDoctors();
  }, []);

  // View doctor details
  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setViewDialog(true);
  };

  // Approve doctor
  const handleApproveDoctor = async () => {
    try {
      const response = await apiEndpoints.approveDoctorVerification(selectedDoctor.id, { notes });
      if (response.data.success) {
        setSuccess('Doctor approved successfully!');
        loadPendingDoctors();
        loadVerifiedDoctors();
        setApproveDialog(false);
        setNotes('');
      }
    } catch (error) {
      setError('Failed to approve doctor');
    }
  };

  // Reject doctor
  const handleRejectDoctor = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      const response = await apiEndpoints.rejectDoctorVerification(selectedDoctor.id, { 
        reason: rejectReason, 
        notes 
      });
      if (response.data.success) {
        setSuccess('Doctor verification rejected');
        loadPendingDoctors();
        setRejectDialog(false);
        setRejectReason('');
        setNotes('');
      }
    } catch (error) {
      setError('Failed to reject doctor');
    }
  };

  // Render document links
  const renderDocumentLinks = (documents) => {
    if (!documents || Object.keys(documents).length === 0) {
      return <Typography color="text.secondary">No documents uploaded</Typography>;
    }

    const documentTypes = {
      medicalLicense: 'Medical License',
      degreesCertificates: 'Degree Certificates',
      identityProof: 'Identity Proof',
      hospitalIdCard: 'Hospital ID'
    };

    return (
      <List dense>
        {Object.entries(documents).map(([type, doc]) => {
          if (!doc) return null;
          
          const docs = Array.isArray(doc) ? doc : [doc];
          return docs.map((document, index) => (
            <ListItem key={`${type}-${index}`} sx={{ px: 0, py: 0.5 }}>
              <ListItemIcon>
                <DocumentIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={documentTypes[type] || type}
                secondary={
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => window.open(`http://localhost:9000/${document.path || document}`, '_blank')}
                  >
                    View Document
                  </Button>
                }
              />
            </ListItem>
          ));
        })}
      </List>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="h6">
          Doctor Verification Management System
        </Typography>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Pending Verification (${pendingDoctors.length})`} />
          <Tab label={`Verified Doctors (${verifiedDoctors.length})`} />
        </Tabs>
      </Paper>

      {/* Pending Doctors Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>License Number</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingDoctors.map((doctor) => (
                <TableRow key={doctor.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doctor.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.medicalLicenseNumber}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${Object.keys(doctor.verificationDocuments || {}).length} docs`}
                      color="info" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(doctor.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleViewDoctor(doctor)}
                        color="info"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setApproveDialog(true);
                        }}
                        color="success"
                      >
                        <ApproveIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setRejectDialog(true);
                        }}
                        color="error"
                      >
                        <RejectIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Verified Doctors Tab */}
      {tabValue === 1 && (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Consultation Fee</TableCell>
                <TableCell>Verified Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {verifiedDoctors.map((doctor) => (
                <TableRow key={doctor.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doctor.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>₹{doctor.consultationFee || 500}</TableCell>
                  <TableCell>
                    {new Date(doctor.verifiedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip label="Verified" color="success" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Doctor Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Doctor Verification Details</DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2">Contact Information:</Typography>
                <Typography>Email: {selectedDoctor.email}</Typography>
                <Typography>Phone: {selectedDoctor.phone}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2">Professional Details:</Typography>
                <Typography>Specialization: {selectedDoctor.specialization}</Typography>
                <Typography>License Number: {selectedDoctor.medicalLicenseNumber}</Typography>
                <Typography>Qualification: {selectedDoctor.qualification}</Typography>
                <Typography>Experience: {selectedDoctor.experience} years</Typography>
                <Typography>Hospital: {selectedDoctor.hospitalAffiliation}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>Uploaded Documents:</Typography>
                {renderDocumentLinks(selectedDoctor.verificationDocuments)}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)}>
        <DialogTitle>Approve Doctor Verification</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Approve verification for Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleApproveDoctor}>
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)}>
        <DialogTitle>Reject Doctor Verification</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Reject verification for Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}?
          </Typography>
          <TextField
            fullWidth
            required
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Additional Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectDoctor}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
