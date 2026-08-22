/**
 * System-Wide Floating HUD Window & Picture-in-Picture Companion Manager.
 * Allows SerMate AI to float outside of the browser on user's desktop/screen.
 */

export async function openStandaloneFloatingHUD(): Promise<Window | null> {
  const url = `${window.location.origin}${window.location.pathname}#standalone-hud`;
  const width = 420;
  const height = 660;
  const left = Math.max(0, window.screen.availWidth - width - 40);
  const top = Math.max(0, Math.floor((window.screen.availHeight - height) / 2));

  // 1. Try modern Document Picture-in-Picture API if available (Chrome 116+, Edge 116+)
  if ('documentPictureInPicture' in window && typeof (window as any).documentPictureInPicture?.requestWindow === 'function') {
    try {
      const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
        width,
        height,
      });

      if (pipWindow) {
        // Copy stylesheet rules to PiP window
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = pipWindow.document.createElement('style');
            style.textContent = cssRules;
            pipWindow.document.head.appendChild(style);
          } catch (e) {
            const link = pipWindow.document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type || 'text/css';
            link.href = styleSheet.href || '';
            if (link.href) pipWindow.document.head.appendChild(link);
          }
        });

        // Set PiP title and theme
        pipWindow.document.title = 'Sermate AI — System Floating HUD';
        pipWindow.document.body.className = 'bg-slate-950 text-slate-100 font-[\'Plus_Jakarta_Sans\',sans-serif] m-0 p-0 overflow-hidden';

        // Mount a container for React or redirect
        const container = pipWindow.document.createElement('div');
        container.id = 'pip-hud-root';
        container.style.width = '100vw';
        container.style.height = '100vh';
        pipWindow.document.body.appendChild(container);

        // Load iframe or content
        const iframe = pipWindow.document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        container.appendChild(iframe);

        return pipWindow;
      }
    } catch (pipErr) {
      console.log('Document PiP request fallback to standalone window:', pipErr);
    }
  }

  // 2. Fallback: Standalone popup window with always-on-top hints
  const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,location=no,toolbar=no,menubar=no`;
  const popup = window.open(url, 'Sermate_Floating_HUD', features);

  if (popup) {
    popup.focus();
  }
  return popup;
}
