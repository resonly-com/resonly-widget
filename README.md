# Resonly Widget

A lightweight, framework-agnostic embeddable widget for collecting feature requests. This package provides only the **loader infrastructure** and initialization logic. The actual widget UI is loaded dynamically on demand.

## Features

- Framework-agnostic (works with any website)
- Tiny footprint (loader only)
- Shadow DOM for style encapsulation
- Auto-initialization from script tag
- Manual initialization via JavaScript API
- Lazy-loading of widget UI
- TypeScript support
- CSP-friendly (no inline scripts)

## Installation

### CDN (Recommended)

Add the following script tag to your HTML, typically before the closing `</body>` tag:

```html
<script
  src="https://cdn.example.com/widget.js"
  data-project="YOUR_PROJECT_ID"
  data-host="https://api.example.com"
  data-mode="button"
  data-position="bottom-right"
  data-theme="light"
></script>
```

### NPM

```bash
npm install @resonly/widget
```

## Usage

### Auto-Initialization (Script Tag)

The widget automatically initializes when you include the script tag with `data-project` and `data-host` attributes:

```html
<script
  src="https://cdn.example.com/widget.js"
  data-project="proj_abc123"
  data-host="https://api.resonly.com"
  data-mode="button"
  data-position="bottom-right"
  data-theme="light"
></script>
```

#### Configuration Attributes

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-project` | Yes | - | Your project ID from Resonly dashboard |
| `data-host` | Yes | - | API endpoint URL |
| `data-mode` | No | `button` | Display mode: `button` or `inline` |
| `data-position` | No | `bottom-right` | Position: `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `data-theme` | No | `light` | Theme: `light`, `dark`, or `auto` |

### Manual Initialization (JavaScript API)

If you prefer to initialize the widget programmatically:

```html
<!-- Load the script without data attributes -->
<script src="https://cdn.example.com/widget.js"></script>

<script>
  // Initialize manually
  window.ResonlyWidget.init({
    projectId: 'proj_abc123',
    host: 'https://api.resonly.com',
    mode: 'button',
    position: 'bottom-right',
    theme: 'light'
  });
</script>
```

### API Methods

The widget exposes a global `window.ResonlyWidget` object with the following methods:

```typescript
interface ResonlyWidgetAPI {
  // Initialize the widget
  init(config?: {
    projectId: string;
    host: string;
    mode?: 'button' | 'inline';
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    theme?: 'light' | 'dark' | 'auto';
  }): void;

  // Open the widget
  open(): void;

  // Close the widget
  close(): void;

  // Destroy the widget and clean up
  destroy(): void;

  // Widget version
  version: string;
}
```

#### Examples

```javascript
// Open the widget programmatically
window.ResonlyWidget.open();

// Close the widget
window.ResonlyWidget.close();

// Destroy the widget
window.ResonlyWidget.destroy();

// Check version
console.log(window.ResonlyWidget.version); // "0.1.0"
```

### Custom Events

The widget dispatches custom events that you can listen to:

```javascript
// Widget is ready
document.addEventListener('resonly:ready', (event) => {
  console.log('Widget ready with config:', event.detail.config);
});

// Widget opened
document.addEventListener('resonly:open', () => {
  console.log('Widget opened');
});

// Widget closed
document.addEventListener('resonly:close', () => {
  console.log('Widget closed');
});
```

### Inline Mode

For embedding the widget directly in your page (not as a floating button):

```html
<div id="feedback-section">
  <h2>Share Your Ideas</h2>
  <script
    src="https://cdn.example.com/widget.js"
    data-project="proj_abc123"
    data-host="https://api.resonly.com"
    data-mode="inline"
  ></script>
</div>
```

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Build Output

The build produces:

- `dist/widget.js` - IIFE format for CDN usage (with sourcemap)
- `dist/widget.mjs` - ESM format for module bundlers (with sourcemap)

### Project Structure

```
src/
├── types.ts           # TypeScript type definitions
├── widget-loader.ts   # Main loader and auto-init logic
├── resonly-widget.ts  # Web Component definition
└── widget-app.ts      # Lazy-loaded widget UI (stub)
```

## Browser Support

- Chrome/Edge 88+
- Firefox 75+
- Safari 14+
- Any browser with Web Components support

## Security

- No external dependencies
- No inline scripts (CSP-friendly)
- Shadow DOM encapsulation prevents CSS conflicts
- Only exposes `window.ResonlyWidget` to global scope

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact support@resonly.com.
