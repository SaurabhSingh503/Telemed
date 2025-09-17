/* eslint-disable no-unused-vars */
// Pharmacy list component for displaying search results
// Shows pharmacy details with contact and location information
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  LocalPharmacy as PharmacyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Navigation as DirectionsIcon,
  CheckCircle as AvailableIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const PharmacyList = ({ pharmacies, userPosition, onGetDirections }) => {
  
  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const formatDistance = (pharmacy) => {
    if (!userPosition || !pharmacy.latitude || !pharmacy.longitude) {
      return null;
    }
    
    const distance = calculateDistance(
      userPosition.latitude,
      userPosition.longitude,
      parseFloat(pharmacy.latitude),
      parseFloat(pharmacy.longitude)
    );
    
    return distance < 1 ? 
      `${(distance * 1000).toFixed(0)}m` : 
      `${distance.toFixed(1)}km`;
  };

  const formatOpeningHours = (hours) => {
    if (!hours) return 'Hours not available';
    
    try {
      const hoursObj = typeof hours === 'string' ? JSON.parse(hours) : hours;
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayHours = hoursObj[days[today]];
      
      return todayHours || 'Closed today';
    } catch (e) {
      return 'Hours not available';
    }
  };

  const getMedicines = (medicines) => {
    if (!medicines) return [];
    
    try {
      const medicinesArray = typeof medicines === 'string' ? JSON.parse(medicines) : medicines;
      return Array.isArray(medicinesArray) ? medicinesArray.slice(0, 5) : [];
    } catch (e) {
      return [];
    }
  };

  if (!pharmacies || pharmacies.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <PharmacyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No pharmacies found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search criteria or location.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Found {pharmacies.length} Pharmacies
      </Typography>
      
      <Grid container spacing={3}>
        {pharmacies.map((pharmacy, index) => (
          <Grid item xs={12} md={6} key={pharmacy.id || index}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent>
                {/* Pharmacy Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <PharmacyIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {pharmacy.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      {pharmacy.isOpen24Hours && (
                        <Chip
                          label="24 Hours"
                          size="small"
                          color="success"
                          icon={<TimeIcon />}
                        />
                      )}
                      
                      {formatDistance(pharmacy) && (
                        <Chip
                          label={formatDistance(pharmacy)}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Address */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📍 {pharmacy.address}
                </Typography>

                {/* Contact Information */}
                <Box sx={{ mb: 2 }}>
                  {pharmacy.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <a href={`tel:${pharmacy.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {pharmacy.phone}
                        </a>
                      </Typography>
                    </Box>
                  )}
                  
                  {pharmacy.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <a href={`mailto:${pharmacy.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {pharmacy.email}
                        </a>
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Opening Hours */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Today: {formatOpeningHours(pharmacy.openingHours)}
                    </Typography>
                  </Box>
                </Box>

                {/* Available Medicines */}
                {getMedicines(pharmacy.medicines).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AvailableIcon sx={{ fontSize: 16 }} color="success" />
                      Available Medicines
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {getMedicines(pharmacy.medicines).map((medicine, idx) => (
                        <Chip
                          key={idx}
                          label={typeof medicine === 'object' ? medicine.name : medicine}
                          size="small"
                          variant="outlined"
                          color="success"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {pharmacy.phone && (
                    <Button
                      size="small"
                      startIcon={<PhoneIcon />}
                      href={`tel:${pharmacy.phone}`}
                      variant="outlined"
                    >
                      Call
                    </Button>
                  )}
                  
                  <Button
                    size="small"
                    startIcon={<DirectionsIcon />}
                    onClick={() => onGetDirections(pharmacy)}
                    variant="contained"
                  >
                    Directions
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PharmacyList;
