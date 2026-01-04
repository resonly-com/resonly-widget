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

  /** Default type to use when opening programmatically */
  defaultType?: 'feedback' | 'issue' | 'idea';

  /** Default question for all types */
  question?: string;

  /** Custom questions per type */
  questionsByType?: {
    feedback?: string;
    issue?: string;
    idea?: string;
  };

  /** Prefill configuration */
  prefill?: {
    type?: 'feedback' | 'issue' | 'idea';
    text?: string;
  };

  /** Accent color for the widget */
  accentColor?: string;

  /** Z-index for positioning */
  zIndex?: number;
}

/**
 * Partial config for manual initialization
 */
export type WidgetConfigInput = Partial<WidgetConfig> & Pick<WidgetConfig, 'projectId' | 'host'>;

/**
 * Form override options for programmatic open
 */
export interface FormOptions {
  question?: string;
  text?: string;
}

/**
 * Global API exposed on window.ResonlyWidget
 */
export interface ResonlyWidgetAPI {
  /** Initialize the widget (called automatically if using script data attributes) */
  init(config?: WidgetConfigInput): void;

  /** Open the widget with optional type and overrides */
  open(type?: 'feedback' | 'issue' | 'idea', overrides?: FormOptions): Promise<void>;

  /** Close the widget */
  close(): Promise<void>;

  /** Destroy the widget and clean up */
  destroy(): Promise<void>;

  /** Widget version */
  version: string;

  /** Get all submissions (debug only) */
  _getSubmissions(): any[];

  /** Clear all submissions (debug only) */
  _clearSubmissions(): void;
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
