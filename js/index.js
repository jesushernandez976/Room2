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

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load GLB Model
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
loader.setDRACOLoader(dracoLoader);


// Set up a function to handle loading models with reusable logic
function loadModel(path, scale = 1, position = { x: 0, y: 0, z: 0 }) {
    loader.load(
      path,  // Path to the GLB file
      (gltf) => {  // onLoad callback
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.set(position.x, position.y, position.z);
        scene.add(model);
      },
      (xhr) => {  // onProgress callback
        console.log(`Loading progress: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {  // onError callback
        console.error('An error occurred while loading the model:', error);
      }
    );
  }
  

  
  // Load all models
  const modelPath1 = './models/eye/logo3.glb';
  const modelPath2 = './models/eye/sat1.glb';
  const modelPath3 = './models/eye/shuttle2.glb';
  const modelPath4 = './models/eye/nebula2.glb';
  const modelPath5 = './models/eye/craftplanet1.glb';
  
  // Load models with appropriate scaling and positioning
  loadModel(modelPath1, 15, { x: 0, y: 0, z: 0 });  
  loadModel(modelPath2, 0.5, { x: -4, y: -2, z: -20 });
  loadModel(modelPath3, .24, { x: -30, y: -10, z: -50 });
  loadModel(modelPath4, 1, { x: 150, y: 150, z: -60 });
  loadModel(modelPath5, 0.3, { x: 90, y: 40, z: 160 });
  
  // Camera positioning

  
  const zoomAndPan = () => {
    // Get the container element
    const container = document.getElementById("container");

    // Hide the container initially
    container.style.opacity = "0";
    container.style.pointerEvents = "none"; // Disable all clicks


    // Start position (far from the scene)
    camera.position.set(-100, -100, -100);

    const isMobile = window.innerWidth <= 500; // Detect mobile screen

    // Instantly set the initial position to prevent flickering
    gsap.set(camera.position, {
        x: -40,
        y: -20,
        z: -90
    });

    gsap.set(camera, { fov: isMobile ? 75 : 75 });
    camera.updateProjectionMatrix();

    // Animate the camera position
    gsap.to(camera.position, {
        x: 3,
        y: 0,
        z: isMobile ? 6 : 3,
        duration: 6,
        ease: "power2.inOut"
    });

    // Animate the field of view
    gsap.to(camera, {
        fov: isMobile ? 50 : 50,
        duration: 7,
        ease: "power2.inOut",
        onUpdate: () => {
            camera.updateProjectionMatrix();
        },
        onComplete: () => {
            // Fade in the container when animation completes
            container.style.transition = "opacity 1s ease-in-out";
            container.style.opacity = "1";
            container.style.pointerEvents = "auto";
        }
    });
};

// Call the zoom and pan function on page load
window.onload = () => {
    camera.position.set(-100, -100, -100);
    zoomAndPan();
};

// Call the zoom and pan function on page load
window.onload = () => {
    camera.position.set(-100, -100, -100);
    zoomAndPan();
};

  // Optionally, update based on screen width (if needed)
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

// Particle System for Blue Background (inside the sphere)
const particleCount = 10000;
const particles = new THREE.BufferGeometry();
const positions = [];

for (let i = 0; i < particleCount; i++) {
    positions.push(Math.random() * 1000 - 500); // x
    positions.push(Math.random() * 1000 - 500); // y
    positions.push(Math.random() * 1000 - 500); // z
}

particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

// Create circular particles using a texture
const particleTexture = new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/circle.png");

const particleMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,  
    size: 1.7,  // Adjust particle size
    map: particleTexture,  // Use a circular texture
    transparent: true,
    opacity: 0.8,
    depthWrite: false,  // Prevents z-fighting
    sizeAttenuation: true,  // Makes particles scale with distance
    blending: THREE.AdditiveBlending,  // Glow effect
    alphaTest: 0.5  // Removes transparent edges
});

const particleSystem = new THREE.Points(particles, particleMaterial);
// Place the particles inside the sphere by scaling down the particle count
scene.add(particleSystem);

// Resize Handling
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
let gridRotationSpeed = 0.0005; // Control rotation speed
let particleRotationSpeed = -0.001; // Control particle system's opposite rotation speed

// Shooting Star Particle System
const shootingStarCount = 250; // Number of shooting stars to spawn
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
        "./images/Rocks011.jpg",  
        "./images/Ground068.jpg",
        "./images/Moss002.jpg",
        "./images/Ground081.jpg",
        "./images/lava.jpg",
        "./images/Marble.jpg",
        "./images/Metal05.jpg",
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
// Generate unique textures and colors for each planet
const planetTextures = Array.from({ length: 12 }, () => getRandomRockTexture());
const planetColors = Array.from({ length: 12 }, () => getRandomColor()); // Unique random colors

// Now create planets with unique textures and colors
const planet1 = createPlanet(4, 140, 40, planetTextures[0], 0.002, planetColors[0]);
const planet2 = createPlanet(12, -60, -15, planetTextures[1], 0.001, planetColors[1]);
const planet3 = createPlanet(2, 200, 30, planetTextures[2], 0.003, planetColors[2]);
const planet4 = createPlanet(4, -250, 10, planetTextures[3], 0.004, planetColors[3]);
const planet5 = createPlanet(2, 30, 5, planetTextures[4], 0.01, planetColors[4]);
const planet6 = createPlanet(3.5, -280, -25, planetTextures[5], 0.006, planetColors[5]);
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
    "./images/Ice.jpg",  // Planet texture
    "./images/Foil002.png",  // Transparent ring texture
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

    // Add fire particles around the planet
    addFireParticles(planet);

    return planet;
};

// Function to add fire particles around the planet
const addFireParticles = (planet) => {
    const particleCount = 300; // Number of fire particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(1, 0.5, 0), // Fire-like orange color
        size: 5,  // Particle size
        transparent: true,
        blending: THREE.AdditiveBlending,
    });

    const positions = [];
    for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 2 + 3; // Random distance from the planet
        const theta = Math.random() * Math.PI * 2; // Random angle
        const phi = Math.random() * Math.PI * 2; // Random angle

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        positions.push(x, y, z);
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    planet.add(particles); // Attach the particles to the planet
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

    // Add electricity particles around the planet
    addElectricityParticles(planet);

    return planet;
};

// Function to add electricity particles (like sparks or arcs) around the planet
const addElectricityParticles = (planet) => {
    const particleCount = 100; // Number of electricity particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(0, 0, 1), // Electric blue color
        size: .3,  // Particle size
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.2
    });

    const positions = [];
    const velocities = []; // Store the movement direction for each particle
    for (let i = 0; i < particleCount; i++) {
        // Position particles around the planet in a spherical pattern
        const radius = Math.random() * 2 + 3; // Random distance from the planet
        const theta = Math.random() * Math.PI * 2; // Random angle
        const phi = Math.random() * Math.PI * 2; // Random angle

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        positions.push(x, y, z);

        // Assign random velocity to simulate lightning movement
        velocities.push(Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05);
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    planet.add(particles); // Attach the particles to the planet

    // Update particle movement over time (simulate electric arcs)
    function updateElectricityParticles() {
        const positions = particlesGeometry.attributes.position.array;
        const velocities = particlesGeometry.attributes.velocity.array;

        for (let i = 0; i < positions.length; i += 3) {
            // Apply random movement to each particle
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            // Add some randomness to the velocities to simulate electric arcs
            if (Math.random() < 0.01) {
                velocities[i] += Math.random() * 0.05 - 0.025;
                velocities[i + 1] += Math.random() * 0.05 - 0.025;
                velocities[i + 2] += Math.random() * 0.05 - 0.025;
            }
        }

        particlesGeometry.attributes.position.needsUpdate = true;
    }

    // Return the update function so it can be called in the animation loop
    planet.updateElectricityParticles = updateElectricityParticles;
};

console.log("Generated Colors:", planetColors);
planetColors.forEach((color, index) => {
    if (!color) {
        console.error(`❌ Planet ${index + 1} is missing a color!`);
    }
});

// You can add more planets by repeating the createPlanet function with different parameters
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
    const sphereMaterial = new THREE.MeshBasicMaterial({ color, emissive: color });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const lightGroup = new THREE.Group();
    lightGroup.add(light);
    lightGroup.add(sphere);

    // Set the exact position
    lightGroup.position.set(position.x, position.y, position.z);

    scene.add(lightGroup);

    return light;
}

// Create two blinking lights at specified locations
const light1 = createBlinkingLight({ x: -30, y: -9.5, z: -50 });
const light2 = createBlinkingLight({ x: 90, y: 45, z: 160 });
const whiteLight = createBlinkingLight({ x: -4, y: -2, z: -20}, 0xffffff); // White


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
    gsap.to(ufoGroup.position, {
        x:120, // Move across the screen
        y: 20,  // Slight height change
        z: 7,  // Move forward slightly
        duration: 4, // Duration of fly-by
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

flyByAnimation();


function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (electricPlanet.updateElectricityParticles) {
        electricPlanet.updateElectricityParticles();
    }

    // Update the fire particles (if the planet has fire particles)
    if (firePlanet) {
        // You can add a function to animate the fire particles too (if needed)
    }

    // Rotate the entire scene to create the spherical motion effect
    scene.rotation.y += gridRotationSpeed;
    const time = performance.now() * 0.007;

    light1.intensity = Math.abs(Math.sin(time)) * 4; // Blink effect
    light2.intensity = Math.abs(Math.sin(time + 1)) * 4; 
    whiteLight.intensity = Math.abs(Math.sin(time * .1)) * 1; // White blink, slightly faster

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

    // Update nebula

    renderer.render(scene, camera);
}

animate();
