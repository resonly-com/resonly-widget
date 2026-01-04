import type { WidgetConfig } from './types';

/**
 * Widget App - Self-contained feedback widget UI
 * No external dependencies, no network calls
 */

const STORAGE_KEY = 'resonly_widget_submissions_v1';

/**
 * Submission data structure
 */
interface Submission {
  id: string;
  type: 'feedback' | 'issue' | 'idea';
  text: string;
  createdAt: string;
  pageUrl: string;
}

/**
 * Widget configuration extended with custom options
 */
interface WidgetAppConfig extends WidgetConfig {
  questionsByType?: {
    feedback?: string;
    issue?: string;
    idea?: string;
  };
  question?: string;
  accentColor?: string;
  zIndex?: number;
}

/**
 * Form override options
 */
interface FormOptions {
  question?: string;
  text?: string;
}

/**
 * Generate a random ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Get submissions from localStorage
 */
function getSubmissions(): Submission[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('[ResonlyWidget] Failed to read localStorage:', e);
    return [];
  }
}

/**
 * Save submission to localStorage
 */
function saveSubmission(type: 'feedback' | 'issue' | 'idea', text: string): Submission {
  const submission: Submission = {
    id: generateId(),
    type,
    text,
    createdAt: new Date().toISOString(),
    pageUrl: window.location.href
  };

  try {
    const submissions = getSubmissions();
    submissions.push(submission);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    return submission;
  } catch (e) {
    console.warn('[ResonlyWidget] Failed to save to localStorage:', e);
    return submission;
  }
}

/**
 * Clear all submissions (for testing)
 */
export function clearSubmissions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[ResonlyWidget] Failed to clear localStorage:', e);
  }
}

/**
 * Get all submissions (for debugging)
 */
export function getAllSubmissions(): Submission[] {
  return getSubmissions();
}

/**
 * Widget App class - manages the UI and interactions
 */
class WidgetApp {
  private shadowRoot: ShadowRoot;
  private config: WidgetAppConfig;
  private isOpen = false;
  private currentType: 'feedback' | 'issue' | 'idea' | null = null;
  private currentOverrides: FormOptions | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(shadowRoot: ShadowRoot, config: WidgetAppConfig) {
    this.shadowRoot = shadowRoot;
    this.config = {
      ...config,
      question: config.question || 'Share your thoughts',
      questionsByType: config.questionsByType || {
        feedback: 'What feedback do you have?',
        issue: 'What issue did you encounter?',
        idea: 'What idea do you have?'
      },
      accentColor: config.accentColor || '#7c3aed',
      zIndex: config.zIndex || 999999
    };
  }

  /**
   * Render the widget UI
   */
  render(): void {
    const position = this.config.position || 'bottom-left';
    const accentColor = this.config.accentColor!;
    const zIndex = this.config.zIndex!;

    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :host {
          --accent-color: ${accentColor};
          --z-index: ${zIndex};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }

        .widget-container {
          position: fixed;
          ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
          bottom: 20px;
          z-index: var(--z-index);
        }

        .widget-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .widget-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          min-width: 120px;
          text-align: left;
        }

        .widget-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          filter: brightness(1.1);
        }

        .widget-btn:active {
          transform: translateY(0);
        }

        .panel-backdrop {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: calc(var(--z-index) + 1);
          animation: fadeIn 0.2s;
        }

        .panel-backdrop.open {
          display: block;
        }

        .panel {
          position: fixed;
          ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
          bottom: 200px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          width: 400px;
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 240px);
          z-index: calc(var(--z-index) + 2);
          display: none;
          flex-direction: column;
          animation: slideUp 0.3s;
        }

        .panel.open {
          display: flex;
        }

        .panel-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .panel-title {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .panel-type {
          display: inline-block;
          margin-top: 4px;
          padding: 2px 8px;
          background: var(--accent-color);
          color: white;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #6b7280;
          font-size: 20px;
          line-height: 1;
          transition: color 0.2s;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .close-btn:hover {
          color: #111827;
        }

        .panel-body {
          padding: 0 20px;
          flex: 1;
          overflow-y: auto;
        }

        .form-group {
          margin: 0;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        .form-textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .form-error {
          color: #dc2626;
          font-size: 12px;
          margin-top: 4px;
          display: none;
        }

        .form-error.visible {
          display: block;
        }

        .panel-footer {
          padding: 16px 20px;
          display: flex;
          justify-content: flex-end;
        }

        .submit-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .submit-btn:hover {
          filter: brightness(1.1);
        }

        .submit-btn:active {
          transform: scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toast {
          position: fixed;
          ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
          bottom: 80px;
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: calc(var(--z-index) + 3);
          display: none;
          animation: slideUp 0.3s;
        }

        .toast.visible {
          display: block;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .panel:focus {
          outline: none;
        }
      </style>

      <div class="widget-container">
        <div class="widget-buttons">
          <button class="widget-btn" data-type="feedback" aria-label="Share feedback">
            💬 Feedback
          </button>
          <button class="widget-btn" data-type="issue" aria-label="Report an issue">
            🐛 Issue
          </button>
          <button class="widget-btn" data-type="idea" aria-label="Share an idea">
            💡 Idea
          </button>
        </div>
      </div>

      <div class="panel-backdrop"></div>

      <div class="panel" role="dialog" aria-modal="true" tabindex="-1">
        <div class="panel-header">
          <div>
            <div class="panel-title"></div>
            <span class="panel-type"></span>
          </div>
          <button class="close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="panel-body">
          <form class="feedback-form">
            <div class="form-group">
              <textarea
                class="form-textarea"
                id="feedback-text"
                placeholder="Type your message here..."
                required
                aria-label="Your message"
              ></textarea>
              <div class="form-error">Please enter your message</div>
            </div>
          </form>
        </div>
        <div class="panel-footer">
          <button class="submit-btn" type="submit">Submit</button>
        </div>
      </div>

      <div class="toast">Saved! ✓</div>
    `;

    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Button clicks
    const buttons = this.shadowRoot.querySelectorAll('.widget-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = (btn as HTMLElement).dataset.type as 'feedback' | 'issue' | 'idea';
        this.open(type);
      });
    });

    // Close button
    const closeBtn = this.shadowRoot.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    // Backdrop click
    const backdrop = this.shadowRoot.querySelector('.panel-backdrop');
    backdrop?.addEventListener('click', () => this.close());

    // Submit button
    const submitBtn = this.shadowRoot.querySelector('.submit-btn');
    submitBtn?.addEventListener('click', () => this.handleSubmit());

    // Form submit
    const form = this.shadowRoot.querySelector('.feedback-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Textarea input (clear error)
    const textarea = this.shadowRoot.querySelector('.form-textarea');
    textarea?.addEventListener('input', () => {
      const error = this.shadowRoot.querySelector('.form-error');
      error?.classList.remove('visible');
    });

    // ESC key to close
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Open the panel with a specific type
   */
  open(type: 'feedback' | 'issue' | 'idea', overrides: FormOptions = {}): void {
    this.currentType = type;
    this.currentOverrides = overrides;
    this.isOpen = true;

    const panel = this.shadowRoot.querySelector('.panel');
    const backdrop = this.shadowRoot.querySelector('.panel-backdrop');
    const title = this.shadowRoot.querySelector('.panel-title');
    const typeLabel = this.shadowRoot.querySelector('.panel-type');
    const textarea = this.shadowRoot.querySelector('.form-textarea') as HTMLTextAreaElement;
    const error = this.shadowRoot.querySelector('.form-error');

    // Set question
    let question = overrides.question;
    if (!question && this.config.questionsByType && this.config.questionsByType[type]) {
      question = this.config.questionsByType[type];
    }
    if (!question) {
      question = this.config.question;
    }
    if (title) title.textContent = question || 'Share your thoughts';

    // Set type label
    if (typeLabel) typeLabel.textContent = type;

    // Set prefill text
    if (textarea) textarea.value = overrides.text || '';

    // Clear error
    error?.classList.remove('visible');

    // Show panel
    panel?.classList.add('open');
    backdrop?.classList.add('open');

    // Focus textarea
    setTimeout(() => textarea?.focus(), 100);
  }

  /**
   * Close the panel
   */
  close(): void {
    this.isOpen = false;
    const panel = this.shadowRoot.querySelector('.panel');
    const backdrop = this.shadowRoot.querySelector('.panel-backdrop');
    const textarea = this.shadowRoot.querySelector('.form-textarea') as HTMLTextAreaElement;

    panel?.classList.remove('open');
    backdrop?.classList.remove('open');
    if (textarea) textarea.value = '';
    this.currentType = null;
    this.currentOverrides = null;
  }

  /**
   * Handle form submission
   */
  private handleSubmit(): void {
    const textarea = this.shadowRoot.querySelector('.form-textarea') as HTMLTextAreaElement;
    const error = this.shadowRoot.querySelector('.form-error');
    const text = textarea?.value.trim() || '';

    if (!text) {
      error?.classList.add('visible');
      textarea?.focus();
      return;
    }

    if (!this.currentType) return;

    // Save submission
    saveSubmission(this.currentType, text);

    // Show toast
    this.showToast();

    // Close panel
    this.close();
  }

  /**
   * Show success toast
   */
  private showToast(): void {
    const toast = this.shadowRoot.querySelector('.toast');
    toast?.classList.add('visible');

    setTimeout(() => {
      toast?.classList.remove('visible');
    }, 2500);
  }

  /**
   * Destroy the widget and clean up
   */
  destroy(): void {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    this.shadowRoot.innerHTML = '';
  }
}

// Store the instance
let appInstance: WidgetApp | null = null;

/**
 * Mount the widget app into the shadow root
 */
export async function mount(shadowRoot: ShadowRoot, config: WidgetConfig): Promise<void> {
  console.log('[ResonlyWidget:App] Mounting with config:', config);

  // Create and render the app
  appInstance = new WidgetApp(shadowRoot, config);
  appInstance.render();

  return Promise.resolve();
}

/**
 * Unmount the widget app
 */
export function unmount(shadowRoot: ShadowRoot): void {
  console.log('[ResonlyWidget:App] Unmounting');
  if (appInstance) {
    appInstance.destroy();
    appInstance = null;
  }
}

/**
 * Open the widget programmatically
 */
export function open(type?: 'feedback' | 'issue' | 'idea', overrides?: FormOptions): void {
  if (!appInstance) {
    console.warn('[ResonlyWidget:App] Widget not mounted yet');
    return;
  }
  appInstance.open(type || 'feedback', overrides);
}

/**
 * Close the widget
 */
export function close(): void {
  if (!appInstance) return;
  appInstance.close();
}
