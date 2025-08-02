export interface IdleOptions {
  idle?: number;
  events?: (keyof WindowEventMap | string)[];
  onIdle?: () => void;
  onActive?: () => void;
  onHide?: () => void;
  onShow?: () => void;
  keepTracking?: boolean;
  startAtIdle?: boolean;
  recurIdleCall?: boolean;
}

// Mirror VueUse's UseIdleOptions naming for familiarity
export type UseIdleOptions = IdleOptions;
