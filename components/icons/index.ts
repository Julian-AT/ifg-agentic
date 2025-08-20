// Dynamic icon imports for better tree shaking and code splitting
import { lazy } from 'react';

// Core icons that are used frequently - keep in main bundle
export { BotIcon, UserIcon, VercelIcon, PencilEditIcon, MessageIcon, ToolIcon, LoaderIcon } from './core-icons';

// Heavy icons - dynamically imported
export const ChartIcon = lazy(() => import('./chart-icons').then(m => ({ default: m.ChartIcon })));
export const DatabaseIcon = lazy(() => import('./database-icons').then(m => ({ default: m.DatabaseIcon })));
export const FileIcon = lazy(() => import('./file-icons').then(m => ({ default: m.FileIcon })));
export const UIIcon = lazy(() => import('./ui-icons').then(m => ({ default: m.UIIcon })));

// Re-export all icons for backward compatibility (but with dynamic loading)
export * from './core-icons';
export * from './chart-icons';
export * from './database-icons';
export * from './file-icons';
export * from './ui-icons';