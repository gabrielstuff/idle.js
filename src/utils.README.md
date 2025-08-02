# Event Listener Utilities

TypeScript utility functions for bulk event listener management with proper generic typing and callback reference handling.

## Features

- **Generic Types**: `T extends EventTarget` for type-safe event target handling
- **Proper Removal**: Ensures event listeners can be properly removed with callback references
- **Advanced Options**: Support for event listener options like `passive`, `capture`, `once`
- **Registry Pattern**: Automatic cleanup for component-based architectures
- **Type Safety**: Full TypeScript support with proper type inference

## Basic Usage

### bulkAddEventListener / bulkRemoveEventListener

```typescript
import { bulkAddEventListener, bulkRemoveEventListener } from './utils';

const element = document.getElementById('myButton');
const events = ['click', 'mouseenter', 'mouseleave'];

// IMPORTANT: Store callback reference for proper removal
const handleEvent = (event: Event) => {
  console.log('Event:', event.type);
};

// Add listeners
bulkAddEventListener(element, events, handleEvent);

// Remove listeners (same callback reference required)
bulkRemoveEventListener(element, events, handleEvent);
```

### Type-Safe Usage with Generics

```typescript
// Window events
bulkAddEventListener<Window>(window, ['load', 'resize'], windowHandler);

// Document events  
bulkAddEventListener<Document>(document, ['DOMContentLoaded'], docHandler);

// Element events
bulkAddEventListener<HTMLButtonElement>(button, ['click'], clickHandler);
```

## Advanced Usage

### Event Listener Manager

```typescript
import { createEventListenerManager } from './utils';

const element = document.getElementById('target');
const manager = createEventListenerManager(element);

const callback = (event: Event) => console.log(event.type);

// Add multiple events
manager.add(['mousedown', 'mouseup'], callback);

// Remove them
manager.remove(['mousedown', 'mouseup'], callback);
```

### Registry for Automatic Cleanup

```typescript
import { EventListenerRegistry } from './utils';

class MyComponent {
  private eventRegistry = new EventListenerRegistry(window);

  init() {
    // Add tracked listeners
    this.eventRegistry.add(['resize', 'scroll'], this.handleWindowEvents);
  }

  destroy() {
    // Clean up all listeners at once
    this.eventRegistry.removeAll();
  }

  private handleWindowEvents = (event: Event) => {
    console.log('Window event:', event.type);
  }
}
```

### Advanced Configuration

```typescript
import { EventListenerConfig, createEventListenerManager } from './utils';

const configs: EventListenerConfig[] = [
  {
    event: 'click',
    callback: handleClick,
    options: { passive: true }
  },
  {
    event: 'scroll',
    callback: handleScroll,
    options: { passive: true, capture: true }
  }
];

const manager = createEventListenerManager(element);
manager.addAdvanced(configs);
manager.removeAdvanced(configs); // Must use same configs for removal
```

## Key Improvements

### ✅ Proper Callback References
The utility functions now properly handle callback references, ensuring event listeners can actually be removed:

```typescript
// ❌ OLD - listeners cannot be removed
events.forEach(event => {
  target.removeEventListener(event, () => {}); // New function each time!
});

// ✅ NEW - proper removal
bulkRemoveEventListener(target, events, callback); // Same callback reference
```

### ✅ Generic Type Safety
Full TypeScript support with generic constraints:

```typescript
function bulkAddEventListener<T extends EventTarget>(
  target: T,
  events: string[],
  callback: (event: Event) => void,
  options?: boolean | AddEventListenerOptions
): void
```

### ✅ Registry Pattern
Automatic cleanup for component lifecycles:

```typescript
const registry = new EventListenerRegistry(target);
registry.add(['event1', 'event2'], handler);
// Later...
registry.removeAll(); // Cleans up everything automatically
```

## Migration from Old Implementation

If upgrading from the previous implementation:

1. **Store callback references**: Don't use inline functions if you need to remove listeners
2. **Update imports**: Import from `./utils` instead of inline definitions  
3. **Add callback parameter**: `bulkRemoveEventListener` now requires the callback parameter
4. **Consider using registry**: For automatic cleanup in component-based code

```typescript
// OLD
bulkRemoveEventListener(window, events); // ❌ Missing callback

// NEW  
bulkRemoveEventListener(window, events, callback); // ✅ Proper removal
```
