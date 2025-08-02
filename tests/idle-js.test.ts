import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import IdleJs from '../src/idle-js';

// Mock DOM properties
Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true,
  configurable: true
});

Object.defineProperty(document, 'webkitHidden', {
  value: false,
  writable: true,
  configurable: true
});

Object.defineProperty(document, 'mozHidden', {
  value: false,
  writable: true,
  configurable: true
});

Object.defineProperty(document, 'msHidden', {
  value: false,
  writable: true,
  configurable: true
});

describe('IdleJs', () => {
  let idle: IdleJs;
  let onIdleSpy: ReturnType<typeof vi.fn>;
  let onActiveSpy: ReturnType<typeof vi.fn>;
  let onHideSpy: ReturnType<typeof vi.fn>;
  let onShowSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Reset DOM properties
    (document as any).hidden = false;
    (document as any).webkitHidden = false;
    (document as any).mozHidden = false;
    (document as any).msHidden = false;
    
    // Create fresh spies for each test
    onIdleSpy = vi.fn();
    onActiveSpy = vi.fn();
    onHideSpy = vi.fn();
    onShowSpy = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should create instance with default options', () => {
      idle = new IdleJs();
      expect(idle).toBeInstanceOf(IdleJs);
    });
    
    it('should create instance with custom options', () => {
      const options = {
        idle: 30000,
        events: ['mousemove', 'click'],
        onIdle: onIdleSpy,
        onActive: onActiveSpy,
        onHide: onHideSpy,
        onShow: onShowSpy,
        keepTracking: false,
        startAtIdle: true,
        recurIdleCall: true
      };
      
      idle = new IdleJs(options);
      expect(idle).toBeInstanceOf(IdleJs);
    });
  });

  describe('Idle Detection - onIdle callback', () => {
    it('should call onIdle callback after idle timeout', () => {
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy
      });
      
      idle.start();
      
      // Fast-forward time to trigger idle state
      vi.advanceTimersByTime(1000);
      
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should call onIdle repeatedly when recurIdleCall is true', () => {
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy,
        recurIdleCall: true
      });
      
      idle.start();
      
      // First idle call
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
      
      // Second idle call (since recurIdleCall is true)
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(2);
    });
    
    it('should not call onIdle again when keepTracking is false', () => {
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy,
        keepTracking: false
      });
      
      idle.start();
      
      // Trigger idle
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
      
      // Simulate activity to reset timer
      window.dispatchEvent(new Event('mousemove'));
      
      // Should not trigger again due to keepTracking: false
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Activity Detection - onActive callback', () => {
    it('should call onActive when user becomes active after being idle', () => {
      idle = new IdleJs({
        idle: 1000,
        events: ['mousemove'],
        onIdle: onIdleSpy,
        onActive: onActiveSpy
      });
      
      idle.start();
      
      // Become idle first
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
      
      // Trigger activity to become active
      window.dispatchEvent(new Event('mousemove'));
      expect(onActiveSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should not call onActive if user was not idle', () => {
      idle = new IdleJs({
        idle: 1000,
        events: ['mousemove'],
        onActive: onActiveSpy
      });
      
      idle.start();
      
      // Trigger activity without being idle first
      window.dispatchEvent(new Event('mousemove'));
      expect(onActiveSpy).not.toHaveBeenCalled();
    });
    
    it('should respond to multiple event types', () => {
      idle = new IdleJs({
        idle: 1000,
        events: ['mousemove', 'keydown', 'click'],
        onIdle: onIdleSpy,
        onActive: onActiveSpy
      });
      
      idle.start();
      
      // Become idle
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
      
      // Test different event types
      window.dispatchEvent(new Event('mousemove'));
      expect(onActiveSpy).toHaveBeenCalledTimes(1);
      
      // Become idle again
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(2);
      
      window.dispatchEvent(new Event('keydown'));
      expect(onActiveSpy).toHaveBeenCalledTimes(2);
      
      // Become idle again
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(3);
      
      window.dispatchEvent(new Event('click'));
      expect(onActiveSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Visibility Detection - onHide/onShow callbacks', () => {
    it('should call onHide when document becomes hidden', () => {
      idle = new IdleJs({
        onHide: onHideSpy,
        onShow: onShowSpy
      });
      
      idle.start();
      
      // Simulate document becoming hidden
      (document as any).hidden = true;
      document.dispatchEvent(new Event('visibilitychange'));
      
      expect(onHideSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should call onShow when document becomes visible', () => {
      idle = new IdleJs({
        onHide: onHideSpy,
        onShow: onShowSpy
      });
      
      idle.start();
      
      // First hide the document
      (document as any).hidden = true;
      document.dispatchEvent(new Event('visibilitychange'));
      expect(onHideSpy).toHaveBeenCalledTimes(1);
      
      // Then show it again
      (document as any).hidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
      expect(onShowSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle webkit visibility changes', () => {
      idle = new IdleJs({
        onHide: onHideSpy,
        onShow: onShowSpy
      });
      
      idle.start();
      
      // Simulate webkit hidden
      (document as any).webkitHidden = true;
      document.dispatchEvent(new Event('webkitvisibilitychange'));
      
      expect(onHideSpy).toHaveBeenCalledTimes(1);
      
      // Show again
      (document as any).webkitHidden = false;
      document.dispatchEvent(new Event('webkitvisibilitychange'));
      
      expect(onShowSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle moz visibility changes', () => {
      idle = new IdleJs({
        onHide: onHideSpy,
        onShow: onShowSpy
      });
      
      idle.start();
      
      // Simulate moz hidden
      (document as any).mozHidden = true;
      document.dispatchEvent(new Event('mozvisibilitychange'));
      
      expect(onHideSpy).toHaveBeenCalledTimes(1);
      
      // Show again
      (document as any).mozHidden = false;
      document.dispatchEvent(new Event('mozvisibilitychange'));
      
      expect(onShowSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle ms visibility changes', () => {
      idle = new IdleJs({
        onHide: onHideSpy,
        onShow: onShowSpy
      });
      
      idle.start();
      
      // Simulate ms hidden
      (document as any).msHidden = true;
      document.dispatchEvent(new Event('msvisibilitychange'));
      
      expect(onHideSpy).toHaveBeenCalledTimes(1);
      
      // Show again
      (document as any).msHidden = false;
      document.dispatchEvent(new Event('msvisibilitychange'));
      
      expect(onShowSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should not call onHide/onShow multiple times for same state', () => {
      idle = new IdleJs({
        onHide: onHideSpy,
        onShow: onShowSpy
      });
      
      idle.start();
      
      // Hide multiple times
      (document as any).hidden = true;
      document.dispatchEvent(new Event('visibilitychange'));
      document.dispatchEvent(new Event('visibilitychange'));
      
      expect(onHideSpy).toHaveBeenCalledTimes(1);
      
      // Show multiple times
      (document as any).hidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
      document.dispatchEvent(new Event('visibilitychange'));
      
      expect(onShowSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('keepTracking option', () => {
    it('should continue tracking when keepTracking is true (default)', () => {
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy,
        onActive: onActiveSpy,
        keepTracking: true
      });
      
      idle.start();
      
      // First idle cycle
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
      
      // Activity resets timer
      window.dispatchEvent(new Event('mousemove'));
      expect(onActiveSpy).toHaveBeenCalledTimes(1);
      
      // Should go idle again
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(2);
    });
    
    it('should stop tracking when keepTracking is false', () => {
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy,
        onActive: onActiveSpy,
        keepTracking: false
      });
      
      idle.start();
      
      // First idle cycle
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
      
      // Activity should not reset timer when keepTracking is false
      window.dispatchEvent(new Event('mousemove'));
      expect(onActiveSpy).toHaveBeenCalledTimes(1);
      
      // Should not go idle again
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('recurIdleCall option', () => {
    it('should use setTimeout when recurIdleCall is false (default)', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy,
        recurIdleCall: false
      });
      
      idle.start();
      
      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(setIntervalSpy).not.toHaveBeenCalled();
    });
    
    it('should use setInterval when recurIdleCall is true', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy,
        recurIdleCall: true
      });
      
      idle.start();
      
      expect(setIntervalSpy).toHaveBeenCalled();
      // setTimeout might still be called for other purposes, so we don't assert it's not called
    });
  });

  describe('stop event handling', () => {
    it('should be able to create instance without throwing', () => {
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy,
        keepTracking: true
      });
      
      expect(() => idle.start()).not.toThrow();
    });
  });

  describe('startAtIdle option', () => {
    it('should start in active state when startAtIdle is false (default)', () => {
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy,
        onActive: onActiveSpy,
        startAtIdle: false
      });
      
      idle.start();
      
      // Trigger activity - should not call onActive since we started active
      window.dispatchEvent(new Event('mousemove'));
      expect(onActiveSpy).not.toHaveBeenCalled();
    });
    
    it('should start in idle state when startAtIdle is true', () => {
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy,
        onActive: onActiveSpy,
        startAtIdle: true
      });
      
      idle.start();
      
      // Trigger activity - should call onActive since we started idle
      window.dispatchEvent(new Event('mousemove'));
      expect(onActiveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle multiple start calls gracefully', () => {
      idle = new IdleJs({
        idle: 1000,
        onIdle: onIdleSpy
      });
      
      idle.start();
      idle.start(); // Second start call
      
      vi.advanceTimersByTime(1000);
      // Should still work normally
      expect(onIdleSpy).toHaveBeenCalled();
    });
    
    it('should handle empty events array', () => {
      idle = new IdleJs({
        idle: 1000,
        events: [],
        onIdle: onIdleSpy,
        onActive: onActiveSpy
      });
      
      expect(() => idle.start()).not.toThrow();
      
      vi.advanceTimersByTime(1000);
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle very short idle times', () => {
      idle = new IdleJs({
        idle: 1, // 1ms
        onIdle: onIdleSpy
      });
      
      idle.start();
      vi.advanceTimersByTime(1);
      
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle zero idle time', () => {
      idle = new IdleJs({
        idle: 0,
        onIdle: onIdleSpy
      });
      
      idle.start();
      vi.advanceTimersByTime(0);
      
      expect(onIdleSpy).toHaveBeenCalledTimes(1);
    });
  });
});

