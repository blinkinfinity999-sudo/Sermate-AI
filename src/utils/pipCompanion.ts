/**
 * Document Picture-in-Picture (PiP) and Floating Window Companion Manager.
 * Allows SerMate AI to pop out into a floating window that stays visible
 * over other desktop applications and browser tabs.
 */

export function isDocumentPipSupported(): boolean {
  return typeof window !== 'undefined' && 
    'documentPictureInPicture' in window && 
    typeof (window as any).documentPictureInPicture?.requestWindow === 'function';
}

/**
 * Copies all <style> and <link rel="stylesheet"> elements from the host document
 * into the PiP window's head so that Tailwind and custom styling render properly.
 */
export function injectStylesToPipWindow(pipWindow: Window) {
  try {
    // 1. Copy style sheets with their raw rules
    [...document.styleSheets].forEach((styleSheet) => {
      try {
        const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('\n');
        const style = pipWindow.document.createElement('style');
        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
      } catch {
        // Cross-origin stylesheet fallback
        const link = pipWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.type = styleSheet.type || 'text/css';
        link.href = styleSheet.href || '';
        if (link.href) pipWindow.document.head.appendChild(link);
      }
    });

    // 2. Clone any explicit style or link tags in document.head
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      pipWindow.document.head.appendChild(node.cloneNode(true));
    });

    // 3. Ensure custom font imports and utility classes are present
    const customStyle = pipWindow.document.createElement('style');
    customStyle.textContent = `
      html, body {
        background-color: #020617 !important;
        color: #f8fafc !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 100vh !important;
        width: 100vw !important;
        overflow: hidden !important;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
      }
      #pip-widget-root {
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    `;
    pipWindow.document.head.appendChild(customStyle);
  } catch (err) {
    console.warn('Style injection to PiP window:', err);
  }
}

/**
 * Request Document Picture-in-Picture window.
 */
export async function requestDocumentPipWindow(options?: { width?: number; height?: number }): Promise<{ pipWindow: Window; container: HTMLElement } | null> {
  const width = options?.width || 420;
  const height = options?.height || 640;

  if (!isDocumentPipSupported()) {
    throw new Error('Document Picture-in-Picture API is not supported in this browser. Please use Google Chrome 116+ or Microsoft Edge 116+.');
  }

  const pipWindow: Window = await (window as any).documentPictureInPicture.requestWindow({
    width,
    height,
  });

  if (!pipWindow) return null;

  // Set window metadata
  pipWindow.document.title = 'SerMate AI — Floating Screen Companion';
  pipWindow.document.documentElement.className = 'bg-slate-950 text-slate-100 font-sans';
  pipWindow.document.body.className = 'bg-slate-950 text-slate-100 font-sans m-0 p-0 overflow-hidden h-screen w-screen';

  // Inject all stylesheets
  injectStylesToPipWindow(pipWindow);

  // Create mount root container
  let container = pipWindow.document.getElementById('pip-widget-root');
  if (!container) {
    container = pipWindow.document.createElement('div');
    container.id = 'pip-widget-root';
    pipWindow.document.body.appendChild(container);
  }

  return { pipWindow, container };
}

/**
 * Fallback standalone popup window for browsers without Document PiP.
 */
export function openStandaloneFloatingHUD(): Window | null {
  const url = `${window.location.origin}${window.location.pathname}#standalone-hud`;
  const width = 420;
  const height = 660;
  const left = Math.max(0, window.screen.availWidth - width - 40);
  const top = Math.max(0, Math.floor((window.screen.availHeight - height) / 2));
  const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,location=no,toolbar=no,menubar=no`;
  const popup = window.open(url, 'Sermate_Floating_HUD', features);
  if (popup) popup.focus();
  return popup;
}

export const openStandalonePopupHUD = openStandaloneFloatingHUD;
