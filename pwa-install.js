// PWA Install Handler
let deferredPrompt;

// Check if app is already installed
function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

// Show install prompt for supported browsers
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: Install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  showWelcomeInstallButton();
});

// Handle successful installation
window.addEventListener('appinstalled', (e) => {
  console.log('PWA: App installed successfully');
  hideWelcomeInstallButton();
});

// Show install button in welcome screen
function showWelcomeInstallButton() {
  const container = document.getElementById('pwa-install-container');
  const button = document.getElementById('welcome-install-btn');
  
  if (container && button && !isAppInstalled()) {
    container.style.display = 'block';
    button.addEventListener('click', installPWA);
    
    // Animate button
    setTimeout(() => {
      button.style.animation = 'pulse 2s infinite';
    }, 1000);
  }
}

// Hide install button in welcome screen
function hideWelcomeInstallButton() {
  const container = document.getElementById('pwa-install-container');
  if (container) {
    container.style.display = 'none';
  }
}

// Install PWA
async function installPWA() {
  if (!deferredPrompt) {
    // Manual instructions for iOS
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      showIOSInstallInstructions();
      return;
    }
    
    // For other browsers without prompt
    showManualInstallInstructions();
    return;
  }
  
  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA: User accepted install');
    } else {
      console.log('PWA: User declined install');
    }
    
    deferredPrompt = null;
    hideWelcomeInstallButton();
  } catch (error) {
    console.error('PWA: Install error:', error);
  }
}

// iOS install instructions
function showIOSInstallInstructions() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    padding: 20px;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 350px;
      text-align: center;
      position: relative;
    ">
      <button onclick="this.parentElement.parentElement.remove()" style="
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
      ">×</button>
      
      <h2 style="margin-bottom: 20px; color: #F5C842;">📱 Instalacja na iOS</h2>
      
      <div style="text-align: left; line-height: 1.6;">
        <p><strong>1.</strong> Naciśnij przycisk "Udostępnij" <span style="font-size: 20px;">⬆️</span></p>
        <p><strong>2.</strong> Przewiń w dół</p>
        <p><strong>3.</strong> Wybierz "Dodaj do ekranu głównego"</p>
        <p><strong>4.</strong> Potwierdź nazwę i naciśnij "Dodaj"</p>
      </div>
      
      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        Aplikacja pojawi się na ekranie głównym jako ikona!
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Manual install instructions
function showManualInstallInstructions() {
  alert('Aby zainstalować aplikację:\n\n• Chrome: Menu → Zainstaluj aplikację\n• Edge: Menu → Aplikacje → Zainstaluj tę witrynę jako aplikację\n• Firefox: Menu → Zainstaluj\n\nLub dodaj stronę do zakładek dla szybkiego dostępu.');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Show install button after 3 seconds if not installed and on welcome screen
  setTimeout(() => {
    if (!isAppInstalled()) {
      // For browsers that don't fire beforeinstallprompt (like iOS Safari)
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        showWelcomeInstallButton();
      }
    }
  }, 3000);
  
  // Hide button if already installed
  if (isAppInstalled()) {
    console.log('PWA: App is already installed');
    hideWelcomeInstallButton();
  }
});

// Export functions for global use
window.installPWA = installPWA;
window.showWelcomeInstallButton = showWelcomeInstallButton;
window.hideWelcomeInstallButton = hideWelcomeInstallButton;
