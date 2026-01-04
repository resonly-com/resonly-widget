/**
 * CSS style object - uses camelCase properties (e.g., backgroundColor, fontSize)
 * Includes common CSS properties with full type safety and autocomplete
 */
export interface CSSStyles {
  // Layout & Display
  display?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  zIndex?: string;

  // Flexbox & Grid
  flex?: string;
  flexDirection?: string;
  flexWrap?: string;
  flexGrow?: string;
  flexShrink?: string;
  flexBasis?: string;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  alignSelf?: string;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  grid?: string;
  gridTemplate?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;

  // Spacing
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;

  // Colors & Backgrounds
  color?: string;
  backgroundColor?: string;
  background?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundClip?: string;
  opacity?: string;

  // Borders
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderWidth?: string;
  borderTopWidth?: string;
  borderRightWidth?: string;
  borderBottomWidth?: string;
  borderLeftWidth?: string;
  borderStyle?: string;
  borderTopStyle?: string;
  borderRightStyle?: string;
  borderBottomStyle?: string;
  borderLeftStyle?: string;
  borderColor?: string;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;
  outline?: string;
  outlineWidth?: string;
  outlineStyle?: string;
  outlineColor?: string;
  outlineOffset?: string;

  // Typography
  font?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  fontVariant?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  textDecoration?: string;
  textTransform?: string;
  textIndent?: string;
  textShadow?: string;
  textOverflow?: string;
  whiteSpace?: string;
  wordBreak?: string;
  wordWrap?: string;

  // Effects & Transforms
  boxShadow?: string;
  transform?: string;
  transformOrigin?: string;
  transition?: string;
  transitionProperty?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  transitionDelay?: string;
  animation?: string;
  animationName?: string;
  animationDuration?: string;
  animationTimingFunction?: string;
  animationDelay?: string;
  animationIterationCount?: string;
  animationDirection?: string;
  animationFillMode?: string;
  animationPlayState?: string;
  filter?: string;
  backdropFilter?: string;

  // Cursor & Interaction
  cursor?: string;
  pointerEvents?: string;
  userSelect?: string;

  // Visibility
  visibility?: string;

  // Allow any other CSS property
  [key: string]: string | undefined;
}

/**
 * Button configuration
 */
export interface ButtonConfig {
  /** Unique identifier for the button type */
  type: string;
  /** Label text displayed on the button */
  label: string;
  /** Optional emoji or icon */
  icon?: string;
  /** Question to display when this button is clicked */
  question?: string;
  /** Custom styles for this button - accepts any CSS property in camelCase */
  style?: CSSStyles;
}

/**
 * Form style configuration - allows full CSS control for each element
 */
export interface FormStyle {
  /** Panel/dialog styles */
  panel?: CSSStyles;
  /** Panel header styles */
  panelHeader?: CSSStyles;
  /** Panel title styles */
  panelTitle?: CSSStyles;
  /** Close button styles */
  closeButton?: CSSStyles;
  /** Panel body/content area styles */
  panelBody?: CSSStyles;
  /** Form group container styles */
  formGroup?: CSSStyles;
  /** Form label styles */
  formLabel?: CSSStyles;
  /** Textarea styles */
  textarea?: CSSStyles;
  /** Error message styles */
  errorMessage?: CSSStyles;
  /** Panel footer styles */
  panelFooter?: CSSStyles;
  /** Submit button styles */
  submitButton?: CSSStyles;
  /** Backdrop/overlay styles */
  backdrop?: CSSStyles;
  /** Toast/success message styles */
  toast?: CSSStyles;
}

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
  defaultType?: string;

  /** Default question for all types (used as fallback if button doesn't specify one) */
  question?: string;

  /** Prefill configuration */
  prefill?: {
    type?: string;
    text?: string;
  };

  /** Accent color for the widget (legacy - use formStyle instead) */
  accentColor?: string;

  /** Z-index for positioning */
  zIndex?: number;

  /** Button configurations - defines what buttons to show */
  buttons?: ButtonConfig[];

  /** Form style configuration */
  formStyle?: FormStyle;
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
  open(type?: string, overrides?: FormOptions): Promise<void>;

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
