import { useEffect, useState } from 'react';
import { meetingsApi } from '../api';

export function useMeetings(initialFilter = 'upcoming') {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState(initialFilter);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (nextFilter = filter) => {
    try {
      setLoading(true);
      setError('');
      const res = await meetingsApi.getAll(nextFilter);
      setItems(res.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  return { items, filter, setFilter, loading, error, reload: load, setItems, setError };
}

