import { MD3LightTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';

export const DefaultTheme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#4CAF50',
    accent: '#FFC107',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    disabled: '#9E9E9E',
    placeholder: '#BDBDBD',
    backdrop: '#000000',
    notification: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  roundness: 8,
};

export const DarkTheme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#4CAF50',
    accent: '#FFC107',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    disabled: '#616161',
    placeholder: '#9E9E9E',
    backdrop: '#000000',
    notification: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  roundness: 8,
};
