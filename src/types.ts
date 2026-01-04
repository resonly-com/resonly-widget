/**
 * Widget configuration interface
 */
export interface WidgetConfig {
  /** Required: Project ID from Resonly dashboard */
  projectId: string;

  /** Required: API host URL */
  host: string;

  /** Display mode: button triggers widget, inline embeds directly */
  mode?: 'button' | 'inline';

  /** Position for button mode */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

  /** Theme preference */
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Partial config for manual initialization
 */
export type WidgetConfigInput = Partial<WidgetConfig> & Pick<WidgetConfig, 'projectId' | 'host'>;

/**
 * Global API exposed on window.ResonlyWidget
 */
export interface ResonlyWidgetAPI {
  /** Initialize the widget (called automatically if using script data attributes) */
  init(config?: WidgetConfigInput): void;

  /** Open the widget */
  open(): void;

  /** Close the widget */
  close(): void;

  /** Destroy the widget and clean up */
  destroy(): void;

  /** Widget version */
  version: string;
}

/**
 * Custom events dispatched by the widget
 */
export interface WidgetEventMap {
  'resonly:ready': CustomEvent<{ config: WidgetConfig }>;
  'resonly:open': CustomEvent;
  'resonly:close': CustomEvent;
}

declare global {
  interface Window {
    ResonlyWidget: ResonlyWidgetAPI;
  }

  interface HTMLElementEventMap extends WidgetEventMap {}
}
