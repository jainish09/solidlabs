/**
 * SolidLabs Frontend Service Layer - API Client & Integration Placeholders
 * 
 * BOUNDARY RULE:
 * 1. Do not connect to or start the backend.
 * 2. Do not implement real API integration yet.
 * 3. Use mock frontend data and local frontend state for all demonstrations.
 * 4. Keep future API integration placeholders isolated inside frontend/src/services/.
 */

import axios from 'axios';

// Placeholder axios instance (mocked locally, not active against backend)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const CADService = {
  // Placeholder methods for future backend contracts
  analyzeMesh: async (file) => {
    console.warn('[DEMO] analyzeMesh called with mock data');
    return { status: 'mock', message: 'CAD mesh analysis mock response' };
  },
  generateParametric: async (prompt) => {
    console.warn('[DEMO] generateParametric called with mock data');
    return { status: 'mock', message: 'Parametric generation mock response' };
  },
};

export default api;

