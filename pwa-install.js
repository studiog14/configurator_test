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
  // Przełącz treść na komunikat sukcesu
  switchToInstalledContent();
});

// Function to switch to PWA success screen
function switchToInstalledContent() {
  // Ukryj welcome screen
  const welcomeScreen = document.getElementById('welcome-screen');
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
  }
  
  // Pokaż PWA success screen
  const pwaBScreen = document.getElementById('pwa-success-screen');
  if (pwaBScreen) {
    pwaBScreen.classList.add('show');
    pwaBScreen.style.display = 'flex';
  }
  
  // Ukryj przycisk instalacji na welcome screen
  hideWelcomeInstallButton();
  
  console.log('PWA: Switched to success screen after installation');
}

// Show install button in welcome screen
function showWelcomeInstallButton() {
  console.log('PWA: Showing install button');
  
  const container = document.getElementById('pwa-install-container');
  const button = document.getElementById('welcome-install-btn');
  
  // Sprawdź czy to mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  if (container && button && !isAppInstalled() && isMobile) {
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
        <p><strong>3.</strong> Wybierz "Dodaj do ekranu początkowego"</p>
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
  // Sprawdź czy to mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Check if app is already installed and switch content accordingly
  if (isAppInstalled() && isMobile) {
    switchToInstalledContent();
  }
  
  // Show install button after 3 seconds if not installed and on mobile
  // TYMCZASOWO WYŁĄCZONE - nie uruchamiaj timera instalacji
  // setTimeout(() => {
  //   if (!isAppInstalled() && isMobile) {
  //     // For browsers that don't fire beforeinstallprompt (like iOS Safari)
  //     if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  //       showWelcomeInstallButton();
  //     }
  //   }
  // }, 3000);
  
  // Hide button if already installed or on desktop
  if (isAppInstalled() || !isMobile) {
    console.log('PWA: App is already installed or on desktop');
    hideWelcomeInstallButton();
  }
  
  // Dodaj obsługę przycisku "Kontynuuj" na welcome screen
  const welcomeContinueBtn = document.getElementById('welcome-continue-btn');
  if (welcomeContinueBtn) {
    welcomeContinueBtn.addEventListener('click', () => {
      // Ukryj welcome screen
      const welcomeScreen = document.getElementById('welcome-screen');
      if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
      }
      
      console.log('PWA: User continued from welcome screen without installing');
    });
  }
  
  // Dodaj obsługę przycisku "Kontynuuj" w PWA success screen
  const pwaContinueBtn = document.getElementById('pwa-success-continue-btn');
  if (pwaContinueBtn) {
    pwaContinueBtn.addEventListener('click', () => {
      // Ukryj PWA success screen
      const pwaBScreen = document.getElementById('pwa-success-screen');
      if (pwaBScreen) {
        pwaBScreen.classList.remove('show');
        pwaBScreen.style.display = 'none';
      }
      
      // Pokaż welcome screen lub przejdź do aplikacji
      const welcomeScreen = document.getElementById('welcome-screen');
      if (welcomeScreen) {
        welcomeScreen.style.display = 'flex';
      }
      
      console.log('PWA: User continued from success screen');
    });
  }
});

// Export functions for global use
window.installPWA = installPWA;
window.showWelcomeInstallButton = showWelcomeInstallButton;
window.hideWelcomeInstallButton = hideWelcomeInstallButton;
window.switchToInstalledContent = switchToInstalledContent;
window.isAppInstalled = isAppInstalled;

// Check installation state on page load
document.addEventListener('DOMContentLoaded', () => {
  // Delay check to ensure DOM is fully loaded
  setTimeout(() => {
    if (isAppInstalled()) {
      console.log('PWA: App is installed, switching to installed content');
      switchToInstalledContent();
    }
  }, 200);
});

// Also check when the page becomes visible (in case of navigation)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isAppInstalled()) {
    switchToInstalledContent();
  }
});
