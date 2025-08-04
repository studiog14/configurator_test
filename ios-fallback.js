// iOS Fallback Loading System
console.log('📱 iOS Fallback system loading...');

// Detect iOS devices more reliably
function isIOSDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  const maxTouchPoints = navigator.maxTouchPoints;
  
  return /iphone|ipad|ipod/.test(userAgent) || 
         (platform === 'macintel' && maxTouchPoints > 1) ||
         /iphone|ipad|ipod|ios/.test(platform);
}

// iOS-specific initialization
function initIOSFallback() {
  if (!isIOSDevice()) {
    console.log('📱 Not iOS device, skipping fallback');
    return;
  }
  
  console.log('📱 iOS device detected, initializing fallback...');
  
  // Force hide loader after 5 seconds on iOS
  setTimeout(() => {
    console.log('📱 iOS: Force hiding loader after 5s');
    const loader = document.getElementById('custom-loader');
    const app = document.getElementById('app');
    
    if (loader) {
      loader.style.display = 'none';
      console.log('📱 iOS: Loader hidden');
    }
    
    if (app) {
      app.style.visibility = 'visible';
      console.log('📱 iOS: App shown');
    }
    
    // Show simplified UI for iOS
    showIOSSimplifiedUI();
  }, 5000);
  
  // Disable service worker on iOS (can cause issues)
  if ('serviceWorker' in navigator) {
    console.log('📱 iOS: Unregistering service workers...');
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('📱 iOS: Service worker unregistered');
      });
    });
  }
  
  // Disable cache on iOS
  if ('caches' in window) {
    console.log('📱 iOS: Clearing all caches...');
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
        console.log('📱 iOS: Cache cleared:', cacheName);
      });
    });
  }
}

// Simplified UI for iOS
function showIOSSimplifiedUI() {
  console.log('📱 iOS: Setting up simplified UI...');
  
  // Try to load data with simpler approach
  loadDataSimplified();
}

// Simplified data loading for iOS
async function loadDataSimplified() {
  console.log('📱 iOS: Starting simplified data loading...');
  
  try {
    const sheetId = '1lZMJ-4Qd0nDY-7Hl9iV-pJnZSTVzYiA-A3rDq_bC16U';
    const simpleURL = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    
    console.log('📱 iOS: Fetching data from:', simpleURL);
    
    const response = await fetch(simpleURL, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv,text/plain,*/*'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('📱 iOS: Data loaded, length:', csvText.length);
    
    if (csvText.length < 100) {
      throw new Error('Data too short, might be empty');
    }
    
    // Parse CSV simply
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    console.log('📱 iOS: Parsed', lines.length, 'lines with headers:', headers.length);
    
    // Show success message
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
      welcomeScreen.innerHTML = `
        <img id="welcome-logo" src="icons/FK_logo.png" alt="Fajne Krzesła" style="max-width: 120px; height: auto; margin-bottom: 15px;">
        <div class="title-with-accent">
            <h1 id="welcome-title" style="font-size: 1.8em; margin: 10px 0;">Konfigurator Krzeseł</h1>
            <div class="yellow-accent-line" style="width: 60px; height: 3px; background: #F5C842; margin: 10px auto;"></div>
        </div>
        
        <div style="text-align: center; padding: 15px; max-width: 350px; margin: 0 auto;">
          <p style="margin: 15px 0; line-height: 1.5; font-size: 14px;">Wybierz kategorię oraz model krzesła z bocznego panelu, aby rozpocząć konfigurację w 3D</p>
          
          <p style="margin: 15px 0; line-height: 1.5; font-size: 14px; color: #666;">Możesz również zapoznać się z naszymi promocjami i bestsellerami - najczęściej wybieranymi modelami krzeseł</p>
          
          <button onclick="showInstallInstructions()" style="
            background: linear-gradient(135deg, #F5C842, #E5B432);
            color: #333;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(245, 200, 66, 0.4);
            transition: all 0.3s ease;
            margin: 10px;
          ">
            📱 Zainstaluj aplikację
          </button>
          
          <button onclick="continueToApp()" style="
            background: #007AFF;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
            transition: all 0.3s ease;
            margin: 10px;
          ">
            Kontynuuj do aplikacji
          </button>
          
          <p style="font-size: 12px; color: #888; margin-top: 15px;">
            ✅ Dane załadowane: ${lines.length} rekordów
          </p>
        </div>
      `;
      welcomeScreen.style.display = 'flex';
    }
    
  } catch (error) {
    console.error('📱 iOS: Error loading data:', error);
    
    // Show error with fallback options
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
      welcomeScreen.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <h2>⚠️ Problem z ładowaniem</h2>
          <p>Urządzenie: iOS (iPhone/iPad)</p>
          <p>Błąd: ${error.message}</p>
          
          <div style="margin: 20px 0;">
            <button onclick="tryAlternativeLoad()" style="padding: 10px 20px; margin: 10px; background: #007AFF; color: white; border: none; border-radius: 8px;">
              Spróbuj alternatywnego ładowania
            </button>
            
            <button onclick="openWebVersion()" style="padding: 10px 20px; margin: 10px; background: #34C759; color: white; border: none; border-radius: 8px;">
              Otwórz w Safari
            </button>
            
            <button onclick="installPWA()" style="padding: 10px 20px; margin: 10px; background: #FF9500; color: white; border: none; border-radius: 8px;">
              Zainstaluj jako aplikację
            </button>
          </div>
          
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            iOS może wymagać instalacji jako PWA lub otwarcia w Safari
          </p>
        </div>
      `;
      welcomeScreen.style.display = 'flex';
    }
  }
}

// Alternative loading method
window.tryAlternativeLoad = function() {
  console.log('📱 iOS: Trying alternative load method...');
  window.location.href = window.location.href.split('?')[0] + '?ios=1&t=' + Date.now();
};

// Open in Safari
window.openWebVersion = function() {
  console.log('📱 iOS: Opening in Safari...');
  const url = window.location.href.split('?')[0];
  window.open(url, '_blank');
};

// Install PWA
window.installPWA = function() {
  console.log('📱 iOS: PWA install instructions...');
  alert('Aby zainstalować jako aplikację:\n\n1. Otwórz w Safari\n2. Naciśnij przycisk "Udostępnij" (kwadrat ze strzałką)\n3. Wybierz "Dodaj do ekranu głównego"\n4. Potwierdź instalację');
};

// Show install instructions popup
window.showInstallInstructions = function() {
  console.log('📱 iOS: Showing install instructions...');
  
  // Try to trigger native install prompt first
  if (window.deferredInstallPrompt) {
    window.deferredInstallPrompt.prompt();
    window.deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('📱 User accepted the install prompt');
      } else {
        console.log('📱 User dismissed the install prompt');
        // Show manual instructions
        showManualInstallInstructions();
      }
      window.deferredInstallPrompt = null;
    });
  } else {
    // Show manual instructions
    showManualInstallInstructions();
  }
};

function showManualInstallInstructions() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      padding: 24px;
      max-width: 350px;
      width: 90%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    ">
      <h3 style="margin: 0 0 16px 0; color: #333;">📱 Instalacja aplikacji</h3>
      
      <div style="text-align: left; margin: 16px 0; padding: 16px; background: #f8f9fa; border-radius: 8px;">
        <p style="margin: 8px 0; font-size: 14px;"><strong>1.</strong> Otwórz w Safari</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>2.</strong> Naciśnij przycisk "Udostępnij" ⬆️</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>3.</strong> Wybierz "Dodaj do ekranu głównego"</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>4.</strong> Potwierdź instalację</p>
      </div>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #007AFF;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin: 8px;
      ">
        Rozumiem
      </button>
      
      <button onclick="tryAutoInstall()" style="
        background: #F5C842;
        color: #333;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin: 8px;
      ">
        Spróbuj automatycznie
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Continue to app function
window.continueToApp = function() {
  console.log('📱 iOS: Continuing to app...');
  const welcomeScreen = document.getElementById('welcome-screen');
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
  }
  
  // Show the main app
  const app = document.getElementById('app');
  if (app) {
    app.style.visibility = 'visible';
  }
  
  // Hide loader if still visible
  const loader = document.getElementById('custom-loader');
  if (loader) {
    loader.style.display = 'none';
  }
};

// Try auto install
window.tryAutoInstall = function() {
  console.log('📱 iOS: Attempting auto install...');
  
  // Close modal first
  const modal = document.querySelector('div[style*="position: fixed"]');
  if (modal) {
    modal.remove();
  }
  
  // Try various install methods
  if (window.BeforeInstallPromptEvent) {
    console.log('📱 iOS: Triggering BeforeInstallPromptEvent...');
    window.dispatchEvent(new Event('beforeinstallprompt'));
  }
  
  // Fallback: redirect to add to homescreen
  setTimeout(() => {
    alert('Dotknij przycisku Udostępnij (⬆️) w dolnej części Safari, a następnie "Dodaj do ekranu głównego"');
  }, 500);
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIOSFallback);
} else {
  initIOSFallback();
}

// Also try on window load
window.addEventListener('load', initIOSFallback);
