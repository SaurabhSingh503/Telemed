/* eslint-disable */
import React, { useState } from 'react';
import { Button, Typography, Box, Alert } from '@mui/material';
import { apiEndpoints } from '../../services/api';

const PharmacyTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing pharmacy API...');
      const response = await apiEndpoints.getPharmacies({});
      console.log('API Response:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('API Error:', error);
      setResult({ error: error.message, details: error.response?.data });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Pharmacy API Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testAPI} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test Pharmacy API'}
      </Button>

      {result && (
        <Alert severity={result.error ? 'error' : 'success'}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Alert>
      )}
    </Box>
  );
};

export default PharmacyTest;
