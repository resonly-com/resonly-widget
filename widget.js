/**
 * Resonly Widget - Self-contained feedback widget
 * No external dependencies, no network calls
 */
(function() {
  'use strict';

  const VERSION = '1.0.0';
  const STORAGE_KEY = 'resonly_widget_submissions_v1';
  const WIDGET_TAG = 'resonly-widget';

  // Default configuration
  const DEFAULT_CONFIG = {
    position: 'bottom-left',
    defaultType: null,
    question: 'Share your thoughts',
    questionsByType: {
      feedback: 'What feedback do you have?',
      issue: 'What issue did you encounter?',
      idea: 'What idea do you have?'
    },
    prefill: null,
    accentColor: '#7c3aed',
    zIndex: 999999
  };

  let currentConfig = { ...DEFAULT_CONFIG };
  let widgetInstance = null;
  let isInitialized = false;

  /**
   * Generate a random ID
   */
  function generateId() {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  /**
   * Get submissions from localStorage
   */
  function getSubmissions() {
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
  function saveSubmission(type, text) {
    const submission = {
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
  function clearSubmissions() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[ResonlyWidget] Failed to clear localStorage:', e);
    }
  }

  /**
   * Web Component Definition
   */
  class ResonlyWidgetElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.isOpen = false;
      this.currentType = null;
      this.currentOverrides = null;
    }

    connectedCallback() {
      this.render();
      this.attachEventListeners();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }

    attachEventListeners() {
      // ESC key to close
      this._handleKeydown = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closePanel();
        }
      };
      document.addEventListener('keydown', this._handleKeydown);
    }

    removeEventListeners() {
      if (this._handleKeydown) {
        document.removeEventListener('keydown', this._handleKeydown);
      }
    }

    render() {
      const position = currentConfig.position;
      const accentColor = currentConfig.accentColor;
      const zIndex = currentConfig.zIndex;

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
            border-bottom: 1px solid #e5e7eb;
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
            padding: 20px;
            flex: 1;
            overflow-y: auto;
          }

          .form-group {
            margin-bottom: 16px;
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
            border-top: 1px solid #e5e7eb;
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

          /* Focus trap helper */
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
                <label class="form-label" for="feedback-text">Your message</label>
                <textarea
                  class="form-textarea"
                  id="feedback-text"
                  placeholder="Type your message here..."
                  required
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

      // Attach event listeners
      this.attachWidgetListeners();
    }

    attachWidgetListeners() {
      const buttons = this.shadowRoot.querySelectorAll('.widget-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.type;
          this.openPanel(type);
        });
      });

      const closeBtn = this.shadowRoot.querySelector('.close-btn');
      closeBtn.addEventListener('click', () => this.closePanel());

      const backdrop = this.shadowRoot.querySelector('.panel-backdrop');
      backdrop.addEventListener('click', () => this.closePanel());

      const submitBtn = this.shadowRoot.querySelector('.submit-btn');
      submitBtn.addEventListener('click', () => this.handleSubmit());

      const form = this.shadowRoot.querySelector('.feedback-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      const textarea = this.shadowRoot.querySelector('.form-textarea');
      textarea.addEventListener('input', () => {
        const error = this.shadowRoot.querySelector('.form-error');
        error.classList.remove('visible');
      });
    }

    openPanel(type, overrides = {}) {
      this.currentType = type;
      this.currentOverrides = overrides;
      this.isOpen = true;

      const panel = this.shadowRoot.querySelector('.panel');
      const backdrop = this.shadowRoot.querySelector('.panel-backdrop');
      const title = this.shadowRoot.querySelector('.panel-title');
      const typeLabel = this.shadowRoot.querySelector('.panel-type');
      const textarea = this.shadowRoot.querySelector('.form-textarea');
      const error = this.shadowRoot.querySelector('.form-error');

      // Set question
      let question = overrides.question;
      if (!question && currentConfig.questionsByType[type]) {
        question = currentConfig.questionsByType[type];
      }
      if (!question) {
        question = currentConfig.question;
      }
      title.textContent = question;

      // Set type label
      typeLabel.textContent = type;

      // Set prefill text
      textarea.value = overrides.text || '';

      // Clear error
      error.classList.remove('visible');

      // Show panel
      panel.classList.add('open');
      backdrop.classList.add('open');

      // Focus textarea
      setTimeout(() => textarea.focus(), 100);
    }

    closePanel() {
      this.isOpen = false;
      const panel = this.shadowRoot.querySelector('.panel');
      const backdrop = this.shadowRoot.querySelector('.panel-backdrop');
      const textarea = this.shadowRoot.querySelector('.form-textarea');

      panel.classList.remove('open');
      backdrop.classList.remove('open');
      textarea.value = '';
      this.currentType = null;
      this.currentOverrides = null;
    }

    handleSubmit() {
      const textarea = this.shadowRoot.querySelector('.form-textarea');
      const error = this.shadowRoot.querySelector('.form-error');
      const text = textarea.value.trim();

      if (!text) {
        error.classList.add('visible');
        textarea.focus();
        return;
      }

      // Save submission
      saveSubmission(this.currentType, text);

      // Show toast
      this.showToast();

      // Close panel
      this.closePanel();
    }

    showToast() {
      const toast = this.shadowRoot.querySelector('.toast');
      toast.classList.add('visible');

      setTimeout(() => {
        toast.classList.remove('visible');
      }, 2500);
    }

    updateConfig(config) {
      currentConfig = { ...DEFAULT_CONFIG, ...config };
      this.render();
    }

    destroy() {
      this.removeEventListeners();
      this.remove();
    }
  }

  // Register custom element
  if (!customElements.get(WIDGET_TAG)) {
    customElements.define(WIDGET_TAG, ResonlyWidgetElement);
  }

  /**
   * Global API
   */
  const ResonlyWidgetAPI = {
    version: VERSION,

    init(options = {}) {
      if (isInitialized && widgetInstance) {
        console.warn('[ResonlyWidget] Already initialized. Updating config...');
        currentConfig = { ...DEFAULT_CONFIG, ...options };
        widgetInstance.updateConfig(currentConfig);
        return;
      }

      currentConfig = { ...DEFAULT_CONFIG, ...options };

      // Create widget element
      widgetInstance = document.createElement(WIDGET_TAG);
      document.body.appendChild(widgetInstance);

      // Auto-open if defaultType is set with prefill
      if (options.prefill && options.prefill.type) {
        setTimeout(() => {
          this.open(options.prefill.type, { text: options.prefill.text });
        }, 100);
      }

      isInitialized = true;
      console.log('[ResonlyWidget] Initialized', VERSION);
    },

    open(type, overrides = {}) {
      if (!widgetInstance) {
        console.warn('[ResonlyWidget] Not initialized. Call init() first.');
        return;
      }

      const validType = type || currentConfig.defaultType || 'feedback';
      widgetInstance.openPanel(validType, overrides);
    },

    destroy() {
      if (widgetInstance) {
        widgetInstance.destroy();
        widgetInstance = null;
        isInitialized = false;
        console.log('[ResonlyWidget] Destroyed');
      }
    },

    // Debug/testing helpers
    _getSubmissions: getSubmissions,
    _clearSubmissions: clearSubmissions
  };

  // Expose global API
  window.ResonlyWidget = ResonlyWidgetAPI;

  // Auto-init if not already initialized (optional)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Auto-init with defaults if not manually initialized
      if (!isInitialized) {
        ResonlyWidgetAPI.init();
      }
    });
  }
})();
