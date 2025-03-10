import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";


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

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load GLB Model
const loader = new GLTFLoader();

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
  const modelPath1 = './models/eye/logofinal.glb';
  const modelPath2 = './models/eye/satellite.glb';
  const modelPath3 = './models/eye/space_explorer.glb';
  const modelPath4 = './models/eye/nebula2.glb';
  
  // Load models with appropriate scaling and positioning
  loadModel(modelPath1, 1, { x: 0, y: 0, z: 0 });  
  loadModel(modelPath2, 0.5, { x: -4, y: -2, z: -20 });
  loadModel(modelPath3, 1, { x: -30, y: -10, z: -50 });
  loadModel(modelPath4, 1, { x: 150, y: 150, z: -60 });
  
  // Camera positioning

  
  const zoomAndPan = () => {
    // Hide renderer initially to prevent flickering
    renderer.domElement.style.visibility = "hidden";

    // Start position (far from the scene)
    camera.position.set(-100, -100, -100); 

    const isMobile = window.innerWidth <= 500; // Detect mobile screen

    // Instantly set the initial position to prevent flickering
    gsap.set(camera.position, {
      x: -40,
      y: -20,
      z: -80
    });

    gsap.set(camera, { fov: isMobile ? 75 : 75 });
    camera.updateProjectionMatrix();

    // Delay for a brief moment, then make the scene visible
    setTimeout(() => {
        renderer.domElement.style.visibility = "visible";
    }, 10); // Small delay for smooth transition

    // Animate the camera position
    gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: isMobile ? 6 : 4,  
        duration: 5,  
        ease: "power2.inOut"
    });

    // Animate the field of view
    gsap.to(camera, {
        fov: isMobile ? 50 : 50,  
        duration: 6,  
        ease: "power2.inOut",
        onUpdate: () => {
            camera.updateProjectionMatrix();
        }
    });
   
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
  function hideButton() {
    // Select the button with the ID 'button'
    const button = document.getElementById('button1');
    const button2 = document.getElementById('button2');
    const button3 = document.getElementById('button3');
    const button4 = document.getElementById('button4');
    const button5 = document.getElementById('button5');
    // Hide the button
    button.style.display = 'none';
    button2.style.display = 'none';
    button3.style.display = 'none';
    button4.style.display = 'none';
    button5.style.display = 'none';
  
    // After 6 seconds, show the button again
    setTimeout(() => {
    button.style.display = 'block';
    button2.style.display = 'block';
    button3.style.display = 'block';
    button4.style.display = 'block';
    button5.style.display = 'block';

    }, 5000);  // 6000 milliseconds = 6 seconds
  }
  
  // Call the function to hide the button
  hideButton();
  
const gridRadius = 10;  // Radius of the sphere
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
const shootingStarCount = 100; // Number of shooting stars to spawn
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
        "./images/Metal049A.png",
        "./images/Marble006.png",
        "./images/lava.jpg"
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
const planet2 = createPlanet(9, -60, -15, planetTextures[1], 0.001, planetColors[1]);
const planet3 = createPlanet(2, 200, 30, planetTextures[2], 0.003, planetColors[2]);
const planet4 = createPlanet(4, -250, 10, planetTextures[3], 0.004, planetColors[3]);
const planet5 = createPlanet(2, 30, 5, planetTextures[4], 0.01, planetColors[4]);
const planet6 = createPlanet(3.5, -280, -25, planetTextures[5], 0.006, planetColors[5]);
const planet7 = createPlanet(1.8, 300, -5, planetTextures[6], 0.009, planetColors[6]);
const planet8 = createPlanet(2, -100, 2, planetTextures[7], 0.005, planetColors[7]);
const planet9 = createPlanet(2.5, 150, 40, planetTextures[8], 0.002, planetColors[8]);
const planet10 = createPlanet(6, -200, 50, planetTextures[9], 0.003, planetColors[9]);
const planet11 = createPlanet(4, 30, -40, planetTextures[10], 0.004, planetColors[10]);
const planet12 = createPlanet(1.2, 30, 60, planetTextures[11], 0.008, planetColors[11]);

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
        emissiveIntensity: 1.5, // Intensity of the glow effect
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
        size: .1,  // Particle size
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
const firePlanet = createFirePlanet(12, 200, 200, "./images/lava.jpg", 0.010);
const electricPlanet = createElectricPlanet(10, 500, 50, "./images/lava.jpg", 0.009);


// Resize Handling
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})


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
