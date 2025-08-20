// Dynamic imports for heavy components to improve initial bundle size
import { lazy } from 'react';

// Code editor - heavy dependency
export const CodeEditor = lazy(() => import('../code-editor'));

// Chart components - heavy recharts dependency  
export const WeatherComponent = lazy(() => import('../weather'));

// AI form - large component with many dependencies
export const AIDataRequestForm = lazy(() => import('../ai-data-request-form'));

// Message component - large with many sub-components
export const Message = lazy(() => import('../message'));

// Artifact component - heavy with prosemirror
export const Artifact = lazy(() => import('../artifact'));

// Toolbar - heavy with many UI components
export const Toolbar = lazy(() => import('../toolbar'));

// Form components - heavy form handling
export const FormDiffView = lazy(() => import('../form-diff-view'));

// Data grid - heavy dependency
export const MergedDatasetSearch = lazy(() => import('../merged-dataset-search'));
export const MergedDatasetDetails = lazy(() => import('../merged-dataset-details'));