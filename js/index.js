import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";

// Memory management variables
let animationId;
let isAnimating = false;
const loadedTextures = [];
const eventListeners = [];
const audioElements = [];
const disposableObjects = [];

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 1, 1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const loadingContainer = document.createElement("div");
loadingContainer.classList.add("loading-container");
loadingContainer.innerHTML = '<div class="loading-bar">Loading</div>';
document.body.appendChild(loadingContainer);

// Memory management functions
function loadTexture(url) {
    const texture = new THREE.TextureLoader().load(url);
    loadedTextures.push(texture);
    return texture;
}

function createTrackedAudio(src) {
    const audio = new Audio(src);
    audioElements.push(audio);
    return audio;
}

function addTrackedEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({element, event, handler});
}

function addDisposableObject(object) {
    disposableObjects.push(object);
}

function disposeMaterial(material) {
    if (material.map) material.map.dispose();
    if (material.lightMap) material.lightMap.dispose();
    if (material.bumpMap) material.bumpMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.specularMap) material.specularMap.dispose();
    if (material.envMap) material.envMap.dispose();
    if (material.alphaMap) material.alphaMap.dispose();
    if (material.aoMap) material.aoMap.dispose();
    if (material.displacementMap) material.displacementMap.dispose();
    if (material.emissiveMap) material.emissiveMap.dispose();
    if (material.gradientMap) material.gradientMap.dispose();
    if (material.metalnessMap) material.metalnessMap.dispose();
    if (material.roughnessMap) material.roughnessMap.dispose();
    material.dispose();
}

function disposeModel(model) {
    if (model) {
        model.traverse(obj => {
            if (obj.isMesh) {
                obj.geometry?.dispose();
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat && disposeMaterial(mat));
                } else if (obj.material) {
                    disposeMaterial(obj.material);
                }
            }
        });
        scene.remove(model);
    }
}

function cleanupScene() {
    console.log("Starting cleanup...");
    
    // Stop animation loop
    isAnimating = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Dispose all tracked textures
    loadedTextures.forEach(texture => {
        if (texture) texture.dispose();
    });
    loadedTextures.length = 0;

    // Dispose all models
    if (window.models && Array.isArray(window.models)) {
        window.models.forEach(model => disposeModel(model));
        window.models.length = 0;
    }

    // Dispose all tracked objects
    disposableObjects.forEach(obj => {
        if (obj && obj.dispose) obj.dispose();
    });
    disposableObjects.length = 0;

    // Dispose scene objects
    scene.traverse((object) => {
        if (object.isMesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => disposeMaterial(material));
                } else {
                    disposeMaterial(object.material);
                }
            }
        }
    });

    // Clear the scene
    while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Dispose renderer
    if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }

    // Dispose controls
    if (controls) {
        controls.dispose();
    }

    // Stop and cleanup audio
    audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.load();
    });
    audioElements.length = 0;

    // Remove all tracked event listeners
    eventListeners.forEach(({element, event, handler}) => {
        element.removeEventListener(event, handler);
    });
    eventListeners.length = 0;

    console.log("Cleanup completed");
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
addDisposableObject(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);
addDisposableObject(directionalLight);

// Initialize models array
window.models = [];

window.onload = () => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    loader.setDRACOLoader(dracoLoader);

    const loadingContainer = document.querySelector(".loading-container");
    const enterButton = document.getElementById("enter-button");
    const enterdiv = document.getElementById("enterBtn");
    let loadedModels = 0;
    const models = [];

    const modelPaths = [
        {
            path: 'https://d3n24sjr83qswf.cloudfront.net/models/logo3.glb',
            scale: 15,
            position: { x: 0, y: 0, z: 0 }
        },
        {
            path: 'https://d3n24sjr83qswf.cloudfront.net/models/sat1.glb',
            scale: 0.5,
            position: { x: -4, y: -2, z: -20 }
        },
        {
            path: 'https://d3n24sjr83qswf.cloudfront.net/models/Shuttle3.glb',
            scale: 0.24,
            position: { x: -30, y: -10, z: -50 }
        },
        {
            path: 'https://d3n24sjr83qswf.cloudfront.net/models/nebula3.glb',
            scale: 1,
            position: { x: 150, y: 150, z: -60 }
        },
        {
            path: 'https://d3n24sjr83qswf.cloudfront.net/models/craftplanet2.glb',
            scale: 0.3,
            position: { x: 90, y: 40, z: 160 }
        }
    ];

    const totalModels = modelPaths.length;

    function checkLoadingComplete() {
        if (loadedModels === totalModels) {
            loadingContainer.style.display = "none";
            if (enterButton) enterButton.style.display = "block";
        }
    }

    function loadModel(path, scale, position) {
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                model.scale.set(scale, scale, scale);
                model.position.set(position.x, position.y, position.z);
                scene.add(model);
                models.push(model);
                window.models.push(model);
                loadedModels++;
                checkLoadingComplete();
            },
            undefined,
            (error) => {
                console.error(`Error loading ${path}:`, error);
                loadedModels++;
                checkLoadingComplete();
            }
        );
    }

    modelPaths.forEach(({ path, scale, position }) => loadModel(path, scale, position));

    function switchModel(newModelPath) {
        models.forEach(disposeModel);
        models.length = 0;
        modelPaths.forEach(({ path, scale, position }) => {
            if (path === newModelPath) {
                loadModel(path, scale, position);
            }
        });
    }

    // When user clicks Enter, start zoomAndPan
    if (enterdiv) {
        addTrackedEventListener(enterdiv, "click", () => {
            if (enterButton) enterButton.style.display = "none";
            enterdiv.style.display = 'none';
            zoomAndPan();
        });
    }

    const zoomAndPan = () => {
        flyByAnimation();
        startAnimation();

        const container = document.getElementById("container");
        const footer = document.getElementById("footer");
        const chatBubble = document.getElementById('chat-bubble');

        if (container) {
            container.style.opacity = "0";
            container.style.pointerEvents = "none";
        }
        if (footer) {
            footer.style.opacity = "0";
            footer.style.pointerEvents = "none";
        }
        if (chatBubble) {
            chatBubble.style.opacity = "0";
            chatBubble.style.pointerEvents = "none";
        }

        camera.position.set(-100, -100, -100);
        const isMobile = window.innerWidth <= 600;

        if (typeof gsap !== 'undefined') {
            gsap.set(camera.position, {
                x: -40,
                y: -20,
                z: -120
            });

            gsap.set(camera, { fov: isMobile ? 75 : 75 });
            camera.updateProjectionMatrix();

            setTimeout(() => {
                if (welcomeSound && !isMuted) {
                    welcomeSound.currentTime = 0;
                    welcomeSound.play();
                }
            }, 5000);

            gsap.to(camera.position, {
                x: 3,
                y: 0,
                z: isMobile ? 6 : 3,
                duration: 6,
                ease: "power2.inOut",
                onUpdate: () => {
                    camera.updateProjectionMatrix();
                },
                onComplete: () => {
                    if (container) {
                        container.style.display = "block";
                        container.style.transition = "opacity 1s ease-in-out";
                        container.style.pointerEvents = "block";
                    }
                    if (footer) {
                        footer.style.display = "block";
                        footer.style.transition = "opacity 1s ease-in-out";
                        footer.style.pointerEvents = "block";
                    }
                    if (chatBubble) {
                        chatBubble.style.transition = "opacity 1s ease-in-out";
                        chatBubble.style.pointerEvents = "block";
                    }
                }
            });

            setTimeout(() => {
                if (!isMuted && acpTheme) {
                    acpTheme.currentTime = 0;
                    acpTheme.play();
                }
            }, 1000);

            gsap.to(camera, {
                fov: isMobile ? 50 : 50,
                duration: 7,
                ease: "power2.inOut",
                onUpdate: () => {
                    camera.updateProjectionMatrix();
                },
                onComplete: () => {
                    if (container) {
                        container.style.transition = "opacity 1s ease-in-out";
                        container.style.opacity = "1";
                        container.style.pointerEvents = "auto";
                    }
                    if (footer) {
                        footer.style.transition = "opacity 1s ease-in-out";
                        footer.style.opacity = "1";
                        footer.style.pointerEvents = "auto";
                    }
                    if (chatBubble) {
                        chatBubble.style.transition = "opacity 1s ease-in-out";
                        chatBubble.style.opacity = "1";
                        chatBubble.style.pointerEvents = "auto";
                    }
                }
            });
        }
    };
};

// Responsive adjustments for small screens
if (window.innerWidth <= 500) {
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.position.set(0, 0, 0);
        }
    });
}

// Spherical grid
const gridRadius = 12;
const gridDivisions = 30;

// Create spherical grid lines (longitude lines)
for (let i = 0; i < gridDivisions; i++) {
    const theta = (i / gridDivisions) * Math.PI * 2;
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let j = 0; j <= gridDivisions; j++) {
        const phi = (j / gridDivisions) * Math.PI;
        const x = gridRadius * Math.sin(phi) * Math.cos(theta);
        const y = gridRadius * Math.cos(phi);
        const z = gridRadius * Math.sin(phi) * Math.sin(theta);
        positions.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ color: 0x2761c3, opacity: 3 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    addDisposableObject(geometry);
    addDisposableObject(material);
}

// Create spherical grid lines (latitude lines)
for (let i = 0; i < gridDivisions; i++) {
    const phi = (i / gridDivisions) * Math.PI;
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let j = 0; j <= gridDivisions; j++) {
        const theta = (j / gridDivisions) * Math.PI * 2;
        const x = gridRadius * Math.sin(phi) * Math.cos(theta);
        const y = gridRadius * Math.cos(phi);
        const z = gridRadius * Math.sin(phi) * Math.sin(theta);
        positions.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ color: 0x2761c3, opacity: 1 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    addDisposableObject(geometry);
    addDisposableObject(material);
}

// Animation Loop variables
let gridRotationSpeed = 0.0005;
let particleRotationSpeed = -0.001;

// Particle system
const particleCount = 3000;
const particles = new THREE.BufferGeometry();
const positions = [];
const opacities = new Float32Array(particleCount).fill(1.0);
const flickerSpeeds = new Float32Array(particleCount).fill(0.04);

for (let i = 0; i < particleCount; i++) {
    positions.push(Math.random() * 1000 - 500);
    positions.push(Math.random() * 1000 - 500);
    positions.push(Math.random() * 1000 - 500);
    opacities[i] = Math.random();
    flickerSpeeds[i] = Math.random() * 1 + 4;
}

particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
particles.setAttribute('alpha', new THREE.Float32BufferAttribute(opacities, 1));
addDisposableObject(particles);

const particleTexture = loadTexture("https://threejs.org/examples/textures/sprites/circle.png");

const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        pointTexture: { value: particleTexture }
    },
    vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
            vAlpha = alpha;
            gl_PointSize = 4.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D pointTexture;
        varying float vAlpha;
        void main() {
            vec4 color = texture2D(pointTexture, gl_PointCoord);
            gl_FragColor = vec4(color.rgb, color.a * vAlpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});
addDisposableObject(particleMaterial);

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

function animateParticleFlicker() {
    for (let i = 0; i < particleCount; i++) {
        opacities[i] += (Math.random() - 0.5) * flickerSpeeds[i];
        opacities[i] = Math.max(0.1, Math.min(1.0, opacities[i]));
    }
    particles.attributes.alpha.needsUpdate = true;
}

// Shooting Star Particle System
const shootingStarCount = 200;
const shootingStars = new THREE.BufferGeometry();
const shootingStarPositions = [];
const velocities = [];
const lifetimes = [];

for (let i = 0; i < shootingStarCount; i++) {
    shootingStarPositions.push(Math.random() * 2000 - 1000);
    shootingStarPositions.push(Math.random() * 2000 - 1000);
    shootingStarPositions.push(Math.random() * 2000 - 1000);

    velocities.push(Math.random() * 0.5 - 0.25);
    velocities.push(Math.random() * 0.5 - 0.25);
    velocities.push(Math.random() * 0.5 - 0.25);

    lifetimes.push(Math.random() * 100 + 20);
}

shootingStars.setAttribute('position', new THREE.Float32BufferAttribute(shootingStarPositions, 3));
addDisposableObject(shootingStars);

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
});
addDisposableObject(starMaterial);

const shootingStarSystem = new THREE.Points(shootingStars, starMaterial);
scene.add(shootingStarSystem);

function updateShootingStars() {
    const positions = shootingStars.attributes.position.array;
    const velocityArray = velocities;
    const lifeArray = lifetimes;

    for (let i = 0; i < shootingStarCount; i++) {
        positions[i * 3] += velocityArray[i * 3];
        positions[i * 3 + 1] += velocityArray[i * 3 + 1];
        positions[i * 3 + 2] += velocityArray[i * 3 + 2];

        lifeArray[i]--;

        if (lifeArray[i] <= 0) {
            positions[i * 3] = Math.random() * 2000 - 1000;
            positions[i * 3 + 1] = Math.random() * 2000 - 1000;
            positions[i * 3 + 2] = Math.random() * 2000 - 1000;

            velocityArray[i * 3] = Math.random() * 0.5 - 0.25;
            velocityArray[i * 3 + 1] = Math.random() * 0.2 - 0.25;
            velocityArray[i * 3 + 2] = Math.random() * 0.2 - 0.25;

            lifeArray[i] = Math.random() * 100 + 80;
        }
    }

    shootingStars.attributes.position.needsUpdate = true;
}

// Utility functions
const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
};

const getRandomRockTexture = (() => {
    const textures = [
        'https://d3n24sjr83qswf.cloudfront.net/Images/Rocks011.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/Ground068.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/Moss002.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/Ground081.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/lava.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/Marble.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/Metal05.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/Onyx.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/Concrete.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/Asphalt.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/Ground.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/jupitermap.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/mars_1k_color.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/neptunemap.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/phobosbump.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/plutomap2k.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/saturnmap.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/venusmap.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/moonmap1k.jpg',
        'https://d3n24sjr83qswf.cloudfront.net/Images/earthcloudmap (1).jpg',
    ];

    return () => {
        if (textures.length > 0) {
            return textures.splice(Math.floor(Math.random() * textures.length), 1)[0];
        } else {
            return textures[Math.floor(Math.random() * textures.length)];
        }
    };
})();

// Planet creation functions
const createPlanet = (size, distance, positionY, textureUrl, rotationSpeed, color) => {
    const geometry = new THREE.SphereGeometry(size, 31, 32);
    const texture = loadTexture(textureUrl);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.4,
        color: new THREE.Color(color)
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(distance, positionY, -100);
    planet.rotationSpeed = rotationSpeed;
    scene.add(planet);
    
    addDisposableObject(geometry);
    addDisposableObject(material);
    window.models.push(planet);
    
    return planet;
};

// Generate unique textures and colors for each planet
const planetTextures = Array.from({ length: 12 }, () => getRandomRockTexture());
const planetColors = Array.from({ length: 12 }, () => getRandomColor());

// Create planets
const planet1 = createPlanet(4, 140, 40, planetTextures[0], 0.002, planetColors[0]);
const planet2 = createPlanet(12, -60, -15, planetTextures[1], 0.001, planetColors[1]);
const planet3 = createPlanet(2, 200, 30, planetTextures[2], 0.003, planetColors[2]);
const planet4 = createPlanet(4, -250, 10, planetTextures[3], 0.004, planetColors[3]);
const planet5 = createPlanet(2, 30, 5, planetTextures[4], 0.01, planetColors[4]);
const planet6 = createPlanet(12.5, -280, -25, planetTextures[5], 0.006, planetColors[5]);
const planet7 = createPlanet(8.8, 300, -30, planetTextures[6], 0.009, planetColors[6]);
const planet8 = createPlanet(3, -100, 2, planetTextures[7], 0.005, planetColors[7]);
const planet9 = createPlanet(2.5, 150, 40, planetTextures[8], 0.002, planetColors[8]);
const planet10 = createPlanet(6, -200, 50, planetTextures[9], 0.003, planetColors[9]);
const planet11 = createPlanet(4, 30, -40, planetTextures[10], 0.004, planetColors[10]);
const planet12 = createPlanet(4.2, 30, 60, planetTextures[11], 0.008, planetColors[11]);

const createRingedPlanet = (size, distance, positionY, textureUrl, ringTextureUrl, rotationSpeed, color) => {
    const planetGeometry = new THREE.SphereGeometry(size, 40, 56);
    const planetTexture = loadTexture(textureUrl);
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: planetTexture,
        roughness: 0.7,
        metalness: 0.4,
        color: new THREE.Color(color),
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    const ringGeometry = new THREE.RingGeometry(size * 1.8, size * 2.5, 64);
    const ringTexture = loadTexture(ringTextureUrl);
    const ringMaterial = new THREE.MeshStandardMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.2;
    ring.position.set(0, 0, 0);

    const ringedPlanet = new THREE.Group();
    ringedPlanet.add(planet);
    ringedPlanet.add(ring);
    ringedPlanet.position.set(distance, positionY, -300);
    ringedPlanet.rotationSpeed = rotationSpeed;

    scene.add(ringedPlanet);
    
    addDisposableObject(planetGeometry);
    addDisposableObject(planetMaterial);
    addDisposableObject(ringGeometry);
    addDisposableObject(ringMaterial);
    window.models.push(ringedPlanet);
    
    return ringedPlanet;
};

const ringedPlanet = createRingedPlanet(
    12, 350, 10,
    'https://d3n24sjr83qswf.cloudfront.net/Images/Ice.jpg',
    'https://d3n24sjr83qswf.cloudfront.net/Images/Foil002.png',
    0.005, "#89CFF0"
);

const createFirePlanet = (size, distance, positionY, textureUrl, rotationSpeed) => {
    const geometry = new THREE.SphereGeometry(size, 31, 32);
    const texture = loadTexture(textureUrl);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(1, 0, 0),
        emissiveIntensity: 1.5,
        roughness: 0.7,
        metalness: 0.4
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(distance, positionY, -100);
    planet.rotationSpeed = rotationSpeed;
    scene.add(planet);

    addDisposableObject(geometry);
    addDisposableObject(material);
    window.models.push(planet);

    return planet;
};

const createElectricPlanet = (size, distance, positionY, textureUrl, rotationSpeed) => {
    const geometry = new THREE.SphereGeometry(size, 31, 32);
    const texture = loadTexture(textureUrl);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(0, 0, 1),
        emissiveIntensity: 2.5,
        roughness: 0.5,
        metalness: 0.6
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(distance, positionY, -100);
    planet.rotationSpeed = rotationSpeed;
    scene.add(planet);
    
    addDisposableObject(geometry);
    addDisposableObject(material);
    window.models.push(planet);
    
    return planet;
};

const firePlanet = createFirePlanet(25, 500, 100, "./images/lava.jpg", 0.005);
const electricPlanet = createElectricPlanet(6, 400, 20, "./images/lava.jpg", 0.008);

// Modal functions
window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "block";
};

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
};

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "block";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}

// Social wheel functionality
document.addEventListener("DOMContentLoaded", function () {
    const socialLink = document.getElementById("socialLink");
    const wheel = document.getElementById("socialWheel");

    if (!socialLink || !wheel) return;

    function toggleSocialWheel(event) {
        event.preventDefault();
        event.stopPropagation();

        if (wheel.classList.contains("active")) {
            closeSocialWheel();
        } else {
            openSocialWheel();
        }
    }

    function openSocialWheel() {
        wheel.style.display = "flex";
        wheel.classList.remove("closing");
        requestAnimationFrame(() => {
            wheel.classList.add("active");
        });
    }

    function closeSocialWheel() {
        if (wheel.classList.contains("active")) {
            wheel.classList.add("closing");
            setTimeout(() => {
                wheel.classList.remove("active", "closing");
                wheel.style.display = "none";
            }, 300);
        }
    }

    addTrackedEventListener(socialLink, "click", toggleSocialWheel);

    addTrackedEventListener(document, "click", function (event) {
        if (!wheel.contains(event.target) && event.target !== socialLink) {
            closeSocialWheel();
        }
    });

    addTrackedEventListener(document, "touchstart", function (event) {
        if (!wheel.contains(event.target) && event.target !== socialLink) {
            closeSocialWheel();
        }
    });
});

// Version update function
function updateVersion() {
    let startDate = new Date("2025-03-15T00:00:00");
    let now = new Date();

    let diffInMs = now - startDate;
    let daysElapsed = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    let major = 1;
    let minor = 0;
    let patch = daysElapsed;

    if (patch >= 100) {
        minor += Math.floor(patch / 100);
        patch = patch % 100;
    }
    if (minor >= 50) {
        major += Math.floor(minor / 50);
        minor = minor % 50;
    }
    if (major > 10) {
        major = 10;
        minor = 50;
        patch = 100;
    }

    let version = `[Version ${major}.${minor}.${patch}]`;
    const versionElement = document.getElementById('version');
    if (versionElement) {
        versionElement.textContent = version;
    }
}

updateVersion();
setInterval(updateVersion, 86400000);

// Blinking light creation
function createBlinkingLight(position, color = 0xff0000, intensity = 40, size = 0.1) {
    const light = new THREE.PointLight(color, intensity, 40);
    const sphereGeometry = new THREE.SphereGeometry(size, .5, .5);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const lightGroup = new THREE.Group();
    lightGroup.add(light);
    lightGroup.add(sphere);
    lightGroup.position.set(position.x, position.y, position.z);

    scene.add(lightGroup);
    
    addDisposableObject(sphereGeometry);
    addDisposableObject(sphereMaterial);
    window.models.push(lightGroup);

    return light;
}

const light1 = createBlinkingLight({ x: -30, y: -9.5, z: -50 });
const light2 = createBlinkingLight({ x: 90, y: 45, z: 160 });
const whiteLight = createBlinkingLight({ x: -4, y: -2, z: -20 }, 0xffffff);

// UFO creation
const ufoGeometry = new THREE.CylinderGeometry(2, 8, 2, 64);
const ufoMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    metalness: 1,
    roughness: 0.2
});
const ufo = new THREE.Mesh(ufoGeometry, ufoMaterial);

const domeGeometry = new THREE.SphereGeometry(2, 32, 32);
const domeMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    transparent: true,
    opacity: 5,
    roughness: 0.1,
    metalness: 0.8
});
const dome = new THREE.Mesh(domeGeometry, domeMaterial);
dome.position.y = 1;

const ufoGroup = new THREE.Group();
ufoGroup.add(ufo);
ufoGroup.add(dome);
scene.add(ufoGroup);
ufoGroup.position.set(-100, 5, 10);

addDisposableObject(ufoGeometry);
addDisposableObject(ufoMaterial);
addDisposableObject(domeGeometry);
addDisposableObject(domeMaterial);
window.models.push(ufoGroup);

// Blinking lights under UFO
const blinkingLights = [];
const lightPositions = [
    { x: 2, y: -1, z: 4 },
    { x: -4, y: -1, z: 4 },
    { x: 4, y: -1, z: -4 },
    { x: -4, y: -1, z: -4 },
];

lightPositions.forEach((pos, index) => {
    const light = new THREE.PointLight(0xff0000, 4, 3);
    light.position.set(pos.x, pos.y, pos.z);
    scene.add(light);
    blinkingLights.push({ light, phase: index * Math.PI * 4 });
    addDisposableObject(light);
});

function flyByAnimation() {
    const ufoSound = createTrackedAudio('https://ik.imagekit.io/08srsqfeh/ufo.wav?updatedAt=1752899882219');
    ufoSound.volume = 0.09;

    setTimeout(() => {
        if (!isMuted) ufoSound.play();
    }, 500);

    if (typeof gsap !== 'undefined') {
        gsap.to(ufoGroup.position, {
            x: 120,
            y: 20,
            z: 7,
            duration: 4.5,
            ease: "power1.inOut",
            onComplete: () => {
                scene.remove(ufoGroup);
            }
        });

        gsap.to(ufoGroup.rotation, {
            z: -5,
            duration: 5,
            repeat: -1,
            yoyo: false,
            ease: "power1.inOut"
        });
    }
}

// Mobile detection
const isMobile = () => window.innerWidth <= 600;

// Audio setup
const hoverSound = createTrackedAudio('./audio/ps2s.mp3');
const clickSound = createTrackedAudio('./audio/12.mp3');
const acpTheme = createTrackedAudio('./audio/acptheme.mp3');
const welcomeSound = createTrackedAudio('./audio/Welcome .wav');

function setVolume() {
    const mobile = isMobile();
    hoverSound.volume = 0.07;
    clickSound.volume = 0.03;
    welcomeSound.volume = mobile ? 0.02 : 0.05;
    acpTheme.volume = mobile ? 0.005 : 0.04;
}

setVolume();
addTrackedEventListener(window, 'resize', setVolume);

let isMuted = false;
let hoverTimeout;
let isClicking = false;

const menuItems = document.querySelectorAll('.sound');
const muteToggle = document.getElementById('switch');

if (muteToggle) {
    addTrackedEventListener(muteToggle, 'change', () => {
        isMuted = !isMuted;

        if (isMuted) {
            acpTheme.pause();
        } else {
            acpTheme.currentTime = 0;
            acpTheme.play();
        }
    });
}

menuItems.forEach(item => {
    addTrackedEventListener(item, 'mouseenter', () => {
        if (!isMuted && !isClicking && window.innerWidth > 600) {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                hoverSound.currentTime = 0;
                hoverSound.play();
            }, 250);
        }
    });

    addTrackedEventListener(item, 'click', () => {
        if (!isMuted && window.innerWidth > 600) { 
            isClicking = true;
            clickSound.currentTime = 0;
            clickSound.play();

            clearTimeout(hoverTimeout);

            setTimeout(() => {
                isClicking = false;
            }, 50);
        }
    });
});

// Chat functionality
const bubble = document.getElementById('chat-bubble');
const chatWindow = document.getElementById('chat-window');
const chatCover = document.getElementById('chatCover');

let iframeLoaded = false;

if (bubble && chatWindow && chatCover) {
    addTrackedEventListener(bubble, 'click', () => {
        const isVisible = chatWindow.style.display === 'block';

        if (!iframeLoaded) {
            const iframe = document.createElement('iframe');
            iframe.src = "https://www.chatbase.co/chatbot-iframe/LQyVnaPo9zgfrPZ4ikRsk";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.frameBorder = "0";
            chatWindow.appendChild(iframe);
            iframeLoaded = true;
        }

        chatWindow.style.display = isVisible ? 'none' : 'block';
        chatCover.style.display = isVisible ? 'none' : 'block';
    });
}

// Animation function
function animate() {
    if (!isAnimating) return;
    
    animationId = requestAnimationFrame(animate);
    controls.update();

    if (electricPlanet && electricPlanet.updateElectricityParticles) {
        electricPlanet.updateElectricityParticles();
    }

    scene.rotation.y += gridRotationSpeed;
    const time = performance.now() * 0.007;

    if (light1) light1.intensity = Math.abs(Math.sin(time)) * 4;
    if (light2) light2.intensity = Math.abs(Math.sin(time + 1)) * 4;
    if (whiteLight) whiteLight.intensity = Math.abs(Math.sin(time * .1)) * 1;

    if (ufoGroup) ufoGroup.rotation.y += 0.01;

    blinkingLights.forEach(({ light, phase }) => {
        if (light) light.intensity = Math.abs(Math.sin(time + phase)) * 20;
    });

    particleSystem.rotation.y += particleRotationSpeed;
    
    // Rotate planets
    if (planet1) planet1.rotation.y += planet1.rotationSpeed;
    if (planet2) planet2.rotation.y += planet2.rotationSpeed;
    if (planet3) planet3.rotation.y += planet3.rotationSpeed;
    if (planet4) planet4.rotation.y += planet4.rotationSpeed;
    if (planet5) planet5.rotation.y += planet5.rotationSpeed;
    if (planet6) planet6.rotation.y += planet6.rotationSpeed;
    if (planet7) planet7.rotation.y += planet7.rotationSpeed;
    if (planet8) planet8.rotation.y += planet8.rotationSpeed;
    if (planet9) planet9.rotation.y += planet9.rotationSpeed;
    if (planet10) planet10.rotation.y += planet10.rotationSpeed;
    if (planet11) planet11.rotation.y += planet11.rotationSpeed;
    if (planet12) planet12.rotation.y += planet12.rotationSpeed;
    if (ringedPlanet) ringedPlanet.rotation.y += ringedPlanet.rotationSpeed;
    if (firePlanet) firePlanet.rotation.y += firePlanet.rotationSpeed;
    if (electricPlanet) electricPlanet.rotation.y += electricPlanet.rotationSpeed;

    updateShootingStars();
    animateParticleFlicker();

    renderer.render(scene, camera);
}

function startAnimation() {
    isAnimating = true;
    animate();
}

// Resize handling
const resizeHandler = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

addTrackedEventListener(window, "resize", resizeHandler);

// Page visibility handler for performance
const visibilityChangeHandler = () => {
    if (document.hidden) {
        isAnimating = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        audioElements.forEach(audio => {
            if (!audio.paused) {
                audio.pause();
            }
        });
    } else {
        if (!isAnimating) {
            startAnimation();
        }
    }
};

addTrackedEventListener(document, "visibilitychange", visibilityChangeHandler);

// Cleanup event handlers
const beforeUnloadHandler = (e) => {
    cleanupScene();
};

addTrackedEventListener(window, "beforeunload", beforeUnloadHandler);
addTrackedEventListener(window, "unload", cleanupScene);

// For SPA navigation
window.cleanupThreeJS = cleanupScene;

// Memory monitoring (optional)
if (performance.memory) {
    setInterval(() => {
        console.log(`Memory: ${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB`);
    }, 10000);
}

console.log("Three.js scene initialized with memory management");