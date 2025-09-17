import { WasteType } from '../types';

export const calculateWasteValue = (
  wasteType: WasteType,
  quantity: number,
  unit: string
): number => {
  // Convert to kg if needed
  let weightInKg = quantity;
  
  if (unit === 'liters') {
    // Approximate conversion for common waste materials
    // This could be more precise based on material density
    weightInKg = quantity * 0.5; // Average estimation
  } else if (unit === 'items') {
    // Estimate weight per item based on waste type
    const itemsPerKg: { [key: string]: number } = {
      plastic: 20, // ~20 plastic bottles per kg
      paper: 10,   // ~10 paper items per kg
      metal: 5,    // ~5 metal cans per kg
      glass: 2,    // ~2 glass bottles per kg
      ewaste: 1,   // ~1 e-waste item per kg (varies greatly)
      organic: 1,  // 1:1 ratio for organic
    };
    
    const itemsPerKgValue = itemsPerKg[wasteType.name.toLowerCase()] || 1;
    weightInKg = quantity / itemsPerKgValue;
  }
  
  return wasteType.pricePerKg * weightInKg;
};

export const calculateCO2Saved = (weightInKg: number, wasteType: string): number => {
  const co2Factors: { [key: string]: number } = {
    plastic: 1.5,   
    paper: 0.9,     
    metal: 2.0,     
    glass: 0.3,     
    ewaste: 3.0,    
    organic: 0.2,  
    default: 1.0,   
  };
  
  const factor = co2Factors[wasteType.toLowerCase()] || co2Factors.default;
  return weightInKg * factor;
};

export const calculateTreesSaved = (paperWeightInKg: number): number => {
  // Approximately 17 trees are saved per ton of paper recycled
  return (paperWeightInKg / 1000) * 17;
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatWeight = (weight: number, unit: string): string => {
  if (unit === 'kg') {
    return `${weight.toFixed(2)} kg`;
  } else if (unit === 'liters') {
    return `${weight.toFixed(2)} L`;
  } else {
    return `${weight} items`;
  }
};

export const calculateWorkerEarnings = (
  completedPickups: number,
  averageValue: number,
  rating: number
): number => {
  // Base earnings plus bonus for high rating
  const baseEarnings = completedPickups * averageValue;
  const ratingBonus = rating >= 4 ? baseEarnings * 0.1 : 0; // 10% bonus for 4+ rating
  return baseEarnings + ratingBonus;
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return dateObj.toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const calculateEfficiency = (completed: number, total: number): number => {
  return total > 0 ? (completed / total) * 100 : 0;
};

export const calculateTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const past = new Date(dateStr);
  const diffSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return sum / ratings.length;
};

export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
};

export const calculateCarbonCredits = (wasteWeight: number, wasteType: string): number => {
  const creditFactors: { [key: string]: number } = {
    plastic: 2.5,
    paper: 1.8,
    metal: 3.2,
    glass: 0.8,
    organic: 1.2,
    ewaste: 4.5,
  };
  
  const factor = creditFactors[wasteType.toLowerCase()] || 1.0;
  return wasteWeight * factor;
};

// Additional utility functions for the AvailableRequestsScreen
export const getUrgencyLevel = (pickupOption: string, scheduledDateTime?: Date): string => {
  if (pickupOption === 'instant') return 'high';
  
  if (pickupOption === 'scheduled' && scheduledDateTime) {
    const now = new Date();
    const hoursUntilPickup = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilPickup < 12 ? 'medium' : 'low';
  }
  
  return 'low';
};

export const calculateTotalWeight = (wasteItems: Array<{quantity: string, unit: string}>): number => {
  return wasteItems.reduce((total, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    // Convert to kg if needed (simplified conversion)
    const weightInKg = item.unit === 'kg' ? quantity : quantity * 0.5;
    return total + weightInKg;
  }, 0);
};

export const formatPickupSchedule = (pickupOption: string, scheduledDateTime?: Date): string => {
  switch (pickupOption) {
    case 'instant':
      return 'Instant Pickup (Within 2 hours)';
    case 'scheduled':
      return scheduledDateTime 
        ? `Scheduled: ${formatDateTime(scheduledDateTime)}`
        : 'Scheduled Pickup';
    case 'daily':
      return 'Daily Pickup Service';
    default:
      return 'Standard Pickup';
  }
};