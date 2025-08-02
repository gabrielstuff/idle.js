import { IdleOptions } from './types';
import { bulkAddEventListener, bulkRemoveEventListener } from './utils';

/**
 * IdleJs - A TypeScript library for tracking user idle/active states
 * 
 * Detects when a user becomes idle based on lack of activity (mouse movement, 
 * keyboard input, etc.) and provides callbacks for idle/active state changes
 * as well as window visibility changes.
 */
export default class IdleJs {
  private readonly defaults: Required<IdleOptions> = {
    idle: 60000, // idle time in ms
    events: ['mousemove', 'keydown', 'mousedown', 'touchstart'], // events that will trigger the idle resetter
    onIdle: function () { }, // callback function to be executed after idle time
    onActive: function () { }, // callback function to be executed after back form idleness
    onHide: function () { }, // callback function to be executed when window become hidden
    onShow: function () { }, // callback function to be executed when window become visible
    keepTracking: true, // set it to false of you want to track only once
    startAtIdle: false, // set it to true if you want to start in the idle state
    recurIdleCall: false
  };

  private readonly settings: Required<IdleOptions>;
  private idle: boolean;
  private visible: boolean;
  private lastId: NodeJS.Timeout | number | null;
  private readonly visibilityEvents: string[] = [
    'visibilitychange', 
    'webkitvisibilitychange', 
    'mozvisibilitychange', 
    'msvisibilitychange'
  ];

  /**
   * Creates a new IdleJs instance
   * 
   * @param options - Configuration options for idle detection
   * @param options.idle - Idle timeout in milliseconds (default: 60000)
   * @param options.events - Array of events that reset the idle timer (default: ['mousemove', 'keydown', 'mousedown', 'touchstart'])
   * @param options.onIdle - Callback executed when user becomes idle
   * @param options.onActive - Callback executed when user becomes active again
   * @param options.onHide - Callback executed when window becomes hidden
   * @param options.onShow - Callback executed when window becomes visible
   * @param options.keepTracking - Whether to continue tracking after first idle event (default: true)
   * @param options.startAtIdle - Whether to start in idle state (default: false)
   * @param options.recurIdleCall - Whether to use setInterval instead of setTimeout for recurring idle calls (default: false)
   * 
   * @example
   * ```typescript
   * const idle = new IdleJs({
   *   idle: 30000, // 30 seconds
   *   onIdle: () => console.log('User is idle'),
   *   onActive: () => console.log('User is active')
   * });
   * idle.start();
   * ```
   */
  constructor(options: IdleOptions = {}) {
    this.settings = Object.assign({}, this.defaults, options);
    this.idle = this.settings.startAtIdle;
    this.visible = !this.settings.startAtIdle;
    this.lastId = null;
  }

  /**
   * Resets the idle timeout and triggers active callback if currently idle
   * 
   * @param id - The current timeout/interval ID to clear
   * @param settings - The idle settings configuration
   * @returns New timeout ID if keepTracking is enabled, null otherwise
   */
  private resetTimeout(id: NodeJS.Timeout | number | null, settings: Required<IdleOptions>): NodeJS.Timeout | number | null {
    if (this.idle) {
      settings.onActive.call(undefined);
      this.idle = false;
    }
    
    if (id !== null) {
      clearTimeout(id as NodeJS.Timeout);
      clearInterval(id as NodeJS.Timeout);
    }
    
    if (this.settings.keepTracking) {
      return this.timeout();
    }
    
    return null;
  }

  /**
   * Creates a new timeout or interval for idle detection
   * 
   * @param settings - The idle settings configuration
   * @returns The timeout or interval ID
   */
  private timeout(): NodeJS.Timeout | number {
    const timer = (this.settings.recurIdleCall) ? setInterval : setTimeout;
    
    const id = timer(() => {
      this.idle = true;
      this.settings.onIdle.call(undefined);
    }, this.settings.idle);
    
    return id;
  }

  /**
   * Starts idle detection and sets up event listeners
   * 
   * Begins monitoring user activity and window visibility changes.
   * Sets up listeners for:
   * - User activity events (mouse, keyboard, touch)
   * - Window visibility changes
   * - Custom 'idle:stop' event for programmatic stopping
   * 
   * @example
   * ```typescript
   * const idle = new IdleJs({ idle: 30000 });
   * idle.start(); // Begin monitoring
   * 
   * // To stop monitoring later:
   * window.dispatchEvent(new CustomEvent('idle:stop'));
   * ```
   */
  public start(): void {
    // Set up activity event listeners
    const activityHandler = () => {
      this.lastId = this.resetTimeout(this.lastId, this.settings);
    };
    
    // Set up stop event listener
    const stopHandler = () => {
      bulkRemoveEventListener(window, this.settings.events, activityHandler);
      this.settings.keepTracking = false;
      this.resetTimeout(this.lastId, this.settings);
    };
    
    window.addEventListener('idle:stop', stopHandler);

    // Start the initial timeout
    this.lastId = this.timeout();
    
    bulkAddEventListener(window, this.settings.events, activityHandler);

    // Set up visibility change listeners if callbacks are provided
    if (this.settings.onShow || this.settings.onHide) {
      const visibilityHandler = () => {
        const isHidden = document.hidden || 
                        (document as unknown as { webkitHidden?: boolean }).webkitHidden || 
                        (document as unknown as { mozHidden?: boolean }).mozHidden || 
                        (document as unknown as { msHidden?: boolean }).msHidden;

        if (isHidden) {
          if (this.visible) {
            this.visible = false;
            this.settings.onHide.call(undefined);
          }
        } else {
          if (!this.visible) {
            this.visible = true;
            this.settings.onShow.call(undefined);
          }
        }
      };

      bulkAddEventListener(document, this.visibilityEvents, visibilityHandler);
    }
  }
}
