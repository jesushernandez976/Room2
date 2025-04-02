// Import necessary modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
scene.add(directionalLight);

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

// Load SpaceRoom (Background)
let spaceRoom;
const loader = new GLTFLoader();
loader.load(
    './models/eye/spaceroom2.glb',
    function (gltf) {
        spaceRoom = gltf.scene;
        spaceRoom.scale.set(3, 3.4, 3);
        spaceRoom.position.set(0, 0, 0);
        scene.add(spaceRoom);
        console.log("SpaceRoom loaded successfully.");
    },
    undefined,
    function (error) {
        console.error("Error loading spaceroom2.glb:", error);
    }
);

// Load hoodie models
let models = [];
const modelPaths = [
    './models/eye/3DHoodieblack2.glb',
    './models/eye/3DHoodieblue.glb',
    './models/eye/3DHoodieWhite.glb'
];

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
        spaceRoom.rotation.y -= 0.0003; // Rotate slower than the hoodie models for a subtle effect
    }

    controls.update();
    renderer.render(scene, camera);
};

// Pagination buttons
const pr = document.querySelector('.paginate.left');
const pl = document.querySelector('.paginate.right');

pr.onclick = () => slide(-1);
pl.onclick = () => slide(1);

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
