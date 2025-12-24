// React hook that loads VUCE data from the API layer and exposes
// loading/error state plus a refetch function.
import { useState, useEffect, useCallback } from 'react';
import { Row } from '../types';
import { fetchData } from '../services/api';

/**
 * Fetches and stores dashboard data.
 * Returns a stable refetch function to reload on demand.
 */
export function useVuceData() {
    const [data, setData] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchData();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido al cargar datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return { data, loading, error, refetch: loadData };
}
