import type { WidgetConfig, WidgetConfigInput, ResonlyWidgetAPI } from './types';
import { ResonlyWidgetElement } from './resonly-widget';

/**
 * Widget Loader
 *
 * Provides auto-initialization from script tag data attributes
 * and exposes a global API for manual control.
 */

const WIDGET_VERSION = '0.1.0';
const WIDGET_ROOT_ID = 'resonly-widget-root';

// Track initialization state
let isInitialized = false;
let widgetElement: ResonlyWidgetElement | null = null;
let widgetConfig: WidgetConfig | null = null;

/**
 * Find the script tag that loaded this widget
 */
function findWidgetScript(): HTMLScriptElement | null {
  // Try document.currentScript first (most reliable)
  if (document.currentScript && document.currentScript instanceof HTMLScriptElement) {
    return document.currentScript;
  }

  // Fallback: scan all scripts for one ending with 'widget.js'
  const scripts = Array.from(document.querySelectorAll('script'));
  return scripts.find((script) => {
    const src = script.getAttribute('src') || '';
    return src.includes('widget.js');
  }) as HTMLScriptElement | null;
}

/**
 * Extract configuration from script data attributes
 */
function extractConfigFromScript(script: HTMLScriptElement): Partial<WidgetConfig> {
  return {
    projectId: script.dataset.project || '',
    host: script.dataset.host || '',
    mode: (script.dataset.mode as 'button' | 'inline') || 'button',
    position: (script.dataset.position as WidgetConfig['position']) || 'bottom-right',
    theme: (script.dataset.theme as WidgetConfig['theme']) || 'light',
  };
}

/**
 * Validate required configuration fields
 */
function validateConfig(config: Partial<WidgetConfig>): config is WidgetConfig {
  if (!config.projectId) {
    console.warn('[ResonlyWidget] Missing required data-project attribute');
    return false;
  }

  if (!config.host) {
    console.warn('[ResonlyWidget] Missing required data-host attribute');
    return false;
  }

  return true;
}

/**
 * Create the widget root container
 */
function createWidgetRoot(): HTMLDivElement {
  // Check if root already exists
  let root = document.getElementById(WIDGET_ROOT_ID) as HTMLDivElement;

  if (!root) {
    root = document.createElement('div');
    root.id = WIDGET_ROOT_ID;
    document.body.appendChild(root);
  }

  return root;
}

/**
 * Create and inject the widget element
 */
function createWidgetElement(config: WidgetConfig): ResonlyWidgetElement {
  const widget = document.createElement('resonly-widget') as ResonlyWidgetElement;

  // Set attributes
  widget.setAttribute('project-id', config.projectId);
  widget.setAttribute('host', config.host);
  widget.setAttribute('mode', config.mode || 'button');
  widget.setAttribute('position', config.position || 'bottom-right');
  widget.setAttribute('theme', config.theme || 'light');

  // Also set data attributes for CSS targeting
  widget.setAttribute('data-mode', config.mode || 'button');
  widget.setAttribute('data-position', config.position || 'bottom-right');

  return widget;
}

/**
 * Initialize the widget
 */
function initWidget(configOverride?: WidgetConfigInput): void {
  // Prevent double initialization
  if (isInitialized) {
    console.warn('[ResonlyWidget] Widget already initialized');
    return;
  }

  // Ensure we have a body element (SSR safety)
  if (typeof document === 'undefined' || !document.body) {
    console.warn('[ResonlyWidget] Document body not available');
    return;
  }

  let config: Partial<WidgetConfig>;

  if (configOverride) {
    // Manual initialization with config object
    config = configOverride;
  } else {
    // Auto-initialization from script tag
    const script = findWidgetScript();
    if (!script) {
      console.warn('[ResonlyWidget] Could not find widget script tag');
      return;
    }

    config = extractConfigFromScript(script);
  }

  // Validate configuration
  if (!validateConfig(config)) {
    return;
  }

  // Store validated config
  widgetConfig = config;

  // Create root container
  const root = createWidgetRoot();

  // Create widget element
  widgetElement = createWidgetElement(config);

  // Inject widget into root
  root.appendChild(widgetElement);

  isInitialized = true;

  console.log('[ResonlyWidget] Initialized successfully', {
    version: WIDGET_VERSION,
    config,
  });
}

/**
 * Open the widget
 */
function openWidget(): void {
  if (!widgetElement) {
    console.warn('[ResonlyWidget] Widget not initialized. Call init() first.');
    return;
  }

  widgetElement.open();
}

/**
 * Close the widget
 */
function closeWidget(): void {
  if (!widgetElement) {
    console.warn('[ResonlyWidget] Widget not initialized');
    return;
  }

  widgetElement.close();
}

/**
 * Destroy the widget and clean up
 */
function destroyWidget(): void {
  if (!widgetElement) {
    return;
  }

  // Destroy the element
  widgetElement.destroy();

  // Remove from DOM
  const root = document.getElementById(WIDGET_ROOT_ID);
  if (root) {
    root.remove();
  }

  // Reset state
  widgetElement = null;
  widgetConfig = null;
  isInitialized = false;

  console.log('[ResonlyWidget] Destroyed');
}

/**
 * Global API
 */
const ResonlyWidgetAPI: ResonlyWidgetAPI = {
  init: (config?: WidgetConfigInput) => {
    // If DOM is not ready, defer initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initWidget(config), { once: true });
    } else {
      initWidget(config);
    }
  },
  open: openWidget,
  close: closeWidget,
  destroy: destroyWidget,
  version: WIDGET_VERSION,
};

// Expose global API
if (typeof window !== 'undefined') {
  window.ResonlyWidget = ResonlyWidgetAPI;
}

/**
 * Auto-initialization
 *
 * If script is loaded with data attributes, initialize automatically
 * when DOM is ready.
 */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const autoInit = () => {
    const script = findWidgetScript();
    if (script && (script.dataset.project || script.dataset.host)) {
      // Auto-init only if we found a script with data attributes
      ResonlyWidgetAPI.init();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    // DOM already loaded, run immediately
    autoInit();
  }
}

// Export for module usage (if needed)
export default ResonlyWidgetAPI;
