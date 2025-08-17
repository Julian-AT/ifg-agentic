/**
 * AI Tools
 * 
 * Comprehensive suite of AI-powered tools for working with Austrian government data,
 * creating documents, managing data requests, and analyzing activity streams.
 * 
 * The tools are organized by functionality:
 * - Documents: Creating and managing code artifacts and documents
 * - Data Requests: Austrian government data request workflows (IFG, IWG, DZG)
 * - Datasets: Discovering and analyzing Austrian open data
 * - Activity: Tracking changes and updates across the platform
 */

// Document tools
export * from './documents';

// Data request tools
export * from './data-requests';

// Dataset tools
export * from './datasets';

// Activity tools
export * from './activity';

// Legacy exports for backward compatibility (temporary)
// TODO: Remove these after updating all imports
export { createDocument } from './documents/create-document';
export { updateDocument } from './documents/update-document';
export { requestSuggestions } from './documents/request-suggestions';
export { exploreCsvData } from './datasets/explore-csv-data';
export { checkDataAvailability } from './data-requests/check-availability';