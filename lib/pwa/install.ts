/**
 * Install-as-app support. Chrome and Edge fire `beforeinstallprompt` once, early; an inline script in the root
 * layout (INSTALL_CAPTURE_SCRIPT) keeps that event on `window` so an "Install app" button can use it later.
 * Safari on iPhone/iPad has no install prompt, so callers show "Share → Add to Home Screen" steps instead.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __hasvikInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

/** available: we can show Chrome's install dialog. ios: show the Add to Home Screen steps. */
export type InstallState = "available" | "installed" | "ios" | "unsupported";

const CAPTURED_EVENT = "hasvik-install-prompt";

export const INSTALL_CAPTURE_SCRIPT =
  `addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__hasvikInstallPrompt=e;dispatchEvent(new Event('${CAPTURED_EVENT}'))});` +
  `addEventListener('appinstalled',function(){window.__hasvikInstallPrompt=null;window.__hasvikInstalled=true;dispatchEvent(new Event('${CAPTURED_EVENT}'))});`;

const isStandalone = () =>
  matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true ||
  (window as Window & { __hasvikInstalled?: boolean }).__hasvikInstalled === true;

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function subscribeInstall(callback: () => void) {
  const standalone = matchMedia("(display-mode: standalone)");
  window.addEventListener(CAPTURED_EVENT, callback);
  standalone.addEventListener("change", callback);
  return () => {
    window.removeEventListener(CAPTURED_EVENT, callback);
    standalone.removeEventListener("change", callback);
  };
}

export function getInstallState(): InstallState {
  if (isStandalone()) return "installed";
  if (window.__hasvikInstallPrompt) return "available";
  if (isIos()) return "ios";
  return "unsupported";
}

export const getServerInstallState = (): InstallState => "unsupported";

/** Opens the browser's install dialog. Resolves true when the person installs. */
export async function promptInstall(): Promise<boolean> {
  const event = window.__hasvikInstallPrompt;
  if (!event) return false;
  await event.prompt();
  const { outcome } = await event.userChoice;
  // The event can only be used once.
  window.__hasvikInstallPrompt = null;
  window.dispatchEvent(new Event(CAPTURED_EVENT));
  return outcome === "accepted";
}

/** Production only: in development a cached worker would get in the way of hot reload. */
export function registerServiceWorker() {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
    // Not fatal: the app works the same, it just cannot be installed or show the offline page.
  });
}
