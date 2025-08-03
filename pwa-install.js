// PWA Install Handler
let deferredPrompt;
let installButton;

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
  showInstallButton();
});

// Handle successful installation
window.addEventListener('appinstalled', (e) => {
  console.log('PWA: App installed successfully');
  hideInstallButton();
  showWelcomeMessage();
});

// Create install button
function createInstallButton() {
  const button = document.createElement('button');
  button.id = 'install-pwa-btn';
  button.innerHTML = '📱 Zainstaluj aplikację';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #007AFF;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
    transition: all 0.3s ease;
    display: none;
  `;
  
  button.addEventListener('click', installPWA);
  document.body.appendChild(button);
  return button;
}

// Show install button
function showInstallButton() {
  if (!installButton) {
    installButton = createInstallButton();
  }
  
  if (!isAppInstalled()) {
    installButton.style.display = 'block';
    setTimeout(() => {
      installButton.style.transform = 'scale(1.1)';
      setTimeout(() => {
        installButton.style.transform = 'scale(1)';
      }, 200);
    }, 100);
  }
}

// Hide install button
function hideInstallButton() {
  if (installButton) {
    installButton.style.display = 'none';
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
    hideInstallButton();
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
      
      <h2 style="margin-bottom: 20px; color: #007AFF;">📱 Instalacja na iOS</h2>
      
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

// Welcome message after installation
function showWelcomeMessage() {
  const welcome = document.createElement('div');
  welcome.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #34C759;
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    font-weight: 600;
    z-index: 10001;
    box-shadow: 0 4px 20px rgba(52, 199, 89, 0.3);
  `;
  
  welcome.innerHTML = '✅ Aplikacja zainstalowana pomyślnie!';
  document.body.appendChild(welcome);
  
  setTimeout(() => {
    welcome.remove();
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Show install button after 5 seconds if not installed
  setTimeout(() => {
    if (!isAppInstalled() && !deferredPrompt) {
      // For browsers that don't fire beforeinstallprompt (like iOS Safari)
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        showInstallButton();
      }
    }
  }, 5000);
  
  // Hide button if already installed
  if (isAppInstalled()) {
    console.log('PWA: App is already installed');
  }
});

// Export functions for global use
window.installPWA = installPWA;
window.showInstallButton = showInstallButton;
window.hideInstallButton = hideInstallButton;
