// 🎬 REACT THREE FIBER CONFIGURATOR
// Używa createElement zamiast JSX, żeby uniknąć problemów z ES modules
// Three.js r156 + React Three Fiber v8.14 + Drei v9.85 (sprawdzone wersje)

import React, { useState, useEffect, useRef, Suspense, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
    OrbitControls, 
    Environment, 
    useGLTF, 
    ContactShadows,
    Float,
    Stage,
    Center,
    Loader
} from '@react-three/drei';
import * as THREE from 'three';

// 🌍 GLOBALNE ZMIENNE
let allData = [];
let mainModels = [];
let selectedChair = null;
let currentCategory = 'krzesla';

// 🎯 CAMERA SETTINGS - przywrócone z działającego backup
const CAMERA_SETTINGS = {
    fov: 12,
    position: [-4.50, 0.28, 4.53], // 🔧 Idealna pozycja ustawiona przez użytkownika v3
    target: [1, -0.5, 2], // 🔧 Wyśrodkowanie targetu  
    minDistance: 1, // minimalna odległość kamery od modelu (przybliżenie)
    maxDistance: 8  // maksymalna odległość kamery od modelu (oddalenie)
};

// 🪑 CHAIR MODEL COMPONENT
function ChairModel({ url, position = [0, 0, 0] }) {
    console.log('🪑 Loading chair model:', url);
    
    try {
        const { scene } = useGLTF(url);
        const meshRef = useRef();

        // 📱 iOS optymalizacje
        useEffect(() => {
            if (window.isIOS && scene) {
                scene.traverse((child) => {
                    if (child.isMesh && child.material) {
                        // Zmniejsz jakość dla iOS
                        if (child.material.precision) {
                            child.material.precision = 'lowp';
                        }
                        child.castShadow = false;
                        child.receiveShadow = false;
                        
                        // Aktualizuj encoding dla nowszej wersji Three.js
                        if (child.material.map) {
                            child.material.map.colorSpace = THREE.SRGBColorSpace;
                        }
                    }
                });
            }
            console.log('✅ Chair model loaded and optimized:', url);
        }, [scene]);

        // 🎬 Subtle floating animation
        useFrame((state) => {
            if (meshRef.current) {
                meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
            }
        });

        return createElement(Center, {},
            createElement(Float, {
                speed: 1,
                rotationIntensity: 0.1,
                floatIntensity: 0.1
            },
                createElement('primitive', {
                    ref: meshRef,
                    object: scene.clone(),
                    position: position,
                    scale: 1
                })
            )
        );
    } catch (error) {
        console.error('❌ Error loading chair model:', url, error);
        return null;
    }
}

// 🎬 3D SCENE COMPONENT
function Scene3D({ selectedModel }) {
    return createElement(Canvas, {
        camera: { 
            position: CAMERA_SETTINGS.position, 
            fov: CAMERA_SETTINGS.fov,
            near: 0.1,
            far: 100
        },
        gl: { 
            antialias: !window.isIOS, // Wyłącz antialias na iOS dla performance
            alpha: true,
            powerPreference: window.isIOS ? "default" : "high-performance"
        },
        style: { background: '#f0f0f0' }
    },
        createElement(Suspense, { fallback: null },
            // 🌅 ENVIRONMENT - Drei helper for HDR
            createElement(Environment, {
                files: "hdr/hamburg_hbf_1k.hdr",
                background: false,
                intensity: window.isIOS ? 0.5 : 1.0
            }),
            
            // 📷 CAMERA CONTROLS - Drei helper z dokładnymi ustawieniami
            createElement(OrbitControls, {
                target: CAMERA_SETTINGS.target,
                minDistance: CAMERA_SETTINGS.minDistance,
                maxDistance: CAMERA_SETTINGS.maxDistance,
                dampingFactor: 0.1,
                enableDamping: true,
                enablePan: true,
                enableZoom: true,
                enableRotate: true,
                autoRotate: false
            }),
            
            // 🎭 STAGE - Drei helper for optimal lighting
            createElement(Stage, {
                shadows: !window.isIOS,
                adjustCamera: false,
                intensity: window.isIOS ? 0.5 : 1,
                environment: "city"
            },
                // 🪑 CHAIR MODEL - zawsze renderuj domyślny lub wybrany model
                createElement(ChairModel, {
                    url: `chairs/${selectedModel?.Nazwa || 'Amy-2'}.glb`,
                    position: [0, 0, 0]
                })
            ),
            
            // 🌫️ CONTACT SHADOWS (tylko dla desktop) - Drei helper
            !window.isIOS && createElement(ContactShadows, {
                position: [0, -1, 0],
                opacity: 0.3,
                scale: 5,
                blur: 2,
                far: 2
            })
        )
    );
}

// 🎯 MAIN APP COMPONENT
function ConfiguratorApp() {
    const [selectedModel, setSelectedModel] = useState({
        Nazwa: 'Amy-2', // Domyślne krzesło na start
        Kategoria: 'krzesla'
    });

    useEffect(() => {
        console.log('🎯 App initialized with default chair:', selectedModel);
        
        // Listen for chair selection events
        const handleChairSelection = (event) => {
            console.log('📡 Chair selection event received:', event.detail);
            setSelectedModel(event.detail);
        };

        window.addEventListener('chairSelected', handleChairSelection);
        
        return () => {
            window.removeEventListener('chairSelected', handleChairSelection);
        };
    }, []);

    return React.createElement(React.Fragment, {},
        // 🎬 3D SCENE
        createElement(Scene3D, { selectedModel: selectedModel }),
        
        // 🔄 DREI LOADER
        createElement(Loader)
    );
}

// 🏷️ SETUP CATEGORY BUTTONS
function setupCategoryButtons() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const category = btn.getAttribute('data-category');
            
            // Update active state
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter chairs
            filterChairsByCategory(category);
        });
    });
}

// 🔍 SETUP SEARCH
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            if (searchTerm) {
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            }
            
            filterChairsBySearch(searchTerm);
        });
    }
}

// 🎯 SET DEFAULT CATEGORY
function setDefaultCategory() {
    const defaultBtn = document.querySelector('.category-btn[data-category="krzesla"]');
    if (defaultBtn) {
        defaultBtn.classList.add('active');
    }
}

// 📊 ŁADOWANIE DANYCH Z GOOGLE SHEETS
async function loadDataFromSheet() {
    const sheetId = '1vCs6YeHgKqlYwg8rvJOqVzNRnXeATJCBuK-zh3NNj78';
    const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Dane&v=${new Date().getTime()}`;
    
    try {
        const response = await fetch(sheetURL + '?nocache=' + Date.now(), { 
            cache: 'no-store',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const csvText = await response.text();
        const rows = csvText.trim().split('\n');
        const headers = rows.shift().split(',').map(h => h.trim().replace(/"/g, ''));
        
        allData = rows.map(row => {
            const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            const obj = {};
            headers.forEach((header, index) => obj[header] = values[index]?.trim().replace(/"/g, '') || '');
            return obj;
        }).filter(item => item.Visible?.toLowerCase() !== 'false');

        const mainModelsFromData = allData.filter(d => {
            const grupa = (d.Grupa || d.Group || d.grupa || '').toLowerCase();
            const typ = (d.Typ || d.Type || d.typ || '').toLowerCase();
            const kategoria = (d.Kategoria || d.Category || d.kategoria || '').toLowerCase();
            
            return ['krzesło', 'kubełek', 'chair', 'bucket'].some(term => 
                grupa.includes(term) || typ.includes(term) || kategoria.includes(term)
            );
        });
        
        mainModels = mainModelsFromData;
        renderChairs(mainModels);
        console.log('✅ Dane załadowane:', mainModels.length, 'krzeseł');
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        mainModels = [
            { Nazwa: 'Amy-2', Kategoria: 'krzesla', Obrazek: 'icons/chair_icon.png' },
            { Nazwa: 'Ava', Kategoria: 'hooker', Obrazek: 'icons/chair_icon.png' },
            { Nazwa: 'Carine', Kategoria: 'biurowe', Obrazek: 'icons/chair_icon.png' }
        ];
        renderChairs(mainModels);
    }
}

// 🏷️ FILTER CHAIRS BY CATEGORY
function filterChairsByCategory(category) {
    const filteredChairs = mainModels.filter(chair => {
        const chairCategory = (chair.Kategoria || '').toLowerCase().trim();
        return chairCategory === category.toLowerCase();
    });
    renderChairs(filteredChairs);
    currentCategory = category;
}

// 🔍 FILTER CHAIRS BY SEARCH
function filterChairsBySearch(searchTerm) {
    if (!searchTerm) {
        if (currentCategory) {
            filterChairsByCategory(currentCategory);
        } else {
            renderChairs(mainModels);
        }
        return;
    }
    
    const filteredChairs = mainModels.filter(chair => {
        const chairName = (chair.Nazwa || '').toLowerCase();
        return chairName.includes(searchTerm);
    });
    renderChairs(filteredChairs);
}

// 🪑 RENDER CHAIRS
function renderChairs(chairs = mainModels) {
    const container = document.getElementById('chairs-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    chairs.forEach((chair) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'thumbnail-wrapper';
        
        const button = document.createElement('div');
        button.className = 'thumbnail';
        button.title = chair.Nazwa;

        button.addEventListener('click', () => {
            // Update selection
            selectedChair = chair;
            console.log('🎯 Chair selected:', chair.Nazwa);
            
            // Hide welcome screen
            const welcomeScreen = document.getElementById('welcome-screen');
            if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
                welcomeScreen.classList.add('hidden');
            }
            
            // Update visual selection
            container.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('selected'));
            button.classList.add('selected');
            
            // Trigger React re-render via custom event
            window.dispatchEvent(new CustomEvent('chairSelected', { detail: chair }));
        });
        
        const img = document.createElement('img');
        let imageSrc = chair.Obrazek || chair.Image || 'icons/chair_icon.png';
        
        if (imageSrc.startsWith('./')) {
            imageSrc = imageSrc.substring(2);
        }
        if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/')) {
            imageSrc = './' + imageSrc;
        }
        
        img.src = imageSrc;
        img.alt = chair.Nazwa || 'Bez nazwy';
        img.onerror = () => { img.src = './icons/chair_icon.png'; };
        
        button.appendChild(img);
        
        const caption = document.createElement('div');
        caption.className = 'thumbnail-caption';
        caption.textContent = chair.Nazwa;
        
        wrapper.appendChild(button);
        wrapper.appendChild(caption);
        container.appendChild(wrapper);
    });
}

// 🚀 INICJALIZACJA APLIKACJI
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting React Three Fiber Configurator...');
    console.log('📦 Three.js version expected: r156');
    console.log('📦 React Three Fiber version expected: v8.14');
    console.log('📦 Drei version expected: v9.85');
    console.log('📦 CDN: ESM.SH z external dependencies');
    
    const canvas = document.getElementById('canvas');
    const loader = document.getElementById('custom-loader');
    const app = document.getElementById('app');
    
    try {
        // 🔍 Debug import versions
        console.log('🔍 THREE.REVISION:', THREE.REVISION);
        
        // 🎬 Render React App
        const root = createRoot(canvas);
        root.render(createElement(ConfiguratorApp));
        
        console.log('✅ React App rendered successfully');
        
        // 📊 Setup UI interactions
        setupCategoryButtons();
        setupSearch();
        setDefaultCategory();
        await loadDataFromSheet();
        
        // ✅ Show app
        setTimeout(() => {
            console.log('🎯 Ukrywam loader i pokazuję app...');
            
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }
            
            if (app) {
                app.style.visibility = 'visible';
                app.style.opacity = '1';
                app.classList.add('visible');
            }
            
            console.log('✅ React Three Fiber app ready!');
            
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error starting app:', error);
        console.error('❌ Error stack:', error.stack);
        if (loader) {
            loader.innerHTML = `
                <img src="icons/FK_logo.png" alt="Fajne Krzesła" style="max-width: 200px; margin-bottom: 20px;" />
                <p style="color: #FFD700; text-align: center; font-size: 18px;">
                    ❌ Error: ${error.message}<br><br>
                    🔄 Spróbuj odświeżyć stronę<br><br>
                    📊 Three.js: ${THREE.REVISION || 'Unknown'}
                </p>
            `;
        }
    }
});

// 📱 DEBUG FUNCTIONS
window.debugConfigurator = function() {
    console.log('=== 🔍 DEBUG CONFIGURATOR STATE ===');
    console.log('Data loaded:', allData.length, 'items');
    console.log('Main models:', mainModels.length, 'chairs');
    console.log('Selected chair:', selectedChair);
    console.log('Current category:', currentCategory);
};

// 🔄 PRELOAD DEFAULT MODEL
useGLTF.preload('chairs/Amy-2.glb');
