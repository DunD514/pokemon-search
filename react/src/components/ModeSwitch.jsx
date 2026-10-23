import { useEffect, useRef, useState } from 'react';

export default function ModeSwitch({ currentMode = 'react', currentQuery = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on a click outside the switcher or on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function getTargetUrl(targetMode) {
    try {
      const targetPort = targetMode === 'vanilla' ? '8080' : '5173';
      const targetUrl = new URL(window.location.href);
      targetUrl.port = targetPort;
      // Carry the current search over so the other app opens on the same Pokémon
      const query = currentQuery.trim();
      if (query) {
        targetUrl.searchParams.set('q', query);
      } else {
        targetUrl.searchParams.delete('q');
      }
      return targetUrl.toString();
    } catch {
      return targetMode === 'vanilla' ? 'http://localhost:8080' : 'http://localhost:5173';
    }
  }

  function handleItemClick(event, targetMode) {
    if (targetMode === currentMode) {
      event.preventDefault();
      setIsOpen(false);
    }
  }

  const isReact = currentMode === 'react';

  return (
    <div
      ref={containerRef}
      className={`mode-switch-wrapper ${isOpen ? 'is-open' : ''}`}
    >
      <button
        type="button"
        className="mode-switch-btn"
        id="mode-switch-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="mode-switch-menu"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Switch between React and Vanilla JS modes"
      >
        <span
          className={`mode-switch-btn__indicator mode-switch-btn__indicator--${currentMode}`}
        />
        <span className="mode-switch-btn__icon">
          {isReact ? (
            <svg
              width="17"
              height="15"
              viewBox="-11.5 -10.23 23 20.46"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              aria-hidden="true"
            >
              <circle cx="0" cy="0" r="2.05" fill="currentColor" />
              <ellipse rx="11" ry="4.2" />
              <ellipse rx="11" ry="4.2" transform="rotate(60)" />
              <ellipse rx="11" ry="4.2" transform="rotate(120)" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect width="24" height="24" rx="4" fill="#f7df1e" />
              <path
                d="M7 16.5c0 1.5 1 2.5 2.5 2.5 1.2 0 2-.8 2-2.5V9h-2v7.5c0 .5-.2.8-.7.8-.4 0-.8-.3-.8-.8V13H6v3.5zm7.5 2.5c2 0 3.5-1 3.5-3 0-1.8-1.2-2.3-2.5-2.7l-.5-.2c-.8-.3-1.2-.5-1.2-1.1 0-.5.4-.9 1.1-.9.7 0 1.2.3 1.5.9l1.6-1c-.6-1.1-1.7-1.6-3.1-1.6-1.8 0-3.1 1.1-3.1 2.8 0 1.7 1.1 2.3 2.4 2.7l.5.2c.8.3 1.3.6 1.3 1.2 0 .6-.5 1-1.3 1-.9 0-1.5-.4-1.8-1.2l-1.7.9c.5 1.5 1.8 2 3.2 2z"
                fill="#000000"
              />
            </svg>
          )}
        </span>
        <span className="mode-switch-btn__label">
          {isReact ? 'React Mode' : 'Vanilla JS'}
        </span>
        <svg
          className="mode-switch-btn__chevron"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        className="mode-switch-menu"
        id="mode-switch-menu"
        role="menu"
        aria-label="Select implementation mode"
      >
        <div className="mode-switch-menu__header">
          <span className="mode-switch-menu__header-title">Framework Switcher</span>
          <span className="mode-switch-menu__header-sub">Compare implementation approaches</span>
        </div>

        <div className="mode-switch-menu__list">
          {/* React Option */}
          <a
            href={getTargetUrl('react')}
            className={`mode-switch-item ${isReact ? 'mode-switch-item--active' : ''}`}
            role="menuitem"
            aria-current={isReact ? 'page' : undefined}
            onClick={(e) => handleItemClick(e, 'react')}
          >
            <div className="mode-switch-item__icon-box mode-switch-item__icon-box--react">
              <svg
                width="20"
                height="18"
                viewBox="-11.5 -10.23 23 20.46"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                aria-hidden="true"
              >
                <circle cx="0" cy="0" r="2.05" fill="currentColor" />
                <ellipse rx="11" ry="4.2" />
                <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                <ellipse rx="11" ry="4.2" transform="rotate(120)" />
              </svg>
            </div>
            <div className="mode-switch-item__content">
              <div className="mode-switch-item__top">
                <span className="mode-switch-item__title">React 19</span>
                <span className="mode-switch-item__port">:5173</span>
              </div>
              <span className="mode-switch-item__desc">Vite SPA • Declarative VDOM</span>
            </div>
            <div className="mode-switch-item__state">
              {isReact ? (
                <span className="mode-switch-item__current-badge">Active</span>
              ) : (
                <svg
                  className="mode-switch-item__arrow"
                  width="15"
                  height="15"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </a>

          {/* Vanilla Option */}
          <a
            href={getTargetUrl('vanilla')}
            className={`mode-switch-item ${!isReact ? 'mode-switch-item--active' : ''}`}
            role="menuitem"
            aria-current={!isReact ? 'page' : undefined}
            onClick={(e) => handleItemClick(e, 'vanilla')}
          >
            <div className="mode-switch-item__icon-box mode-switch-item__icon-box--vanilla">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect width="24" height="24" rx="4" fill="#f7df1e" />
                <path
                  d="M7 16.5c0 1.5 1 2.5 2.5 2.5 1.2 0 2-.8 2-2.5V9h-2v7.5c0 .5-.2.8-.7.8-.4 0-.8-.3-.8-.8V13H6v3.5zm7.5 2.5c2 0 3.5-1 3.5-3 0-1.8-1.2-2.3-2.5-2.7l-.5-.2c-.8-.3-1.2-.5-1.2-1.1 0-.5.4-.9 1.1-.9.7 0 1.2.3 1.5.9l1.6-1c-.6-1.1-1.7-1.6-3.1-1.6-1.8 0-3.1 1.1-3.1 2.8 0 1.7 1.1 2.3 2.4 2.7l.5.2c.8.3 1.3.6 1.3 1.2 0 .6-.5 1-1.3 1-.9 0-1.5-.4-1.8-1.2l-1.7.9c.5 1.5 1.8 2 3.2 2z"
                  fill="#000000"
                />
              </svg>
            </div>
            <div className="mode-switch-item__content">
              <div className="mode-switch-item__top">
                <span className="mode-switch-item__title">Vanilla JavaScript</span>
                <span className="mode-switch-item__port">:8080</span>
              </div>
              <span className="mode-switch-item__desc">Pure DOM • Zero Libraries</span>
            </div>
            <div className="mode-switch-item__state">
              {!isReact ? (
                <span className="mode-switch-item__current-badge">Active</span>
              ) : (
                <svg
                  className="mode-switch-item__arrow"
                  width="15"
                  height="15"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </a>
        </div>

        <div className="mode-switch-menu__footer">
          <span>Identical design tokens & PokéAPI logic</span>
        </div>
      </div>
    </div>
  );
}
