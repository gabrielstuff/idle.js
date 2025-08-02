// Main entry point for the IdleJs library
// Re-exports the IdleJs class and types from their respective modules

export { default as IdleJs, default } from './idle-js';
export type { IdleOptions } from './types';
export { bulkAddEventListener, bulkRemoveEventListener } from './utils';
