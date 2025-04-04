import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
scene.add(directionalLight);

const pinkLight = new THREE.PointLight(0xff00ff, 20, 20); // Pink light
pinkLight.position.set(-3, 2, -3); // Move to the left and backward
scene.add(pinkLight);

const blueLight = new THREE.PointLight(0x0099ff, 35, 10); // Blue light
blueLight.position.set(3, 2, 3); // Move to the right and forward
scene.add(blueLight);


function updateLight() {
    directionalLight.position.copy(camera.position);
    directionalLight.target.position.set(
        camera.position.x,
        camera.position.y - 0.5,
        camera.position.z - 1
    );
    directionalLight.target.updateMatrixWorld();
}

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let spaceRoom;
let models = [];  // Store hoodie models
let loadedModels = 0;  // Track models loaded globally
const modelPaths = [
    './models/eye/3DHoodieblack2.glb',
    './models/eye/3DHoodieblue.glb',
    './models/eye/3DHoodieWhite.glb'
];

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
loader.setDRACOLoader(dracoLoader);

function loadModelWithRetry(path, retries = 3) {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const attemptLoad = () => {
            loader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;
                    resolve(model);
                },
                (xhr) => { // Progress event
                    // Keep this part only to track loading, but do not update numbers or rotate
                    const loadingBar = document.querySelector(".loading-bar");
                    if (loadingBar) {
                        loadingBar.textContent = "Loading";  // Static text for loading
                    }
                },
                (error) => {
                    attempts++;
                    console.error(`Error loading ${path}:`, error);

                    if (attempts < retries) {
                        console.log(`Retrying... Attempt ${attempts} of ${retries}`);
                        attemptLoad(); // Retry loading the model
                    } else {
                        reject(`Failed to load ${path} after ${retries} attempts`);
                    }
                }
            );
        };

        attemptLoad();
    });
}

function disposeModel(model) {
    if (!model) {
        console.error('Model is undefined or null');
        return;  // Exit if model is not valid
    }

    // Safely traverse and dispose of the model's geometry and material
    model.traverse(obj => {
        if (obj.isMesh) {
            obj.geometry.dispose();
            if (obj.material.isMaterial) {
                obj.material.dispose();
            }
        }
    });
    
    scene.remove(model);  // Remove the model from the scene
}

function swapModel(newModel) {
    // Dispose of the old model before adding a new one
    if (models.length > 0) {
        const oldModel = models[0];  // Get the old model to dispose of it
        disposeModel(oldModel);
        
        models = [];  // Reset the models array
    }

    // Add the new model
    models.push(newModel);
    scene.add(newModel);
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!scene || !renderer) {
        console.error("Scene or renderer is not initialized!");
        return;
    }

    const loadingContainer = document.querySelector(".loading-container");
    const loadingBar = document.querySelector(".loading-bar");

    if (!loadingBar) {
        console.error("loading-bar element not found in the HTML!");
        return; // Stop further execution if loadingBar is not found
    }

    const totalModels = modelPaths.length + 1; // Hoodie models + pink room

    function checkLoadingComplete() {
        console.log(`Loaded models: ${loadedModels}/${totalModels}`);
        if (loadedModels >= totalModels) {
            loadingContainer.style.display = "none"; // Hide loader when all models are ready
        }
    }

    try {
        // Load pink space room first
        spaceRoom = await loadModelWithRetry('./models/eye/pinkspaceroom.glb');
        spaceRoom.scale.set(1, 1.4, 1);
        scene.add(spaceRoom);
        loadedModels++;
        checkLoadingComplete();

        // Load hoodie models in sequence
        for (let path of modelPaths) {
            try {
                let model = await loadModelWithRetry(path);
                model.visible = false; // Hide until needed
                models.push(model);
                scene.add(model);
                loadedModels++;
                checkLoadingComplete();
            } catch (modelError) {
                console.warn(`Skipping failed model: ${path}`);
                loadedModels++; // Still increase count to prevent freeze
                checkLoadingComplete();
            }
        }
    
    } catch (error) {
        console.error("Failed to load some models:", error);
    }
});

// Cleanup Scene on Page Switch
window.addEventListener("beforeunload", () => {
    if (loadedModels < totalModels) {
        // Prevent page navigation if models are still loading
        event.preventDefault();
        event.returnValue = "Models are still loading!";
    }

    // Cleanup the scene and models to avoid memory leaks
    scene.children.forEach(child => scene.remove(child));  // Remove all objects
    models.forEach(model => {
        model.traverse(obj => {
            if (obj.isMesh) {
                obj.geometry.dispose();
                if (obj.material.isMaterial) {
                    obj.material.dispose();
                }
            }
        });
    });
    renderer.dispose();
});

// Function to load a GLB model
function loadGLBModel(path, index) {
    loader.load(
        path,
        function (gltf) {
            console.log('Model loaded successfully:', path);
            const model = gltf.scene;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            const size = box.getSize(new THREE.Vector3()).length();
            const scaleFactor = 11 / size;
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Check screen width to scale models differently for mobile
            if (window.innerWidth <= 600) {
                model.scale.set(scaleFactor * 0.8, scaleFactor * 0.8, scaleFactor * 0.8); // Smaller scale for mobile
            }

            // Ensure it's still centered
            const newBox = new THREE.Box3().setFromObject(model);
            const newCenter = newBox.getCenter(new THREE.Vector3());
            model.position.sub(newCenter);

            model.visible = false; // Hide all models initially
            models.push(model);
            scene.add(model);

            if (models.length === modelPaths.length) {
                models[0].visible = true; // Show first model initially
                document.querySelector('.counter').innerHTML = `1 / ${modelPaths.length}`;
                updateButtons();
            }
        },
        undefined,
        function (error) {
            console.error('Error loading GLB model:', error);
        }
    );
}

// Load all models
modelPaths.forEach((path, index) => loadGLBModel(path, index));

// Adjust camera position
camera.position.set(6, 2, 6);


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


// Render loop
const animate = function () {
    requestAnimationFrame(animate);

    updateLight(); // Update light position each frame

    models.forEach((model, i) => {
        if (model.visible) {
            model.rotation.y += 0.005; // Rotate only the visible model
        }
    });

    if (spaceRoom) {
        spaceRoom.rotation.y -= 0.0005;
    } else {
    }

    controls.update();
    renderer.render(scene, camera);
};

// Pagination buttons
const pr = document.querySelector('.paginate.left');
const pl = document.querySelector('.paginate.right');
pr.onclick = () => {
    if (index > 0) slide(-1);
};

pl.onclick = () => {
    if (index < total - 1) slide(1);
};
let index = 0;
const total = modelPaths.length;

function slide(offset) {
    const newIndex = index + offset;

    if (newIndex < 0 || newIndex >= total) {
        return;
    }

    index = newIndex;

    models.forEach((model, i) => {
        model.visible = i === index;
    });

    document.querySelector('.counter').innerHTML = `${index + 1} / ${total}`;
    updateButtons();
}

function updateButtons() {
    pr.setAttribute('data-state', index === 0 ? 'disabled' : '');
    pl.setAttribute('data-state', index === total - 1 ? 'disabled' : '');
}

// Ensure the first button states are correct on load
updateButtons();
animate();

// Handle window resizing (but without changing model scaling)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
