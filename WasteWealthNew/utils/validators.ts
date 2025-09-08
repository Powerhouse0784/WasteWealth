export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validateAddress = (address: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!address.addressLine1 || address.addressLine1.trim().length < 5) {
    errors.push('Address line 1 is required and must be at least 5 characters');
  }
  if (!address.city || address.city.trim().length < 2) {
    errors.push('City is required');
  }
  if (!address.state || address.state.trim().length < 2) {
    errors.push('State is required');
  }
  if (!address.pincode || !/^[0-9]{6}$/.test(address.pincode)) {
    errors.push('Pincode must be 6 digits');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateWasteQuantity = (quantity: number, unit: string): boolean => {
  if (unit === 'kg') {
    return quantity >= 0.1 && quantity <= 1000;
  } else if (unit === 'liters') {
    return quantity >= 0.1 && quantity <= 1000;
  } else if (unit === 'items') {
    return quantity >= 1 && quantity <= 1000;
  }
  return false;
};

export const formatValidationErrors = (errors: string[]): string => {
  return errors.join('\n• ');
};

export const validatePickupSchedule = (date: Date): boolean => {
  const now = new Date();
  const minDate = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
  const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  return date >= minDate && date <= maxDate;
};