/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Pharmacy finder component with geolocation support
// Helps users find nearby pharmacies and check medicine availability
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  LocalPharmacy as PharmacyIcon,
  Search as SearchIcon,
  MyLocation as LocationIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Medication as MedicineIcon,
  Navigation as DirectionsIcon
} from '@mui/icons-material';
import { useGeolocation } from '../../hooks/useGeolocation';
import { apiEndpoints } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import PharmacyList from './PharmacyList';

const PharmacyFinder = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [open24Hours, setOpen24Hours] = useState(false);
  const [error, setError] = useState('');
  
  const { position, error: locationError, loading: locationLoading, refetch } = useGeolocation();

  useEffect(() => {
    // Load pharmacies on component mount
    loadPharmacies();
  }, []);

  const loadPharmacies = async (searchParams = {}) => {
    setLoading(true);
    setError('');

    try {
      const params = {
        ...searchParams,
        ...(position && {
          lat: position.latitude,
          lng: position.longitude
        })
      };

      const response = await apiEndpoints.getPharmacies(params);
      
      if (response.data.success) {
        setPharmacies(response.data.pharmacies || []);
      } else {
        setPharmacies(response.data.pharmacies || []);
      }
    } catch (err) {
      setError('Failed to load pharmacies. Please try again.');
      console.error('Error loading pharmacies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const searchParams = {};
    
    if (medicineName) {
      searchParams.medicine = medicineName;
    }
    
    if (open24Hours) {
      searchParams.open24Hours = true;
    }

    loadPharmacies(searchParams);
  };

  const handleLocationSearch = () => {
    if (position) {
      loadPharmacies({
        lat: position.latitude,
        lng: position.longitude,
        radius: 10
      });
    } else {
      refetch();
    }
  };

  const getDirections = (pharmacy) => {
    if (position && pharmacy.latitude && pharmacy.longitude) {
      const url = `https://www.google.com/maps/dir/${position.latitude},${position.longitude}/${pharmacy.latitude},${pharmacy.longitude}`;
      window.open(url, '_blank');
    } else {
      const query = encodeURIComponent(pharmacy.address);
      const url = `https://www.google.com/maps/search/${query}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PharmacyIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Pharmacy Finder
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Find nearby pharmacies and check medicine availability
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Search Filters */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Search Pharmacies
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Medicine Name"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Search for specific medicine"
                  InputProps={{
                    startAdornment: <MedicineIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={open24Hours}
                      onChange={(e) => setOpen24Hours(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="24 Hour Pharmacies"
                />
              </Grid>
              
              <Grid item xs={12} sm={5}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{ flexGrow: 1 }}
                  >
                    Search Pharmacies
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<LocationIcon />}
                    onClick={handleLocationSearch}
                    disabled={locationLoading}
                    title="Search nearby pharmacies"
                  >
                    Near Me
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Location status */}
            {locationError && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Location access denied. You can still search for pharmacies, but results won't be sorted by distance.
              </Alert>
            )}
            
            {position && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Location detected. Results will be sorted by distance from your location.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12}>
          {loading ? (
            <LoadingSpinner message="Searching for pharmacies..." />
          ) : error ? (
            <Alert severity="error">
              {error}
            </Alert>
          ) : (
            <PharmacyList
              pharmacies={pharmacies}
              userPosition={position}
              onGetDirections={getDirections}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PharmacyFinder;
