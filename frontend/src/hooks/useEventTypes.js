import { useEffect, useState } from 'react';
import { eventTypesApi } from '../api';

export function useEventTypes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await eventTypesApi.getAll();
      setItems(res.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { items, loading, error, reload: load, setItems, setError };
}

