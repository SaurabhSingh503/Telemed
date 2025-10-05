/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Paper,
  Divider
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  LocalPharmacy as PharmacyIcon,
  Search as SearchIcon,
  Navigation as NavigationIcon,
  Star as StarIcon,
  CheckCircle as AvailableIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../../services/api';

const PharmacyFinder = () => {
  const { t } = useTranslation();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [searchMedicine, setSearchMedicine] = useState('');
  const [locationPermission, setLocationPermission] = useState('prompt');

  // Get user location
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setLocationPermission('granted');
        console.log('User location:', location);
        fetchPharmacies(location.latitude, location.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationPermission('denied');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enable location services and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred while retrieving location.');
            break;
        }
        // Still fetch pharmacies without location
        fetchPharmacies();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Fetch pharmacies from API
  const fetchPharmacies = async (lat = null, lng = null) => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        params.radius = 20; // 20km radius
      }
      if (searchMedicine.trim()) {
        params.medicine = searchMedicine.trim();
      }

      console.log('Fetching pharmacies with params:', params);
      const response = await apiEndpoints.getPharmacies(params);
      
      console.log('Pharmacy API response:', response.data);

      if (response.data.success) {
        setPharmacies(response.data.pharmacies || []);
      } else {
        setError('Failed to fetch pharmacies');
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      setError(error.response?.data?.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Search medicines
  const handleMedicineSearch = () => {
    if (userLocation) {
      fetchPharmacies(userLocation.latitude, userLocation.longitude);
    } else {
      fetchPharmacies();
    }
  };

  // Initialize with sample data on component mount
  useEffect(() => {
    fetchPharmacies(); // Load all pharmacies initially
  }, []);

  // Render pharmacy card
  const renderPharmacyCard = (pharmacy, index) => (
    <Grid item xs={12} md={6} lg={4} key={pharmacy.id || index}>
      <Card 
        elevation={4} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 6
          },
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Pharmacy Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h3" fontWeight="bold" color="primary">
              {pharmacy.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ color: '#ffc107', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {pharmacy.rating || '4.0'}
              </Typography>
            </Box>
          </Box>

          {/* Distance & Status */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {pharmacy.distance && (
              <Chip 
                icon={<NavigationIcon />}
                label={`${pharmacy.distance} km away`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            <Chip 
              label={pharmacy.isOpen24Hours ? '24 Hours' : 'Limited Hours'}
              size="small"
              color={pharmacy.isOpen24Hours ? 'success' : 'default'}
            />
          </Box>

          {/* Contact Info */}
          <List dense>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <LocationIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="body2" color="text.secondary">
                    {pharmacy.address}
                  </Typography>
                }
              />
            </ListItem>
            
            {pharmacy.phone && (
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <PhoneIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="body2" color="text.secondary">
                      {pharmacy.phone}
                    </Typography>
                  }
                />
              </ListItem>
            )}

            {pharmacy.email && (
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <EmailIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="body2" color="text.secondary">
                      {pharmacy.email}
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>

          {/* Available Medicines */}
          {pharmacy.medicines && pharmacy.medicines.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PharmacyIcon fontSize="small" />
                Available Medicines:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {pharmacy.medicines.slice(0, 3).map((medicine, idx) => (
                  <Chip
                    key={idx}
                    icon={<AvailableIcon />}
                    label={`${medicine.name} - ₹${medicine.price}`}
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                ))}
                {pharmacy.medicines.length > 3 && (
                  <Chip
                    label={`+${pharmacy.medicines.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>

        <Divider />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => window.open(`tel:${pharmacy.phone}`, '_self')}
            disabled={!pharmacy.phone}
          >
            Call Pharmacy
          </Button>
        </Box>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white' }}>
        <Box textAlign="center">
          <PharmacyIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('actions.find_pharmacies')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {t('descriptions.locate_pharmacies')}
          </Typography>
        </Box>
      </Paper>

      {/* Search Controls */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search for medicines"
              value={searchMedicine}
              onChange={(e) => setSearchMedicine(e.target.value)}
              placeholder="e.g., Paracetamol, Crocin, Aspirin"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleMedicineSearch();
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={getCurrentLocation}
              disabled={loading}
              startIcon={<LocationIcon />}
              sx={{ py: 1.5 }}
            >
              Get My Location
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleMedicineSearch}
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{ py: 1.5 }}
            >
              Search Pharmacies
            </Button>
          </Grid>
        </Grid>

        {/* Location Status */}
        {userLocation && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              📍 Location detected! Showing pharmacies within 20km radius.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Finding pharmacies near you...
          </Typography>
        </Box>
      )}

      {/* Results */}
      {!loading && (
        <>
          {/* Results Header */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              Available Pharmacies ({pharmacies.length})
            </Typography>
            {searchMedicine && (
              <Chip 
                label={`Searching for: ${searchMedicine}`}
                onDelete={() => {
                  setSearchMedicine('');
                  handleMedicineSearch();
                }}
                color="primary"
              />
            )}
          </Box>

          {/* Pharmacy Grid */}
          {pharmacies.length > 0 ? (
            <Grid container spacing={3}>
              {pharmacies.map((pharmacy, index) => renderPharmacyCard(pharmacy, index))}
            </Grid>
          ) : (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <PharmacyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No pharmacies found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchMedicine 
                  ? `No pharmacies found with "${searchMedicine}" in stock.`
                  : 'Try enabling location services or search for a specific medicine.'
                }
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchMedicine('');
                  getCurrentLocation();
                }}
              >
                Try Again
              </Button>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default PharmacyFinder;
