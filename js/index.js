import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";


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

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);

// Orbit Controls

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
    let animationId;

    const modelPaths = [
        {
            path: './models/eye/logo3.glb',
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
            enterButton.style.display = "block"; // Show Enter button after all models load
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
                loadedModels++;
                checkLoadingComplete();
            },
            undefined,
            (error) => {
                console.error(`Error loading ${path}:`, error);
            }
        );
    }

    modelPaths.forEach(({ path, scale, position }) => loadModel(path, scale, position));

    function disposeModel(model) {
        if (model) {
            model.traverse(obj => {
                if (obj.isMesh) {
                    obj.geometry?.dispose();
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat?.dispose());
                    } else {
                        obj.material?.dispose();
                    }
                }
            });
            scene.remove(model);
        }
    }

    function switchModel(newModelPath) {
        models.forEach(disposeModel);
        models.length = 0;
        modelPaths.forEach(({ path, scale, position }) => {
            if (path === newModelPath) {
                loadModel(path, scale, position);
            }
        });
    }

    // Clean up on page exit
    window.addEventListener("beforeunload", () => {
        cancelAnimationFrame(animationId);
        models.forEach(disposeModel);
        renderer.dispose();
    });

    // 🟡 When user clicks Enter, start zoomAndPan
    enterdiv.addEventListener("click", () => {
        enterButton.style.display = "none";
        enterdiv.style.display = 'none';

        zoomAndPan();
    });


    const zoomAndPan = () => {
        // Start the fly-by animation right away when zoomAndPan starts
        flyByAnimation();
        animate();

        const container = document.getElementById("container");
        const footer = document.getElementById("footer");
        const chatBubble = document.getElementById('chat-bubble');

        container.style.opacity = "0";
        container.style.pointerEvents = "none";
        footer.style.opacity = "0";
        footer.style.pointerEvents = "none";
        chatBubble.style.opacity = "0";
        chatBubble.style.pointerEvents = "none";


        camera.position.set(-100, -100, -100);

        const isMobile = window.innerWidth <= 600;

        gsap.set(camera.position, {
            x: -40,
            y: -20,
            z: -120
        });


        gsap.set(camera, { fov: isMobile ? 75 : 75 });
        camera.updateProjectionMatrix();

        setTimeout(() => {
            welcomeSound.currentTime = 0;
            welcomeSound.play();
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
                container.style.display = "block";
                container.style.transition = "opacity 1s ease-in-out";
                container.style.pointerEvents = "block";
                footer.style.display = "block";
                footer.style.transition = "opacity 1s ease-in-out";
                footer.style.pointerEvents = "block";
                chatBubble.style.transition = "opacity 1s ease-in-out";
                chatBubble.style.pointerEvents = "block";
            }
        });

        setTimeout(() => {
            if (!isMuted) {
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
                container.style.transition = "opacity 1s ease-in-out";
                container.style.opacity = "1";
                container.style.pointerEvents = "auto";
                footer.style.transition = "opacity 1s ease-in-out";
                footer.style.opacity = "1";
                footer.style.pointerEvents = "auto";
                chatBubble.style.transition = "opacity 1s ease-in-out";
                chatBubble.style.opacity = "1";
                chatBubble.style.pointerEvents = "auto";

            }
        });
    };



};



if (window.innerWidth <= 500) {
    // Adjust model positions or scaling for small screens here
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.position.set(0, 0, 0); // Modify position for small screens if needed
        }
    });
}



const gridRadius = 12;  // Radius of the sphere
const gridDivisions = 30;  // Number of divisions (latitude and longitude lines)

// Create spherical grid lines (longitude lines)
for (let i = 0; i < gridDivisions; i++) {
    const theta = (i / gridDivisions) * Math.PI * 2; // Longitude angle (around the sphere)

    // Create line for each longitude
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let j = 0; j <= gridDivisions; j++) {
        const phi = (j / gridDivisions) * Math.PI; // Latitude angle (from top to bottom)

        const x = gridRadius * Math.sin(phi) * Math.cos(theta);
        const y = gridRadius * Math.cos(phi);
        const z = gridRadius * Math.sin(phi) * Math.sin(theta);

        positions.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ color: 0x2761c3, opacity: 3 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

// Create spherical grid lines (latitude lines)
for (let i = 0; i < gridDivisions; i++) {
    const phi = (i / gridDivisions) * Math.PI; // Latitude angle (from top to bottom)

    // Create line for each latitude
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let j = 0; j <= gridDivisions; j++) {
        const theta = (j / gridDivisions) * Math.PI * 2; // Longitude angle (around the sphere)

        const x = gridRadius * Math.sin(phi) * Math.cos(theta);
        const y = gridRadius * Math.cos(phi);
        const z = gridRadius * Math.sin(phi) * Math.sin(theta);

        positions.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ color: 0x2761c3, opacity: 1 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

// Animation Loop
let gridRotationSpeed = 0.0005; // Control rotation speed
let particleRotationSpeed = -0.001; // Control particle system's opposite rotation speed

const particleCount = 3000;
const particles = new THREE.BufferGeometry();
const positions = [];
const opacities = new Float32Array(particleCount).fill(1.0); // Stores individual opacity values
const flickerSpeeds = new Float32Array(particleCount).fill(0.04); // Controls how fast each particle flickers

for (let i = 0; i < particleCount; i++) {
    positions.push(Math.random() * 1000 - 500); // x
    positions.push(Math.random() * 1000 - 500); // y
    positions.push(Math.random() * 1000 - 500); // z
    opacities[i] = Math.random(); // Start with random opacity
    flickerSpeeds[i] = Math.random() * 1 + 4; // Random flicker speed per particle
}

// Set attributes for position and opacity
particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
particles.setAttribute('alpha', new THREE.Float32BufferAttribute(opacities, 1));

// Load circular particle texture
const particleTexture = new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/circle.png");

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

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Function to animate particle flickering smoothly
function animateParticleFlicker() {
    for (let i = 0; i < particleCount; i++) {
        opacities[i] += (Math.random() - 0.5) * flickerSpeeds[i]; // Slightly change opacity
        opacities[i] = Math.max(0.1, Math.min(1.0, opacities[i])); // Clamp between 0.1 and 1.0
    }
    particles.attributes.alpha.needsUpdate = true;
}



// Resize Handling
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// Shooting Star Particle System
const shootingStarCount = 200; // Number of shooting stars to spawn
const shootingStars = new THREE.BufferGeometry();
const shootingStarPositions = [];
const velocities = [];
const lifetimes = [];

for (let i = 0; i < shootingStarCount; i++) {
    // Random position for each shooting star
    shootingStarPositions.push(Math.random() * 2000 - 1000); // x
    shootingStarPositions.push(Math.random() * 2000 - 1000); // y
    shootingStarPositions.push(Math.random() * 2000 - 1000); // z

    // Random velocity for each shooting star
    velocities.push(Math.random() * 0.5 - 0.25); // velocity x
    velocities.push(Math.random() * 0.5 - 0.25); // velocity y
    velocities.push(Math.random() * 0.5 - 0.25); // velocity z

    // Random lifespan for each shooting star (in frames)
    lifetimes.push(Math.random() * 100 + 20); // between 20 and 120 frames
}

shootingStars.setAttribute('position', new THREE.Float32BufferAttribute(shootingStarPositions, 3));

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2, // Larger size for shooting stars
    transparent: true,
    opacity: 1,
    depthWrite: false,  // Prevents z-fighting
    blending: THREE.AdditiveBlending,
});

const shootingStarSystem = new THREE.Points(shootingStars, starMaterial);
scene.add(shootingStarSystem);

// Update the positions of shooting stars
function updateShootingStars() {
    const positions = shootingStars.attributes.position.array;
    const velocityArray = velocities;
    const lifeArray = lifetimes;

    for (let i = 0; i < shootingStarCount; i++) {
        // Move the shooting star by its velocity
        positions[i * 3] += velocityArray[i * 3];
        positions[i * 3 + 1] += velocityArray[i * 3 + 1];
        positions[i * 3 + 2] += velocityArray[i * 3 + 2];

        // Decrease lifespan of the shooting star
        lifeArray[i]--;

        // If the shooting star's lifespan ends, reset it to the starting point
        if (lifeArray[i] <= 0) {
            positions[i * 3] = Math.random() * 2000 - 1000;
            positions[i * 3 + 1] = Math.random() * 2000 - 1000;
            positions[i * 3 + 2] = Math.random() * 2000 - 1000;

            // Random velocity for the next shooting star
            velocityArray[i * 3] = Math.random() * 0.5 - 0.25;
            velocityArray[i * 3 + 1] = Math.random() * 0.2 - 0.25;
            velocityArray[i * 3 + 2] = Math.random() * 0.2 - 0.25;

            // Reset lifespan
            lifeArray[i] = Math.random() * 100 + 80; // Reset lifespan between 20 and 120 frames
        }
    }

    shootingStars.attributes.position.needsUpdate = true; // Update positions in the buffer
}



// Function to generate a random color
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
            return textures[Math.floor(Math.random() * textures.length)]; // Reuse a random texture if all are taken
        }
    };
})();

// Generate a unique random color for each planet

const createPlanet = (size, distance, positionY, textureUrl, rotationSpeed, color) => {
    const geometry = new THREE.SphereGeometry(size, 31, 32);
    const texture = new THREE.TextureLoader().load(textureUrl);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.4,
        color: new THREE.Color(color) // Convert to Three.js Color object
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(distance, positionY, -100);
    planet.rotationSpeed = rotationSpeed;
    scene.add(planet);
    return planet;
};


// Generate unique textures and colors for each planet
const planetTextures = Array.from({ length: 12 }, () => getRandomRockTexture());
const planetColors = Array.from({ length: 12 }, () => getRandomColor()); // Unique random colors

// Now create planets with unique textures and colors
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
    // Create the planet
    const planetGeometry = new THREE.SphereGeometry(size, 40, 56);
    const planetTexture = new THREE.TextureLoader().load(textureUrl);
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: planetTexture,
        roughness: 0.7,
        metalness: 0.4,
        color: new THREE.Color(color),
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    // Create the ring
    const ringGeometry = new THREE.RingGeometry(size * 1.8, size * 2.5, 64);
    const ringTexture = new THREE.TextureLoader().load(ringTextureUrl);
    const ringMaterial = new THREE.MeshStandardMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // Position the ring correctly
    ring.rotation.x = Math.PI / 2.2; // Tilt the ring
    ring.position.set(0, 0, 0); // Keep it centered on the planet

    // Create a group and add both planet and ring
    const ringedPlanet = new THREE.Group();
    ringedPlanet.add(planet);
    ringedPlanet.add(ring);

    // Position the entire group
    ringedPlanet.position.set(distance, positionY, -300);

    // Store rotation speed in the group object
    ringedPlanet.rotationSpeed = rotationSpeed;

    scene.add(ringedPlanet);
    return ringedPlanet;
};

// Create a ringed planet
const ringedPlanet = createRingedPlanet(
    12,             // Planet size
    350,           // Distance from the center
    10,     // Vertical position
    'https://d3n24sjr83qswf.cloudfront.net/Images/Ice.jpg',  // Planet texture
    'https://d3n24sjr83qswf.cloudfront.net/Images/Foil002.png',  // Transparent ring texture
    0.005,         // Rotation speed
    "#89CFF0"      // Planet color (Orange)
);
// Function to create the Fire Planet
const createFirePlanet = (size, distance, positionY, textureUrl, rotationSpeed) => {
    const geometry = new THREE.SphereGeometry(size, 31, 32);
    const texture = new THREE.TextureLoader().load(textureUrl);  // Fire texture

    // Use MeshStandardMaterial for emissive properties
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(1, 0, 0), // Fire-like red color
        emissiveIntensity: 1.5, // Intensity of the glow effect
        roughness: 0.7,
        metalness: 0.4
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(distance, positionY, -100);
    planet.rotationSpeed = rotationSpeed;
    scene.add(planet);

    return planet;
};


// Function to create the Electric Planet
const createElectricPlanet = (size, distance, positionY, textureUrl, rotationSpeed) => {
    const geometry = new THREE.SphereGeometry(size, 31, 32);
    const texture = new THREE.TextureLoader().load(textureUrl);  // Electric texture

    // Use MeshStandardMaterial for emissive properties
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(0, 0, 1), // Electric blue color
        emissiveIntensity: 2.5, // Intensity of the glow effect
        roughness: 0.5,
        metalness: 0.6
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(distance, positionY, -100);
    planet.rotationSpeed = rotationSpeed;
    scene.add(planet);
    return planet;
};



console.log("Generated Colors:", planetColors);
planetColors.forEach((color, index) => {
    if (!color) {
        console.error(`❌ Planet ${index + 1} is missing a color!`);
    }
});

const firePlanet = createFirePlanet(25, 500, 100, "./images/lava.jpg", 0.005);
const electricPlanet = createElectricPlanet(6, 400, 20, "./images/lava.jpg", 0.008);


// Resize Handling
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

window.openModal = function (modalId) {
    document.getElementById(modalId).style.display = "block";
};
window.closeModal = function (modalId) {
    document.getElementById(modalId).style.display = "none";
};

function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

// Function to close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}
document.addEventListener("DOMContentLoaded", function () {
    const socialLink = document.getElementById("socialLink");
    const wheel = document.getElementById("socialWheel");

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
        wheel.style.display = "flex"; // Ensure it's visible before animation
        wheel.classList.remove("closing"); // Remove closing animation if present
        requestAnimationFrame(() => {
            wheel.classList.add("active");
        });
    }

    function closeSocialWheel() {
        if (wheel.classList.contains("active")) {
            wheel.classList.add("closing"); // Add closing animation
            setTimeout(() => {
                wheel.classList.remove("active", "closing");
                wheel.style.display = "none"; // Hide after animation ends
            }, 300);
        }
    }

    // Toggle on click
    socialLink.addEventListener("click", toggleSocialWheel);

    // Close when clicking outside (Desktop & Mobile)
    document.addEventListener("click", function (event) {
        if (!wheel.contains(event.target) && event.target !== socialLink) {
            closeSocialWheel();
        }
    });

    // Close when touching outside (Mobile)
    document.addEventListener("touchstart", function (event) {
        if (!wheel.contains(event.target) && event.target !== socialLink) {
            closeSocialWheel();
        }
    });
});


function updateVersion() {
    let startDate = new Date("2025-03-15T00:00:00"); // Set the initial start date
    let now = new Date();

    // Calculate the number of days elapsed since startDate
    let diffInMs = now - startDate;
    let daysElapsed = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Convert ms to days

    let major = 1;  // First number (1-10)
    let minor = 0;  // Middle number (0-50)
    let patch = daysElapsed; // Last number (increments daily)

    // Handle rollovers
    if (patch >= 100) {
        minor += Math.floor(patch / 100); // Increment minor when patch reaches 100
        patch = patch % 100; // Reset patch to 0 after 100
    }
    if (minor >= 50) {
        major += Math.floor(minor / 50); // Increment major when minor reaches 50
        minor = minor % 50; // Reset minor to 0 after 50
    }
    if (major > 10) {
        major = 10; // Cap major version at 10
        minor = 50; // Stop minor at 50 when major is 10
        patch = 100; // Stop patch at 100 when both limits are hit
    }

    let version = `[Version ${major}.${minor}.${patch}]`;
    document.getElementById('version').textContent = version;
}

updateVersion(); // Initial call
setInterval(updateVersion, 86400000);


function createBlinkingLight(position, color = 0xff0000, intensity = 40, size = 0.1) {
    const light = new THREE.PointLight(color, intensity, 40); // Small range light
    const sphereGeometry = new THREE.SphereGeometry(size, .5, .5);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const lightGroup = new THREE.Group();
    lightGroup.add(light);
    lightGroup.add(sphere);

    // Set the exact position
    lightGroup.position.set(position.x, position.y, position.z);

    scene.add(lightGroup);

    return light;
}

const light1 = createBlinkingLight({ x: -30, y: -9.5, z: -50 });
const light2 = createBlinkingLight({ x: 90, y: 45, z: 160 });
const whiteLight = createBlinkingLight({ x: -4, y: -2, z: -20 }, 0xffffff);


const ufoGeometry = new THREE.CylinderGeometry(2, 8, 2, 64); // Wider, flatter
const ufoMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    metalness: 1,  // More metallic shine
    roughness: 0.2
});
const ufo = new THREE.Mesh(ufoGeometry, ufoMaterial);
scene.add(ufo);

// UFO Dome (Glass-Like)
const domeGeometry = new THREE.SphereGeometry(2, 32, 32);
const domeMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    transparent: true,
    opacity: 5,
    roughness: 0.1, // More reflective
    metalness: 0.8
});
const dome = new THREE.Mesh(domeGeometry, domeMaterial);
dome.position.y = 1; // Raise slightly above the disc
scene.add(dome);

// Attach the dome to the UFO body
const ufoGroup = new THREE.Group();
ufoGroup.add(ufo);
ufoGroup.add(dome);
scene.add(ufoGroup);

ufoGroup.position.set(-100, 5, 10); // Start far left


// Blinking Lights Under the UFO
const blinkingLights = [];
const lightPositions = [
    { x: 2, y: -1, z: 4 },
    { x: -4, y: -1, z: 4 },
    { x: 4, y: -1, z: -4 },
    { x: -4, y: -1, z: -4 },
];

lightPositions.forEach((pos, index) => {
    const light = new THREE.PointLight(0xff0000, 4, 3); // Red lights
    light.position.set(pos.x, pos.y, pos.z);
    scene.add(light);
    blinkingLights.push({ light, phase: index * Math.PI * 4 }); // Different phases for staggered blinking
});

function flyByAnimation() {
    // Create the UFO sound effect
    const ufoSound = new Audio('./audio/ufo.wav');
    ufoSound.volume = 0.09; // Adjust volume as needed

    // Delay the sound by 0.5 seconds
    setTimeout(() => {
        ufoSound.play();
    }, 500); // 500ms = 0.5 second

    gsap.to(ufoGroup.position, {
        x: 120, // Move across the screen
        y: 20,  // Slight height change
        z: 7,  // Move forward slightly
        duration: 4.5, // Duration of fly-by
        ease: "power1.inOut",
        onComplete: () => {
            scene.remove(ufoGroup); // Remove UFO from the scene after animation
        }
    });

    gsap.to(ufoGroup.rotation, {
        z: -5, // Slight tilt for realism
        duration: 5,
        repeat: -1, // Keep rotating during flight
        yoyo: false,
        ease: "power1.inOut"
    });
}






// Function to check if the device is mobile
const isMobile = () => window.innerWidth <= 600;



// Create audio elements
const hoverSound = new Audio('./audio/Hover.mp3');
const clickSound = new Audio('./audio/Click.mp3');
const acpTheme = new Audio('./audio/ACP theme.wav');
const welcomeSound = new Audio('./audio/Welcome .wav');

// Set initial volume levels based on screen size (mobile or desktop)
function setVolume() {
    const mobile = isMobile();
    hoverSound.volume = 0.07;
    clickSound.volume = 0.1;
    welcomeSound.volume = mobile ? 0.02 : 0.05;
    acpTheme.volume = mobile ? 0.005 : 0.04;
}

setVolume();

// Recalculate volume on window resize
window.addEventListener('resize', setVolume);

// Tracks whether sound is muted
let isMuted = false;

// Timeout for hover delay
let hoverTimeout;

// Flag to prevent hover sound on click
let isClicking = false;

// Select all menu items
const menuItems = document.querySelectorAll('.sound');

// Select the mute toggle switch
const muteToggle = document.getElementById('switch');

// Add event listener to mute toggle switch
muteToggle.addEventListener('change', () => {
    isMuted = !isMuted; // Toggle mute state

    if (isMuted) {
        acpTheme.pause();
    } else {
        acpTheme.currentTime = 0;
        acpTheme.play();
    }
});

// Add event listeners to each menu item
menuItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        // On desktop, apply hover delay; on mobile, this will be skipped
        if (!isMuted && !isClicking && window.innerWidth > 600) {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                hoverSound.currentTime = 0;
                hoverSound.play();
            }, 50);
        }
    });

    item.addEventListener('click', () => {
        if (!isMuted) {
            isClicking = true;
            clickSound.currentTime = 0;
            clickSound.play();

            // For mobile, disable hover sound after click to avoid conflicting sounds
            clearTimeout(hoverTimeout);

            setTimeout(() => {
                isClicking = false;
            }, 50);
        }
    });
});

const bubble = document.getElementById('chat-bubble');
const chatWindow = document.getElementById('chat-window');
const chatCover = document.getElementById('chatCover');

let iframeLoaded = false;

bubble.addEventListener('click', () => {
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




function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (electricPlanet.updateElectricityParticles) {
        electricPlanet.updateElectricityParticles();
    }

    // Update the fire particles (if the planet has fire particles)
    if (firePlanet) {
    }

    // Rotate the entire scene to create the spherical motion effect
    scene.rotation.y += gridRotationSpeed;
    const time = performance.now() * 0.007;

    light1.intensity = Math.abs(Math.sin(time)) * 4;
    light2.intensity = Math.abs(Math.sin(time + 1)) * 4;
    whiteLight.intensity = Math.abs(Math.sin(time * .1)) * 1;

    ufoGroup.rotation.y += 0.01;

    // Blinking light effect
    blinkingLights.forEach(({ light, phase }) => {
        light.intensity = Math.abs(Math.sin(time + phase)) * 20;
    });


    // Rotate the particle system in the opposite direction
    particleSystem.rotation.y += particleRotationSpeed;
    planet1.rotation.y += planet1.rotationSpeed;
    planet2.rotation.y += planet2.rotationSpeed;
    planet3.rotation.y += planet3.rotationSpeed;
    planet4.rotation.y += planet4.rotationSpeed;
    planet5.rotation.y += planet5.rotationSpeed;
    planet6.rotation.y += planet6.rotationSpeed;
    planet7.rotation.y += planet7.rotationSpeed;
    planet8.rotation.y += planet8.rotationSpeed;
    planet9.rotation.y += planet9.rotationSpeed;
    planet10.rotation.y += planet10.rotationSpeed;
    planet11.rotation.y += planet11.rotationSpeed;
    planet12.rotation.y += planet12.rotationSpeed;
    ringedPlanet.rotation.y += ringedPlanet.rotationSpeed;
    firePlanet.rotation.y += firePlanet.rotationSpeed;
    electricPlanet.rotation.y += electricPlanet.rotationSpeed;
    // Update shooting stars
    updateShootingStars();

    animateParticleFlicker();

    renderer.render(scene, camera);
}


