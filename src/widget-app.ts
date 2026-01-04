import type { WidgetConfig } from './types';

/**
 * Widget App Module (Stub)
 *
 * This is a placeholder module that gets lazy-loaded when the widget
 * is opened for the first time. In production, this would contain the
 * actual UI implementation.
 *
 * For now, it only logs that it has been mounted.
 */

/**
 * Mount the widget app into the shadow root
 *
 * @param shadowRoot - The shadow root to mount into
 * @param config - Widget configuration
 */
export async function mount(shadowRoot: ShadowRoot, config: WidgetConfig): Promise<void> {
  console.log('[ResonlyWidget:App] Mounted with config:', config);

  // In a real implementation, this would:
  // 1. Render the widget UI (form, button, modal, etc.)
  // 2. Set up event handlers
  // 3. Connect to the API
  // 4. Manage widget state

  // For now, just add a simple placeholder to show it loaded
  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      .widget-stub {
        padding: 20px;
        background: white;
        border: 2px dashed #ccc;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        color: #333;
        max-width: 300px;
      }

      .widget-stub h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        color: #000;
      }

      .widget-stub p {
        margin: 4px 0;
        color: #666;
        font-size: 12px;
      }

      .widget-stub code {
        background: #f5f5f5;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 11px;
      }
    </style>
    <div class="widget-stub">
      <h3>Widget App Loaded</h3>
      <p><strong>Project:</strong> <code>${config.projectId}</code></p>
      <p><strong>Host:</strong> <code>${config.host}</code></p>
      <p><strong>Mode:</strong> <code>${config.mode}</code></p>
      <p><strong>Theme:</strong> <code>${config.theme}</code></p>
      <p style="margin-top: 12px; font-style: italic;">
        This is a placeholder. Replace with actual widget UI.
      </p>
    </div>
  `;

  shadowRoot.appendChild(container);

  return Promise.resolve();
}

/**
 * Unmount the widget app (cleanup)
 */
export function unmount(shadowRoot: ShadowRoot): void {
  console.log('[ResonlyWidget:App] Unmounted');
  // In a real implementation, clean up event listeners, timers, etc.
}
