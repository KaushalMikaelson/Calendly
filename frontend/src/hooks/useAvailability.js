import { useEffect, useState } from 'react';
import { availabilityApi } from '../api';

export function useAvailability() {
  const [data, setData] = useState({ schedule: null, rules: [], overrides: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await availabilityApi.get();
      setData(res.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, reload: load, setData, setError };
}

