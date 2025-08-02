/**
 * Utility functions for bulk event listener management with TypeScript generics
 * 
 * Features:
 * - Generic types for type-safe event target handling
 * - Proper callback reference management for removal
 * - Advanced configuration support
 * - Registry pattern for automatic cleanup
 */

/**
 * Event listener configuration for bulk operations
 */
export interface EventListenerConfig {
  /** The event type (e.g., 'click', 'mousemove') */
  event: string;
  /** The event handler callback */
  callback: (event: Event) => void;
  /** Optional event listener options */
  options?: boolean | AddEventListenerOptions;
}

/**
 * Bulk adds event listeners to a target object
 * @param target - The event target (Element, Document, Window, etc.)
 * @param events - Array of event types to listen for
 * @param callback - The callback function to execute for all events
 * @param options - Optional event listener options
 */
export function bulkAddEventListener<T extends EventTarget>(
  target: T,
  events: string[],
  callback: (event: Event) => void,
  options?: boolean | AddEventListenerOptions
): void {
  events.forEach((event) => {
    target.addEventListener(event, callback, options);
  });
}

/**
 * Bulk removes event listeners from a target object
 * @param target - The event target (Element, Document, Window, etc.)
 * @param events - Array of event types to remove
 * @param callback - The same callback function that was used when adding the listeners
 * @param options - Optional event listener options (must match those used when adding)
 */
export function bulkRemoveEventListener<T extends EventTarget>(
  target: T,
  events: string[],
  callback: (event: Event) => void,
  options?: boolean | EventListenerOptions
): void {
  events.forEach((event) => {
    target.removeEventListener(event, callback, options);
  });
}

/**
 * Advanced bulk event listener management with individual event configurations
 * @param target - The event target (Element, Document, Window, etc.)
 * @param configs - Array of event listener configurations
 */
export function bulkAddEventListenerAdvanced<T extends EventTarget>(
  target: T,
  configs: EventListenerConfig[]
): void {
  configs.forEach(({ event, callback, options }) => {
    target.addEventListener(event, callback, options);
  });
}

/**
 * Advanced bulk event listener removal with individual event configurations
 * @param target - The event target (Element, Document, Window, etc.)
 * @param configs - Array of event listener configurations (must match those used when adding)
 */
export function bulkRemoveEventListenerAdvanced<T extends EventTarget>(
  target: T,
  configs: EventListenerConfig[]
): void {
  configs.forEach(({ event, callback, options }) => {
    target.removeEventListener(event, callback, options);
  });
}

/**
 * Creates a reusable event listener manager for a specific target
 * @param target - The event target (Element, Document, Window, etc.)
 * @returns An object with add and remove methods
 */
export function createEventListenerManager<T extends EventTarget>(target: T) {
  return {
    /**
     * Add multiple event listeners with the same callback
     */
    add: (
      events: string[],
      callback: (event: Event) => void,
      options?: boolean | AddEventListenerOptions
    ): void => {
      bulkAddEventListener(target, events, callback, options);
    },

    /**
     * Remove multiple event listeners with the same callback
     */
    remove: (
      events: string[],
      callback: (event: Event) => void,
      options?: boolean | EventListenerOptions
    ): void => {
      bulkRemoveEventListener(target, events, callback, options);
    },

    /**
     * Add multiple event listeners with individual configurations
     */
    addAdvanced: (configs: EventListenerConfig[]) => {
      bulkAddEventListenerAdvanced(target, configs);
    },

    /**
     * Remove multiple event listeners with individual configurations
     */
    removeAdvanced: (configs: EventListenerConfig[]) => {
      bulkRemoveEventListenerAdvanced(target, configs);
    }
  };
}

/**
 * Type-safe event listener management with automatic cleanup
 * Useful for components that need to clean up listeners on unmount
 */
export class EventListenerRegistry<T extends EventTarget> {
  private listeners: Map<string, Set<EventListenerConfig>> = new Map();

  constructor(private target: T) {}

  /**
   * Add event listeners and track them for later removal
   */
  add(
    events: string[],
    callback: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    events.forEach((event) => {
      const config: EventListenerConfig = { event, callback, options };
      
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      
      this.listeners.get(event)!.add(config);
      this.target.addEventListener(event, callback, options);
    });
  }

  /**
   * Remove specific event listeners
   */
  remove(
    events: string[],
    callback: (event: Event) => void,
    options?: boolean | EventListenerOptions
  ): void {
    events.forEach((event) => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        // Find and remove the matching configuration
        for (const config of eventListeners) {
          if (config.callback === callback && config.options === options) {
            eventListeners.delete(config);
            this.target.removeEventListener(event, callback, options);
            break;
          }
        }
        
        // Clean up empty sets
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    });
  }

  /**
   * Remove all tracked event listeners
   */
  removeAll(): void {
    for (const configs of this.listeners.values()) {
      for (const config of configs) {
        this.target.removeEventListener(config.event, config.callback, config.options);
      }
    }
    this.listeners.clear();
  }

  /**
   * Get all tracked events
   */
  getTrackedEvents(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if a specific event is being tracked
   */
  hasEvent(event: string): boolean {
    return this.listeners.has(event);
  }
}
