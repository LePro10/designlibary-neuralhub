import type { DocPage } from '../../kit/types';

export const pages: DocPage[] = [
  { id: 'rings-meters', title: 'Rings & meters', summary: 'One ring and one meter instead of four rings and seven bars; thresholds built in.', load: () => import('./RingsMeters'), badge: 'refined' },
  { id: 'bar-chart', title: 'Bar chart', summary: 'Scrub with finger or mouse, pin by tap, average line, stacked series.', load: () => import('./Bars'), badge: 'refined' },
  { id: 'line-chart', title: 'Line & sparkline', summary: 'Crosshair line with target band and gaps; tiny sparklines for tiles.', load: () => import('./Lines') },
  { id: 'heatmap', title: 'Heatmaps', summary: 'A year of days and an hour × weekday grid, five steps, always a legend.', load: () => import('./Heatmaps') },
  { id: 'donut', title: 'Donut', summary: 'Shares of a whole: gaps, round ends, sequential draw, legend.', load: () => import('./DonutPage') },
];
