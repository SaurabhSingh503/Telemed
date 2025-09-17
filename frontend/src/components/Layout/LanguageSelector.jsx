import React from 'react';
import { Select, MenuItem, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleChange = (event) => {
    i18n.changeLanguage(event.target.value);
    localStorage.setItem('language', event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <Select
        value={i18n.language}
        onChange={handleChange}
        size="small"
        sx={{ 
          color: 'white',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '& .MuiSvgIcon-root': { color: 'white' }
        }}
      >
        <MenuItem value="en">🇺🇸 English</MenuItem>
        <MenuItem value="hi">🇮🇳 हिन्दी</MenuItem>
        <MenuItem value="pa">🇮🇳 ਪੰਜਾਬੀ</MenuItem>
      </Select>
    </Box>
  );
};

export default LanguageSelector;
