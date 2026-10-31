import { useState, useEffect } from 'react';
import { MOCK_CAD_ASSETS, MOCK_QUOTES } from '../data/mockData';

export const useMockCADAssets = () => {
  const [assets, setAssets] = useState(MOCK_CAD_ASSETS);
  const [loading, setLoading] = useState(false);

  return { assets, setAssets, loading };
};

export const useMockQuotes = () => {
  const [quotes, setQuotes] = useState(MOCK_QUOTES);
  return { quotes, setQuotes };
};

