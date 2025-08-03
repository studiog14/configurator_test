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
        <div style="text-align: center; padding: 20px;">
          <h2>✅ Aplikacja załadowana pomyślnie!</h2>
          <p>Wykryto urządzenie iOS</p>
          <p>Dane załadowane: ${lines.length} rekordów</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; margin: 10px; background: #007AFF; color: white; border: none; border-radius: 8px;">
            Kontynuuj do aplikacji
          </button>
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

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIOSFallback);
} else {
  initIOSFallback();
}

// Also try on window load
window.addEventListener('load', initIOSFallback);
