export { PerformanceHeatmap } from './PerformanceHeatmap';
export { RadarChart } from './RadarChart';
export { AreaChart } from './AreaChart';
export { BarChart } from './BarChart';
export { LineChart } from './LineChart';
export { PieChart } from './PieChart';

// 3D components are lazy-loaded to avoid bundling issues with Three.js
// Import them directly with React.lazy() in your component:
// const ScatterChart3D = lazy(() => import('./ScatterChart3D').then(m => ({ default: m.ScatterChart3D })));
// const BarChart3D = lazy(() => import('./BarChart3D').then(m => ({ default: m.BarChart3D })));