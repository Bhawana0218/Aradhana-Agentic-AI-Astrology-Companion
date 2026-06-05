import { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import type { BirthChart } from '../types';

const API_BASE = '/api';

export function useChart() {
  const { birthDetails } = useChatStore();
  const [chart, setChart] = useState<BirthChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async () => {
    if (!birthDetails?.date || !birthDetails?.place) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: birthDetails.date,
          time: birthDetails.time || '12:00',
          place: birthDetails.place,
          lat: birthDetails.lat ?? null,
          lon: birthDetails.lon ?? null,
          timezone: birthDetails.timezone ?? null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Chart computation failed');
      }
      setChart(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chart');
    } finally {
      setLoading(false);
    }
  }, [birthDetails?.date, birthDetails?.time, birthDetails?.place, birthDetails?.lat, birthDetails?.lon, birthDetails?.timezone]);

  useEffect(() => {
    if (birthDetails?.date && birthDetails?.place) fetchChart();
  }, [birthDetails?.date, birthDetails?.place, fetchChart]);

  return { chart, loading, error, refetch: fetchChart };
}

export function useTransits() {
  const { birthDetails } = useChatStore();
  const [transits, setTransits] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (birthDetails?.lat) body.lat = birthDetails.lat;
      if (birthDetails?.lon) body.lon = birthDetails.lon;
      if (birthDetails?.timezone) body.timezone = birthDetails.timezone;
      const res = await fetch(`${API_BASE}/transits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Transits fetch failed');
      }
      setTransits(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load transits');
    } finally {
      setLoading(false);
    }
  }, [birthDetails?.lat, birthDetails?.lon, birthDetails?.timezone]);

  useEffect(() => { fetchTransits(); }, [fetchTransits]);

  return { transits, loading, error, refetch: fetchTransits };
}
