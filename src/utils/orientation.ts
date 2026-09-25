// Screen orientation lock & landscape helper for Android and mobile devices

export async function requestLandscapeMode(): Promise<boolean> {
  try {
    // 1. Enter Fullscreen first (required by most Android browsers for screen.orientation.lock)
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (document.documentElement as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      }
    }

    // 2. Lock screen orientation to landscape
    if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen) {
      const screenOrientation = window.screen.orientation as unknown as {
        lock?: (orientation: string) => Promise<void>;
      };
      if (typeof screenOrientation.lock === 'function') {
        try {
          await screenOrientation.lock('landscape');
          return true;
        } catch {
          // Some devices only accept 'landscape-primary'
          try {
            await screenOrientation.lock('landscape-primary');
            return true;
          } catch {
            // Screen orientation lock not permitted without full standalone PWA on some platforms
          }
        }
      }
    }
    return !!document.fullscreenElement;
  } catch {
    return false;
  }
}

export function unlockOrientation(): void {
  try {
    if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen) {
      const screenOrientation = window.screen.orientation as unknown as {
        unlock?: () => void;
      };
      if (typeof screenOrientation.unlock === 'function') {
        screenOrientation.unlock();
      }
    }
  } catch {
    // Ignore error
  }
}

export function isPortraitOrientation(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(orientation: portrait)').matches;
}
