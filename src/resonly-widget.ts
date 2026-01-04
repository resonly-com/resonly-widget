import type { WidgetConfig } from './types';

/**
 * ResonlyWidget Web Component
 *
 * A minimal shell that attaches Shadow DOM and provides lifecycle hooks.
 * Does NOT render UI itself - UI is lazy-loaded on first open().
 */
export class ResonlyWidgetElement extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private config: WidgetConfig | null = null;
  private isOpen = false;
  private appMountPromise: Promise<any> | null = null;

  constructor() {
    super();

    // Attach shadow DOM for style encapsulation
    this._shadowRoot = this.attachShadow({ mode: 'open' });

    // Initial placeholder content
    this.renderPlaceholder();
  }

  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes() {
    return ['project-id', 'host', 'mode', 'position', 'theme'];
  }

  /**
   * Called when component is connected to DOM
   */
  connectedCallback() {
    this.updateConfigFromAttributes();

    // Dispatch ready event
    if (this.config?.projectId && this.config?.host) {
      this.dispatchEvent(
        new CustomEvent('resonly:ready', {
          detail: { config: this.config },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * Called when attributes change
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue) {
      this.updateConfigFromAttributes();
    }
  }

  /**
   * Update config from element attributes
   */
  private updateConfigFromAttributes() {
    const projectId = this.getAttribute('project-id') || '';
    const host = this.getAttribute('host') || '';
    const mode = (this.getAttribute('mode') || 'button') as 'button' | 'inline';
    const position = (this.getAttribute('position') || 'bottom-right') as WidgetConfig['position'];
    const theme = (this.getAttribute('theme') || 'light') as WidgetConfig['theme'];

    this.config = {
      projectId,
      host,
      mode,
      position,
      theme,
    };
  }

  /**
   * Render placeholder content (before UI is loaded)
   */
  private renderPlaceholder() {
    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          z-index: 999999;
        }

        :host([data-mode="inline"]) {
          position: relative;
        }

        /* Position variants for button mode */
        :host([data-position="bottom-right"]) {
          bottom: 20px;
          right: 20px;
        }

        :host([data-position="bottom-left"]) {
          bottom: 20px;
          left: 20px;
        }

        :host([data-position="top-right"]) {
          top: 20px;
          right: 20px;
        }

        :host([data-position="top-left"]) {
          top: 20px;
          left: 20px;
        }

        .resonly-placeholder {
          display: none;
          padding: 12px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          color: #666;
        }
      </style>
      <div class="resonly-placeholder" id="placeholder">
        Loading widget...
      </div>
    `;
  }

  /**
   * Open the widget (lazy-loads UI on first call)
   */
  async open() {
    if (this.isOpen) return;

    this.isOpen = true;

    // Dispatch open event
    this.dispatchEvent(
      new CustomEvent('resonly:open', {
        bubbles: true,
        composed: true,
      })
    );

    // Lazy-load the widget app on first open
    if (!this.appMountPromise) {
      this.appMountPromise = this.loadAndMountApp();
    }

    await this.appMountPromise;
  }

  /**
   * Close the widget
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;

    // Dispatch close event
    this.dispatchEvent(
      new CustomEvent('resonly:close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Lazy-load and mount the widget app
   */
  private async loadAndMountApp() {
    try {
      // Dynamic import of the actual widget UI
      const { mount } = await import('./widget-app');

      // Mount the app into shadow root
      if (this.config) {
        await mount(this._shadowRoot, this.config);
      }

      console.log('[ResonlyWidget] App mounted successfully');
    } catch (error) {
      console.error('[ResonlyWidget] Failed to load widget app:', error);
      throw error;
    }
  }

  /**
   * Destroy the widget
   */
  destroy() {
    this.close();
    this._shadowRoot.innerHTML = '';
    this.config = null;
    this.appMountPromise = null;
  }

  /**
   * Get current open state
   */
  get opened(): boolean {
    return this.isOpen;
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('resonly-widget')) {
  customElements.define('resonly-widget', ResonlyWidgetElement);
}
