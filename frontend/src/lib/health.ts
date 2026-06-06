import { healthCheck } from './api';

let _healthy: boolean | null = null;
let _checking = false;
const _listeners: Array<(ok: boolean) => void> = [];

export function subscribe(fn: (ok: boolean) => void) {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i >= 0) _listeners.splice(i, 1);
  };
}

function _notify(ok: boolean) {
  for (const fn of _listeners) fn(ok);
}

export async function checkHealth(): Promise<boolean> {
  if (_healthy !== null) return _healthy;
  if (_checking) return false;
  _checking = true;
  try {
    const res = await healthCheck();
    _healthy = res.status === 'ok';
  } catch {
    _healthy = false;
  }
  _checking = false;
  _notify(_healthy);
  return _healthy;
}

export function isHealthy(): boolean | null {
  return _healthy;
}
