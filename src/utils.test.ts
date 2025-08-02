/**
 * Usage examples and basic tests for the utility functions
 */

import {
  bulkAddEventListener,
  bulkRemoveEventListener,
  createEventListenerManager,
  EventListenerRegistry,
  EventListenerConfig
} from './utils';

// Example 1: Basic bulk event listener usage
function basicExample() {
  const button = document.createElement('button');
  const events = ['click', 'mouseenter', 'mouseleave'];
  
  // Define callback function that can be referenced for removal
  const handleClick = (event: Event) => {
    console.log('Button event:', event.type);
  };
  
  // Add listeners
  bulkAddEventListener(button, events, handleClick);
  
  // Remove listeners (with same callback reference)
  bulkRemoveEventListener(button, events, handleClick);
}

// Example 2: Using the event listener manager
function managerExample() {
  const element = document.createElement('div');
  const manager = createEventListenerManager(element);
  
  const callback = (event: Event) => {
    console.log('Element event:', event.type);
  };
  
  // Add multiple events with same callback
  manager.add(['mousedown', 'mouseup', 'mousemove'], callback);
  
  // Remove them later
  manager.remove(['mousedown', 'mouseup', 'mousemove'], callback);
}

// Example 3: Using the registry for automatic cleanup
function registryExample() {
  const window_target = window as EventTarget;
  const registry = new EventListenerRegistry(window_target);
  
  const activityHandler = (event: Event) => {
    console.log('User activity detected:', event.type);
  };
  
  // Add tracked listeners
  registry.add(['mousemove', 'keydown', 'click'], activityHandler);
  
  // Check what's tracked
  console.log('Tracked events:', registry.getTrackedEvents());
  console.log('Has mousemove:', registry.hasEvent('mousemove'));
  
  // Clean up all at once
  registry.removeAll();
}

// Example 4: Type-safe usage with specific event targets
function typeSafeExample() {
  // Window-specific events
  const windowEvents = ['load', 'unload', 'resize'];
  const windowHandler = (event: Event) => {
    console.log('Window event:', event.type);
  };
  
  bulkAddEventListener<Window>(window, windowEvents, windowHandler);
  
  // Document-specific events
  const documentEvents = ['DOMContentLoaded', 'visibilitychange'];
  const documentHandler = (event: Event) => {
    console.log('Document event:', event.type);
  };
  
  bulkAddEventListener<Document>(document, documentEvents, documentHandler);
  
  // Element-specific events
  const element = document.createElement('input');
  const elementEvents = ['focus', 'blur', 'input'];
  const elementHandler = (event: Event) => {
    console.log('Input event:', event.type);
  };
  
  bulkAddEventListener<HTMLInputElement>(element, elementEvents, elementHandler);
  
  // Clean up
  bulkRemoveEventListener<Window>(window, windowEvents, windowHandler);
  bulkRemoveEventListener<Document>(document, documentEvents, documentHandler);
  bulkRemoveEventListener<HTMLInputElement>(element, elementEvents, elementHandler);
}

// Example 5: Advanced usage with event options
function advancedExample() {
  const element = document.createElement('button');
  
  const configs: EventListenerConfig[] = [
    {
      event: 'click',
      callback: () => console.log('Click with passive option'),
      options: { passive: true }
    },
    {
      event: 'keydown',
      callback: () => console.log('Keydown with capture'),
      options: { capture: true }
    },
    {
      event: 'mouseenter',
      callback: () => console.log('Mouse enter once'),
      options: { once: true }
    }
  ];
  
  const manager = createEventListenerManager(element);
  
  // Add with advanced configurations
  manager.addAdvanced(configs);
  
  // Remove with same configurations
  manager.removeAdvanced(configs);
}

// Export examples for potential testing
export {
  basicExample,
  managerExample,
  registryExample,
  typeSafeExample,
  advancedExample
};
