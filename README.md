# idle-js

A lightweight, TypeScript-first library for detecting user idle/active states with support for visibility changes.

[![Travis build status](http://img.shields.io/travis/gabrielstuff/idle-js.svg?style=flat)](https://travis-ci.org/gabrielstuff/idle-js)
[![Code Climate](https://codeclimate.com/github/gabrielstuff/idle-js/badges/gpa.svg)](https://codeclimate.com/github/gabrielstuff/idle-js)
[![Test Coverage](https://codeclimate.com/github/gabrielstuff/idle-js/badges/coverage.svg)](https://codeclimate.com/github/gabrielstuff/idle-js)
[![Dependency Status](https://david-dm.org/gabrielstuff/idle-js.svg)](https://david-dm.org/gabrielstuff/idle-js)
[![devDependency Status](https://david-dm.org/gabrielstuff/idle-js/dev-status.svg)](https://david-dm.org/gabrielstuff/idle-js#info=devDependencies)

## Features

- 🎯 **TypeScript-first** with full type safety
- 📦 **Multiple build targets**: ESM, CJS, UMD
- 🎛️ **Configurable events** and idle timeout
- 👁️ **Visibility detection** for window hide/show events
- 🔄 **Flexible tracking** options (one-time or continuous)
- 🪶 **Lightweight** with zero runtime dependencies
- 🧪 **Well-tested** with comprehensive test suite

## Installation

```bash
npm install idle-js
# or
yarn add idle-js
# or
pnpm add idle-js
```

## Quick Start

### TypeScript

```typescript
import IdleJs from 'idle-js';

const idle = new IdleJs({
  idle: 30000, // 30 seconds
  onIdle: () => {
    console.log('User is idle');
  },
  onActive: () => {
    console.log('User is active again');
  },
  onHide: () => {
    console.log('Window is hidden');
  },
  onShow: () => {
    console.log('Window is visible');
  }
});

idle.start();
```

### JavaScript (ES Modules)

```javascript
import IdleJs from 'idle-js';

const idle = new IdleJs({
  idle: 30000, // 30 seconds
  onIdle: () => {
    console.log('User is idle');
  },
  onActive: () => {
    console.log('User is active again');
  },
  onHide: () => {
    console.log('Window is hidden');
  },
  onShow: () => {
    console.log('Window is visible');
  }
});

idle.start();
```

### JavaScript (CommonJS)

```javascript
const IdleJs = require('idle-js').default;
// or
const { IdleJs } = require('idle-js');

const idle = new IdleJs({
  idle: 30000, // 30 seconds
  onIdle: function() {
    console.log('User is idle');
  },
  onActive: function() {
    console.log('User is active again');
  },
  onHide: function() {
    console.log('Window is hidden');
  },
  onShow: function() {
    console.log('Window is visible');
  }
});

idle.start();
```

### Browser (UMD)

```html
<script src="node_modules/idle-js/dist/index.umd.js"></script>
<script>
  // Option 1: Use named export (recommended)
  const idle = new idleJs.IdleJs({
    idle: 30000, // 30 seconds
    onIdle: function() {
      console.log('User is idle');
    },
    onActive: function() {
      console.log('User is active again');
    }
  });
  
  // Option 2: Use default export
  // const idle = new idleJs.default({ ... });
  
  idle.start();
</script>
```

## API Reference

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `idle` | `number` | `60000` | Idle timeout in milliseconds |
| `events` | `string[]` | `['mousemove', 'keydown', 'mousedown', 'touchstart']` | Events that reset idle timer |
| `onIdle` | `() => void` | `() => {}` | Callback when user becomes idle |
| `onActive` | `() => void` | `() => {}` | Callback when user becomes active again |
| `onHide` | `() => void` | `() => {}` | Callback when window becomes hidden |
| `onShow` | `() => void` | `() => {}` | Callback when window becomes visible |
| `keepTracking` | `boolean` | `true` | Continue tracking after first idle event |
| `startAtIdle` | `boolean` | `false` | Start in idle state |
| `recurIdleCall` | `boolean` | `false` | Use `setInterval` instead of `setTimeout` |

### Methods

#### `start(): void`
Starts idle detection and sets up event listeners.

#### `stop(): void`
Stops idle detection and removes all event listeners.

### TypeScript Types

The library provides full TypeScript support with exported types:

```typescript
import IdleJs, { IdleJsOptions } from 'idle-js';

const options: IdleJsOptions = {
  idle: 30000,
  onIdle: () => console.log('idle'),
  onActive: () => console.log('active')
};

const idle = new IdleJs(options);
```

## Build Targets and TypeScript Support

This library is built with TypeScript and provides multiple output formats:

### Available Formats

- **ESM** (`dist/index.mjs`) - ES modules with tree-shaking support
- **CommonJS** (`dist/index.js`) - Node.js compatible
- **UMD** (`dist/index.umd.js`) - Universal module for browsers

### TypeScript Definitions

- **ESM types**: `dist/index.d.mts`
- **CommonJS types**: `dist/index.d.ts`

### Package.json Exports

The package uses modern Node.js exports for proper module resolution:

```json
{
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

## Migration from v1.x

### Why TypeScript?

This library has been rewritten in TypeScript to provide:

- **Better Developer Experience**: Full IntelliSense support and autocomplete
- **Type Safety**: Catch errors at compile time rather than runtime
- **Modern Tooling**: Built with modern JavaScript features and best practices
- **Improved API**: Cleaner, more consistent API surface
- **Better Documentation**: Self-documenting code with TypeScript interfaces

### Breaking Changes

- **TypeScript-first**: The library is now written in TypeScript
- **Build System**: Migrated from Gulp to tsdown for better modern module support
- **API Changes**: Some internal APIs may have changed (public API remains largely compatible)
- **Browser Support**: Now targets ES2018+ (can be transpiled for older browsers if needed)

### Migration Guide

The public API remains largely the same. Most existing code should work with minimal changes:

```javascript
// v1.x (still works)
const idle = new IdleJs({
  onIdle: function() { /* ... */ }
});

// v2.x (recommended)
const idle = new IdleJs({
  onIdle: () => { /* ... */ }
});
```

## Advanced Examples

### Custom Events

```typescript
const idle = new IdleJs({
  idle: 10000,
  events: ['click', 'scroll', 'keypress'], // Custom events
  onIdle: () => {
    console.log('No clicks, scrolls, or keypresses for 10 seconds');
  }
});
```

### One-time Tracking

```typescript
const idle = new IdleJs({
  idle: 60000,
  keepTracking: false, // Stop after first idle event
  onIdle: () => {
    console.log('User went idle once, stopping tracking');
  }
});
```

### Recurring Idle Notifications

```typescript
const idle = new IdleJs({
  idle: 30000,
  recurIdleCall: true, // Use setInterval instead of setTimeout
  onIdle: () => {
    console.log('User idle reminder (every 30 seconds)');
  }
});
```

### Programmatic Stop

```typescript
const idle = new IdleJs({
  idle: 60000,
  onIdle: () => console.log('idle')
});

idle.start();

// Stop from anywhere in your application
window.dispatchEvent(new CustomEvent('idle:stop'));

// Or use the stop method
idle.stop();
```

## Testing

```bash
npm test          # Run tests once
npm run test:ui   # Run tests with UI
npm run test:coverage  # Run tests with coverage
```

## Development

```bash
npm run dev       # Watch mode
npm run build     # Build all formats
npm run lint      # Lint code
```

## License

MIT © [gabrielstuff](https://github.com/gabrielstuff)
