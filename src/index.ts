interface IdleJsOptions {
  idle?: number;
  events?: string[];
  onIdle?: () => void;
  onActive?: () => void;
  onHide?: () => void;
  onShow?: () => void;
  keepTracking?: boolean;
  startAtIdle?: boolean;
  recurIdleCall?: boolean;
}

import { bulkAddEventListener, bulkRemoveEventListener } from './utils';

export class IdleJs {
  private defaults: Required<IdleJsOptions>;
  private settings: Required<IdleJsOptions>;
  private idle: boolean;
  private visible: boolean;
  private visibilityEvents: string[];
  private lastId: number | null;
  private activityCallback: () => void;
  private visibilityCallback: () => void;
  private stopCallback: () => void;

  constructor(options: IdleJsOptions = {}) {
    this.defaults = {
      idle: 60000, // idle time in ms
      events: ['mousemove', 'keydown', 'mousedown', 'touchstart'], // events that will trigger the idle resetter
      onIdle: function () {}, // callback function to be executed after idle time
      onActive: function () {}, // callback function to be executed after back form idleness
      onHide: function () {}, // callback function to be executed when window become hidden
      onShow: function () {}, // callback function to be executed when window become visible
      keepTracking: true, // set it to false of you want to track only once
      startAtIdle: false, // set it to true if you want to start in the idle state
      recurIdleCall: false
    };
    this.settings = Object.assign({}, this.defaults, options);
    this.idle = this.settings.startAtIdle;
    this.visible = !this.settings.startAtIdle;
    this.visibilityEvents = ['visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'msvisibilitychange'];
    this.lastId = null;

    // Initialize callback references for proper event listener removal
    this.activityCallback = () => {
      this.lastId = this.resetTimeout(this.lastId, this.settings);
    };

    this.visibilityCallback = () => {
      if (document.hidden || (document as unknown as { webkitHidden?: boolean }).webkitHidden || (document as unknown as { mozHidden?: boolean }).mozHidden || (document as unknown as { msHidden?: boolean }).msHidden) {
        if (this.visible) {
          this.visible = false;
          this.settings.onHide.call(this);
        }
      } else {
        if (!this.visible) {
          this.visible = true;
          this.settings.onShow.call(this);
        }
      }
    };

    this.stopCallback = () => {
      bulkRemoveEventListener(window, this.settings.events, this.activityCallback);
      this.settings.keepTracking = false;
      this.resetTimeout(this.lastId, this.settings);
    };
  }

  private resetTimeout(id: number | null, settings: Required<IdleJsOptions>): number | null {
    if (this.idle) {
      settings.onActive.call(this);
      this.idle = false;
    }
    if (id !== null) {
      clearTimeout(id);
    }
    if (this.settings.keepTracking) {
      return this.timeout();
    }
    return null;
  }

  private timeout(): number {
    const timer = this.settings.recurIdleCall ? setInterval : setTimeout;
    const id = timer(() => {
      this.idle = true;
      this.settings.onIdle.call(this);
    }, this.settings.idle);
    return Number(id);
  }

  start(): void {
    window.addEventListener('idle:stop', this.stopCallback);

    this.lastId = this.timeout();
    
    bulkAddEventListener(window, this.settings.events, this.activityCallback);

    if (this.settings.onShow !== this.defaults.onShow || this.settings.onHide !== this.defaults.onHide) {
      bulkAddEventListener(document, this.visibilityEvents, this.visibilityCallback);
    }
  }

  stop(): void {
    window.removeEventListener('idle:stop', this.stopCallback);
    bulkRemoveEventListener(window, this.settings.events, this.activityCallback);
    bulkRemoveEventListener(document, this.visibilityEvents, this.visibilityCallback);
    
    if (this.lastId !== null) {
      if (this.settings.recurIdleCall) {
        clearInterval(this.lastId);
      } else {
        clearTimeout(this.lastId);
      }
      this.lastId = null;
    }
  }
}

export { IdleJsOptions };
export default IdleJs;
