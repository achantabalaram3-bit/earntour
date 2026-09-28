import React, {
  useEffect,
  useState,
} from 'react';

import { Download, X, Share } from 'lucide-react';

import './installPrompt.css';

const DISMISS_KEY = 'pl-pwa-install-dismissed';

function isStandalone() {
  return (
    window.matchMedia?.(
      '(display-mode: standalone)',
    )?.matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  const ua = window.navigator.userAgent || '';
  const isApple = /iphone|ipad|ipod/i.test(ua);
  const isSafari =
    /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  return isApple && isSafari;
}

/*
 * Prize League install popup.
 *
 * Sits just above the Free World bottom nav Home button. Uses the native
 * `beforeinstallprompt` on Chromium browsers, and shows a lightweight
 * "Add to Home Screen" tip on iOS Safari (which has no install event).
 * Auto-disappears once the app is installed (appinstalled event or when the
 * app is already running in standalone display mode).
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState(null);

  const [visible, setVisible] =
    useState(false);

  const [iosTip, setIosTip] =
    useState(false);

  useEffect(() => {
    if (isStandalone()) {
      return undefined;
    }

    if (
      sessionStorage.getItem(DISMISS_KEY) === '1'
    ) {
      return undefined;
    }

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      'beforeinstallprompt',
      onBeforeInstall,
    );

    window.addEventListener(
      'appinstalled',
      onInstalled,
    );

    // iOS Safari never fires beforeinstallprompt.
    if (isIos()) {
      setIosTip(true);
      setVisible(true);
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        onBeforeInstall,
      );
      window.removeEventListener(
        'appinstalled',
        onInstalled,
      );
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();

    try {
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setVisible(false);
      }
    } catch (error) {
      /* User dismissed the native dialog. */
    } finally {
      setDeferredPrompt(null);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="pl-install-prompt"
      data-testid="pwa-install-prompt"
      role="dialog"
      aria-label="Install Prize League app"
    >
      <div className="pl-install-icon" aria-hidden="true">
        <Download className="w-5 h-5" />
      </div>

      <div className="pl-install-copy">
        <strong>Install Prize League</strong>

        {iosTip ? (
          <span className="pl-install-ios">
            Tap <Share className="w-3.5 h-3.5 inline" /> then
            {' '}“Add to Home Screen”
          </span>
        ) : (
          <span>
            Add the app to your home screen for one-tap play
          </span>
        )}
      </div>

      {!iosTip && (
        <button
          type="button"
          className="pl-install-cta"
          data-testid="pwa-install-button"
          onClick={install}
        >
          Install
        </button>
      )}

      <button
        type="button"
        className="pl-install-close"
        data-testid="pwa-install-dismiss"
        aria-label="Dismiss install prompt"
        onClick={dismiss}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
