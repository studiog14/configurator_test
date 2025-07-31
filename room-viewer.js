import * as THREE from 'three';
import { ThreeViewer } from 'threepipe';

export async function initRoomScene() {
  console.log('room-viewer.js loaded ✅');

  // HTML elementy
  const viewerContainer = document.getElementById('room-viewer-container');
  const sidebar = document.getElementById('sidebar');
  const configOverview = document.getElementById('config-overview');
  const backButton = document.getElementById('back-to-sidebar');
  const loadingScreen = document.getElementById('loading-screen');

  // Pokaż spinner
  if (loadingScreen) loadingScreen.style.display = 'flex';

  // Inicjalizacja viewer-a
  const viewer = new ThreeViewer({
    canvas: document.getElementById('canvas'),
    rendererSettings: { antialias: true }
  });

  // Załaduj krzesło
  try {
    const chair = await viewer.load('chairs/Ava.glb', { autoCenter: true });
    chair.name = 'viewer-chair';
    viewer.scene.add(chair);
  } catch (e) {
    console.error('❌ Błąd ładowania krzesła', e);
  }

  // Załaduj scenę pokoju
  try {
    const roomScene = await viewer.load('scene/room-scene.glb', {
      autoCenter: false,
      autoScale: false,
      customScene: true,
    });

    roomScene.name = 'room-scene.glb';
    roomScene.position.set(0, 0, 0);
    viewer.scene.add(roomScene);

    // Szukaj kamery z Blender-a
    let blenderCamera = null;
    roomScene.traverse(obj => {
  if (obj.isCamera && obj.name === 'Camera') {
    blenderCamera = obj;
  }
});


    if (blenderCamera) {
      viewer.scene.remove(blenderCamera);
      viewer.scene.add(blenderCamera);
      viewer.camera = blenderCamera;
      viewer.scene.activeCamera = blenderCamera;
      blenderCamera.updateProjectionMatrix();
      console.log('🎥 Kamera z Blender-a ustawiona');
    } else {
      console.warn('⚠️ Brak kamery w scenie pokoju');
    }

  } catch (e) {
    console.error('❌ Błąd ładowania sceny pokoju', e);
  }

  // Przełącz UI
  if (viewerContainer) viewerContainer.style.display = 'block';
  if (sidebar) sidebar.style.display = 'none';
  if (configOverview) configOverview.style.display = 'none';
  if (backButton) backButton.style.display = 'block';

  // Ukryj loader po zakończeniu
  if (loadingScreen) loadingScreen.style.display = 'none';

  // Obsługa przycisku Powrót
  backButton.onclick = () => {
    // UI: wróć do konfiguratora
    if (viewerContainer) viewerContainer.style.display = 'none';
    if (sidebar) sidebar.style.display = 'block';
    if (configOverview) configOverview.style.display = 'block';
    if (backButton) backButton.style.display = 'none';

    // Usuń scenę pokoju
    const room = viewer.scene.getObjectByName('room-scene');
    if (room) {
      viewer.scene.remove(room);
      room.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // Reset pozycji kamery — domyślna z konfiguratora
    viewer.camera.position.set(0, 1.5, 3);
    viewer.camera.lookAt(0, 1.5, 0);
    viewer.camera.updateProjectionMatrix();

    console.log('↩️ Powrót zakończony');
  };

  // QR CODE FUNCTIONALITY
  const qrBtn = document.getElementById('qr-button');
  const qrPopup = document.getElementById('qr-popup');
  const qrCloseBtn = document.getElementById('qr-close-btn');

  if (qrBtn) {
    qrBtn.addEventListener('click', () => {
      const currentUrl = window.location.href;
      
      // Clear previous QR code
      const qrcodeDiv = document.getElementById('qrcode');
      qrcodeDiv.innerHTML = '';
      
      // Generate new QR code
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrcodeDiv, {
          text: currentUrl,
          width: 200,
          height: 200,
          colorDark: '#000000',
          colorLight: '#ffffff'
        });
      } else {
        console.warn('QRCode library not loaded');
        qrcodeDiv.innerHTML = '<p>QR Code library not available</p>';
      }
      
      qrPopup.style.display = 'flex';
    });
  }

  if (qrCloseBtn) {
    qrCloseBtn.addEventListener('click', () => {
      qrPopup.style.display = 'none';
    });
  }

  // Close popup when clicking outside
  if (qrPopup) {
    qrPopup.addEventListener('click', (e) => {
      if (e.target === qrPopup) {
        qrPopup.style.display = 'none';
      }
    });
  }
}
