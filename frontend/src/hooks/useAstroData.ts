import { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import type { BirthChart, BirthDetails } from '../types';
import { computeChart, getTransits } from '../lib/api';
import { getCache, setCache } from '../lib/cache';

function birthHash(bd: BirthDetails): string {
  return `${bd.date}|${bd.time || '12:00'}|${bd.place}|${bd.lat ?? ''}|${bd.lon ?? ''}|${bd.timezone ?? ''}`;
}

export function useChart() {
  const { birthDetails } = useChatStore();
  const [chart, setChart] = useState<BirthChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async () => {
    if (!birthDetails?.date || !birthDetails?.place) return;
    const hash = birthHash(birthDetails);
    const cached = getCache<BirthChart>(CHART_CACHE_PREFIX + hash);
    if (cached) {
      setChart(cached);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await computeChart({
        date: birthDetails.date,
        time: birthDetails.time || '12:00',
        place: birthDetails.place,
        lat: birthDetails.lat ?? null,
        lon: birthDetails.lon ?? null,
        timezone: birthDetails.timezone ?? null,
      });
      const chartData = data as unknown as BirthChart;
      setCache(CHART_CACHE_PREFIX + hash, chartData);
      setChart(chartData);
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
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = TRANSITS_CACHE_KEY + '_' + today;
    const cached = getCache<object>(cacheKey);
    if (cached) {
      setTransits(cached);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body: { date?: string; lat?: number; lon?: number; timezone?: string } = {};
      if (birthDetails?.lat) body.lat = birthDetails.lat;
      if (birthDetails?.lon) body.lon = birthDetails.lon;
      if (birthDetails?.timezone) body.timezone = birthDetails.timezone;
      const data = await getTransits(body);
      const result = data as object;
      setCache(cacheKey, result, 21600000);
      setTransits(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load transits');
    } finally {
      setLoading(false);
    }
  }, [birthDetails?.lat, birthDetails?.lon, birthDetails?.timezone]);

  useEffect(() => { fetchTransits(); }, [fetchTransits]);

  return { transits, loading, error, refetch: fetchTransits };
}
