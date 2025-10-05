/* eslint-disable */
// Language selector component for multilingual support
// Provides dropdown to switch between English, Hindi, and Punjabi
import React from 'react';
import { 
  Select, 
  MenuItem, 
  FormControl, 
  Box, 
  Typography,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      flag: '🇺🇸',
      nativeName: 'English' 
    },
    { 
      code: 'hi', 
      name: 'Hindi', 
      flag: '🇮🇳',
      nativeName: 'हिन्दी' 
    },
    { 
      code: 'pa', 
      name: 'Punjabi', 
      flag: '🇮🇳',
      nativeName: 'ਪੰਜਾਬੀ' 
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === (i18n.language || 'en')) || languages[0];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode) => {
    console.log('🌐 Changing language to:', languageCode);
    i18n.changeLanguage(languageCode);
    localStorage.setItem('telemedicine_language', languageCode);
    handleClose();
  };

  return (
    <Box>
      {/* Language Button */}
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'white',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.2)',
          },
          borderRadius: 2,
          px: 2,
          py: 1
        }}
        aria-label="Select Language"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'white' }}>
            {currentLanguage.flag}
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', minWidth: 60 }}>
            {currentLanguage.nativeName}
          </Typography>
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        </Box>
      </IconButton>

      {/* Language Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === currentLanguage.code}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography variant="body1">
                {language.flag}
              </Typography>
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight="medium">
                {language.nativeName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {language.name}
              </Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
