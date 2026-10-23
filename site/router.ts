/** Hash router: works on GitHub Pages without a 404 fallback. `#/group/page`. */
import { useSyncExternalStore } from 'react';

const read = () => decodeURIComponent(location.hash.replace(/^#\/?/, '')) || 'start/overview';
export function useRoute(): string {
  return useSyncExternalStore((cb) => { window.addEventListener('hashchange', cb); return () => window.removeEventListener('hashchange', cb); }, read, () => 'start/overview');
}
export const go = (path: string) => { location.hash = `/${path}`; };
