let viewerInstance = null;
let defaultCamera = null;
let defaultControls = null;

export function setViewer(instance) {
  viewerInstance = instance;
}

export function getViewer() {
  return viewerInstance;
}

export function setDefaultCamera(camera) {
  defaultCamera = camera;
}

export function getDefaultCamera() {
  return defaultCamera;
}

export function setDefaultControls(controls) {
  defaultControls = controls;
}

export function getDefaultControls() {
  return defaultControls;
}

export function resetControls() {
  if (!defaultControls) return;

  // Wyłącz kontroler i włącz ponownie
  defaultControls.enabled = false;

  // Tutaj możesz dodać np. usuwanie event listenerów, jeśli trzeba — 
  // ale jeśli masz tylko jeden event listener dodany w głównym kodzie, to nie musisz go tu usuwać.

  defaultControls.enabled = true;

  // Event listener do clampCameraDistance możesz dodać ponownie w głównym kodzie,
  // ale jeśli chcesz, żeby było prosto — po prostu wywołaj resetControls() i kontroler zostanie włączony.
}
