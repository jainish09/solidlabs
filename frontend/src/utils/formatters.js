/**
 * Formatting utilities for CAD dimensions, volumes, and currency
 */

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatVolume = (volumeMm3) => {
  if (!volumeMm3) return '0 mm³';
  const cm3 = volumeMm3 / 1000;
  return `${cm3.toFixed(2)} cm³`;
};

export const formatDimensions = (dims) => {
  if (!dims) return 'N/A';
  return `${dims.x} × ${dims.y} × ${dims.z} mm`;
};

