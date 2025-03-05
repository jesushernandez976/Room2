import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { gsap } from "https://cdn.skypack.dev/gsap@3.9.1";


// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
document.getElementById("container3D").appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enableRotate = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 2.2;
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 1.7;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, .8));
const pointLight1 = new THREE.PointLight(0xffffff, 2.5, 10);
pointLight1.position.set(0, 2, 0);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1, 10);
pointLight2.position.set(5, 3, -5);
scene.add(pointLight2);

// Initial Camera Position
camera.position.set(9, 2.3, .5);
camera.lookAt(2.5, 2.3, 0);
controls.target.set(5.5, 2.3, 0);
controls.update();

// Load 3D Models
const loadingScreen = document.getElementById('loadingScreen');
const loadingText = document.getElementById('loadingText');

let loadedItems = 0;
const totalItems = 1;

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
loader.setDRACOLoader(dracoLoader);

// Handle WebGL context loss gracefully
renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    console.error("❌ WebGL Context Lost! Freeing memory and reloading model...");

    // Dispose of existing models before reloading
    if (currentModel) {
        disposeModel(currentModel);
    }

    // Reload the model without refreshing the page
    loadModel();
});
const analysisPhrases = [
    "Initializing System",
    "Optimizing System Performance",
    "Scanning Environment",
    "Executing Neural Mapping",
    "Integrating Data Nodes",
    "Running Predictive Analysis",
    "Compiling Insights FPS speeds",
    "Generating Visualizations",
    "Processing Data Streams",
    "Finalizing Operations",
    "Loading Shader Modules",
    "Rendering 3D Models",
    "Compiling Shaders",
    "Loading Textures"
];
// Keep track of the current model
let currentModel = null;
let index = 0;
let targetPercentage = 100; // Ensure it reaches 100%
let currentPercentage = 0;

function updateLoadingProgress() {
    let interval = setInterval(() => {
        if (currentPercentage < targetPercentage) {
            currentPercentage++;
            loadingText.textContent = `${analysisPhrases[index]} ${currentPercentage}%`;
        } else {
            clearInterval(interval);
            loadingText.textContent = "Loading 100%"; // Final loading message

            setTimeout(() => {
                loadingText.textContent = "Welcome"; // Display "Welcome" after loading
                setTimeout(() => {
                    loadingScreen.style.opacity = "0"; 
                    setTimeout(() => loadingScreen.style.display = "none", 100);
                    initScene(); // Transition to the scene
                }, 900); // Delay before hiding loading screen
            }, 600); // Display "Welcome" for 500ms
        }
    }, 9); // Adjust speed of counting

    // Change analysis phrases every 1.5 seconds
    setInterval(() => {
        if (currentPercentage < 100) { // Only change messages while loading
            index = (index + 1) % analysisPhrases.length;
        }
    }, 120);
}

        




// Function to load the model
function loadModel() {
    loader.load("./models/eye/r21.glb", function (gltf) {
        if (currentModel) {
            disposeModel(currentModel);
        }

        scene.add(gltf.scene);
        currentModel = gltf.scene;
        loadedItems++;
        updateLoadingProgress(); // ✅ Track loading progress

        const whiteboard = currentModel.getObjectByName("whiteboard");
        if (whiteboard) {
            console.log("✅ Whiteboard found:", whiteboard);
            setupWhiteboard(whiteboard);
        } else {
            console.error("❌ Whiteboard not found in the scene!");
        }
    });
}


// Function to properly dispose of models
function disposeModel(model) {
    model.traverse((child) => {
        if (child.isMesh) {
            child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });
    scene.remove(model);
}

// Load the model initially
loadModel();

// Clickable Markers
function createMarker(position, size, name, rotation = [0, 0, 0], shape = "box") {
    let geometry;

    if (shape === "circle") {
        geometry = new THREE.CircleGeometry(size[0] / 2, 32); // Radius = half of the width
    } else {
        geometry = new THREE.BoxGeometry(...size);
    }

    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.set(...position);
    marker.rotation.set(...rotation);
    marker.name = name;
    scene.add(marker);
    return marker;
}


const marker1 = createMarker([-0.15, 2.2, 2.3], [2.25, 2, 1], "Marker1");
const marker2 = createMarker([3.43, 1.94, -2.98], [0.5, 1.01, 1.64], "Marker2", [0, Math.PI / 4.3, 0]);
const marker3 = createMarker([5.9, 1.29, 2], [2, 2, .03], "Marker3", [Math.PI / 2, Math.PI /1, 0]);
const marker3a = createMarker([5.9, 1.29, 1.9], [2.5, 2.5,2.5], "Marker3a", [Math.PI / 2, Math.PI /1, 0, 0], "circle")
marker3a.visible = false;
const marker4 = createMarker([.10, 1.2, -1.7], [.8, 2, 1.2], "Marker4", [Math.PI / 2, Math.PI / 2, 0]);
const marker5 = createMarker([5.3, 3.2, -3.2], [.7, .7, .7], "Marker5", [0, 0, 0]);
const marker6 = createMarker([-3.2, 2.1, .4], [.4, 1, 2], "Marker6", [0, 0, 0]);



// Reset View Button
const resetButton = document.createElement("button");
resetButton.innerText = "Reset View";
resetButton.style.position = "absolute";
resetButton.style.top = "10px";
resetButton.style.left = "10px";
resetButton.style.padding = "10px 15px";
resetButton.style.fontSize = "14px";
resetButton.style.background = "#4476b0";
resetButton.style.color = "#fff";
resetButton.style.border = "none";
resetButton.style.borderRadius = "5px";
resetButton.style.cursor = "pointer";
resetButton.style.zIndex = "1000";
resetButton.style.display = "none";
document.body.appendChild(resetButton);

// Create a floating text div
const hoverText = document.createElement("div");
hoverText.innerText = "Apps";
hoverText.style.position = "absolute";
hoverText.style.color = "white";
hoverText.style.padding = "5px 10px";
hoverText.style.borderRadius = "5px";
hoverText.style.fontSize = "16px";
hoverText.style.fontFamily = "Arial, sans-serif";
hoverText.style.display = "none"; // Hide initially
document.body.appendChild(hoverText);

const hoverTextMarker1 = document.createElement("div");
hoverTextMarker1.innerText = "Menu";
hoverTextMarker1.style.position = "absolute";
hoverTextMarker1.style.color = "white";
hoverTextMarker1.style.padding = "5px 10px";
hoverTextMarker1.style.borderRadius = "5px";
hoverTextMarker1.style.fontSize = "16px";
hoverTextMarker1.style.fontFamily = "Arial, sans-serif";
hoverTextMarker1.style.display = "none"; // Hide initially
document.body.appendChild(hoverTextMarker1);


const hoverTextMarker2 = document.createElement("div");
hoverTextMarker2.innerText = "Explore";
hoverTextMarker2.style.position = "absolute";
hoverTextMarker2.style.color = "white";
hoverTextMarker2.style.padding = "5px 10px";
hoverTextMarker2.style.borderRadius = "5px";
hoverTextMarker2.style.fontSize = "16px";
hoverTextMarker2.style.fontFamily = "Arial, sans-serif";
hoverTextMarker2.style.overflow = "hidden";
hoverTextMarker2.style.display = "none"; // Hide initially
document.body.appendChild(hoverTextMarker2);

// Create a floating text div for Marker 4
const hoverTextMarker4 = document.createElement("div");
hoverTextMarker4.innerText = "Shop";
hoverTextMarker4.style.position = "absolute";
hoverTextMarker4.style.color = "white";
hoverTextMarker4.style.padding = "5px 10px";
hoverTextMarker4.style.borderRadius = "5px";
hoverTextMarker4.style.fontSize = "16px";
hoverTextMarker4.style.fontFamily = "Arial, sans-serif";
hoverTextMarker4.style.display = "none"; // Hide initially
document.body.appendChild(hoverTextMarker4);




// Function to handle mouse movement (for hover effect)
function onPointerMove2(event) {
    // Normalize mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(marker3a, true);

    if (intersects.length > 0) {
        hoverText.style.display = "block";
        hoverText.style.left = `${event.clientX + 10}px`;
        hoverText.style.top = `${event.clientY + 10}px`;
    } else {
        hoverText.style.display = "none";
    }
}


function updateMarker1Div() {
    if (!marker1) return;

    const markerPos = marker1.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * -13 + 0.5) * window.innerHeight;

    const marker1Div = document.getElementById("marker1Div");
    if (marker1Div) {
        marker1Div.style.left = `${x}px`;
        marker1Div.style.top = `${y}px`;
    }

    
}

marker1Div.style.pointerEvents = "none";
// Ensure the function runs on every frame
updateMarker1Div(); // Update div position

function updateMarker1Div2() {
    if (!marker1) return;

    const markerPos = marker1.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * 0.15 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * -17 + 0.5) * window.innerHeight;

    const marker1Div2 = document.getElementById("marker1Div2");
    if (marker1Div2) {
        marker1Div2.style.left = `${x}px`;
        marker1Div2.style.top = `${y}px`;
    }

    
}

marker1Div2.style.pointerEvents = "none";
// Ensure the function runs on every frame
updateMarker1Div2(); // Update div position

function updateMarker1Div3() {
    if (!marker1) return;

    const markerPos = marker1.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * -0.35 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * -17 + 0.5) * window.innerHeight;

    const marker1Div3 = document.getElementById("marker1Div3");
    if (marker1Div3) {
        marker1Div3.style.left = `${x}px`;
        marker1Div3.style.top = `${y}px`;
    }

    
}

marker1Div3.style.pointerEvents = "none";
// Ensure the function runs on every frame
updateMarker1Div3(); // Update div position

function updateMarker1Div4() {
    if (!marker1) return;

    const markerPos = marker1.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * -0.1 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * -7 + 0.5) * window.innerHeight;

    const marker1Div4 = document.getElementById("marker1Div4");
    if (marker1Div4) {
        marker1Div4.style.left = `${x}px`;
        marker1Div4.style.top = `${y}px`;
    }

    
}

marker1Div4.style.pointerEvents = "none";
// Ensure the function runs on every frame
updateMarker1Div4(); // Update div position

function updateMarker1Div5() {
    if (!marker1) return;

    const markerPos = marker1.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * 0.32 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * -3.7 + 0.5) * window.innerHeight;
    

    const marker1Div5 = document.getElementById("marker1Div5");
    if (marker1Div5) {
        marker1Div5.style.left = `${x}px`;
        marker1Div5.style.top = `${y}px`;
    }

    
}

marker1Div5.style.pointerEvents = "none";
// Ensure the function runs on every frame
updateMarker1Div5(); // Update div position

function updateMarker1Div6() {
    if (!marker1) return;

    const markerPos = marker1.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * -0.1 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * 3 + 0.5) * window.innerHeight;

    const marker1Div6 = document.getElementById("marker1Div6");
    if (marker1Div6) {
        marker1Div6.style.left = `${x}px`;
        marker1Div6.style.top = `${y}px`;
    }

    
}

marker1Div6.style.pointerEvents = "none";
// Ensure the function runs on every frame
updateMarker1Div6(); // Update div position



function updateMarker2Div() {
    if (!marker2) return;

    const markerPos = marker2.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * -0.25 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * -0.2 + 0.5) * window.innerHeight;

    const marker2Div = document.getElementById("marker2Div");
    if (marker2Div) {
        marker2Div.style.left = `${x}px`;
        marker2Div.style.top = `${y}px`;
    }

    
}

marker2Div.style.pointerEvents = "none";
// Ensure the function runs on every frame
updateMarker2Div(); // Update div position


function updateMarker3aDiv() {
    if (!marker3a) return;

    const markerPos = marker3a.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * 0.42 + 0.57) * window.innerHeight;

    const markerDiv = document.getElementById("marker3aDiv");
    if (markerDiv) {
        markerDiv.style.left = `${x}px`;
        markerDiv.style.top = `${y}px`;
    }

    
}

marker3aDiv.style.pointerEvents = "none";
// Ensure the function runs on every frame
updateMarker3aDiv(); // Update div position

function updateMarker3aDiv2() {
    if (!marker3a) return;

    const markerPos = marker3a.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * 0.15 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * 0.42 + 0.4) * window.innerHeight;

    const markerDiv2 = document.getElementById("marker3aDiv2");
    if (markerDiv2) {
        markerDiv2.style.left = `${x}px`;
        markerDiv2.style.top = `${y}px`;
    }

    
}

marker3aDiv2.style.pointerEvents = "none";
// Ensure the function runs on every frame
updateMarker3aDiv2(); // Update div position

function updateMarker4Div() {
    if (!marker4) return;

    const markerPos = marker4.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * -0.5 + 0.45) * window.innerWidth;
    const y = (-markerPos.y * 0.5 + 0.6) * window.innerHeight;

    const marker4Div = document.getElementById("marker4Div");
    if (marker4Div) {
        marker4Div.style.left = `${x}px`;
        marker4Div.style.top = `${y}px`;
    }

    
}

marker4Div.style.pointerEvents = "none";
updateMarker4Div(); 

function updateMarker6Div() {
    if (!marker6) return;

    const markerPos = marker6.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * 4 + 0.45) * window.innerWidth;
    const y = (-markerPos.y * 0.5 + 0.3) * window.innerHeight;

    const marker6Div = document.getElementById("marker6Div");
    if (marker6Div) {
        marker6Div.style.left = `${x}px`;
        marker6Div.style.top = `${y}px`;
    }

    
}

marker6Div.style.pointerEvents = "none";
updateMarker6Div(); 


// Add event listeners
window.addEventListener("mousemove", onPointerMove2);


function onPointerMove3(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(marker2);

    if (intersects.length > 0) {
        hoverTextMarker2.style.display = "block";
        hoverTextMarker2.style.left = `${event.clientX + 10}px`;
        hoverTextMarker2.style.top = `${event.clientY + 10}px`;
    } else {
        hoverTextMarker2.style.display = "none";
    }

    // Check for intersections with Marker 1
    const intersectsMarker1 = raycaster.intersectObject(marker1);
    if (intersectsMarker1.length > 0) {
        hoverTextMarker1.style.display = "block";
        hoverTextMarker1.style.left = `${event.clientX + 10}px`;
        hoverTextMarker1.style.top = `${event.clientY + 10}px`;
    } else {
        hoverTextMarker1.style.display = "none";
    }

    const intersectsMarker4 = raycaster.intersectObject(marker4);
    if (intersectsMarker4.length > 0) {
        hoverTextMarker4.style.display = "block";
        hoverTextMarker4.style.left = `${event.clientX + 10}px`;
        hoverTextMarker4.style.top = `${event.clientY + 10}px`;
    } else {
        hoverTextMarker4.style.display = "none";
    }

}

window.addEventListener("pointermove", onPointerMove3);


// Camera Movement Functions
function moveCamera(marker, offsetX = -0.7, offsetY = 0, offsetZ = -4) {
    
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    
    gsap.to(camera.position, {
        x: marker.position.x + offsetX,
        y: 2.3 + offsetY,
        z: marker.position.z + offsetZ,
        duration: 3,
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
        

    });
    gsap.to(controls.target, {
        x: marker.position.x,
        y: 2.3,
        z: marker.position.z,
        duration: 3,
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
    });

    resetButton.style.display = "block";
}

// Click Event for Reset Button
let resetRecently = false; // Track if reset was clicked

resetButton.addEventListener("click", () => {
    console.log("🔄 Resetting Camera on iPhone");
    

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    gsap.to(camera.position, {
        x: 9,
        y: 2.3,
        z: 0.5,
        duration: 2.5,
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
    });
    gsap.to(controls.target, {
        x: 5.5,
        y: 2.3,
        z: 0,
        duration: 2.5,
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
    });
    forceHideDivs();
    // 🚨 Forcefully hide all divs  
    document.querySelectorAll(".markerDiv").forEach(div => {
        div.style.display = "none";  
        div.style.pointerEvents = "none";
        div.offsetHeight; // ⚡ Force reflow
    });

    setTimeout(() => {
        resetButton.style.display = "none";
    }, 1000);
});

function forceHideDivs() {
    document.querySelectorAll(".markerDiv").forEach(div => {
        div.style.display = "none";
        void div.offsetHeight; // 🚀 Forces Safari to recognize change
        div.style.display = "none"; 
    });
}



    resetButton.addEventListener("click", () => {
        console.log("🔄 Resetting Camera");
    
        resetRecently = true; // Prevent re-enabling for a short time
    
        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(controls.target);
    
        gsap.to(camera.position, {
            x: 9,
            y: 2.3,
            z: 0.5,
            duration: 2.5,
            ease: "power2.inOut",
            onUpdate: () => controls.update(),
        });
        gsap.to(controls.target, {
            x: 5.5,
            y: 2.3,
            z: 0,
            duration: 2.5,
            ease: "power2.inOut",
            onUpdate: () => controls.update(),
        });

        disableMarkerDivs(); // ✅ Hides all marker divs

    
        // Disable all marker divs
        const markerDivs = [
            marker1Div, marker1Div2, marker1Div3, marker1Div4,
            marker1Div5, marker1Div6, marker2Div, marker3aDiv,
            marker3aDiv2, marker4Div, marker6Div
        ];
        markerDivs.forEach(div => {
            div.style.display = "none";
            div.style.pointerEvents = "none";
        });
    
        setTimeout(() => {
            resetRecently = false; // Allow marker divs to re-enable after a delay
        }, 2000); // Adjust delay if needed
    
        setTimeout(() => {
            resetButton.style.display = "none";
        }, 1500);

        if (whiteboardCanvas) {
            whiteboardCanvas.style.display = "none";
        }

        if (whiteboardControls){
            whiteboardControls.style.display = "none"; // 🚀 Make controls visible

        }
    
        // ✅ Hide the whiteboard container (including background)
        const whiteboardContainer = document.getElementById("whiteboardContainer");
        if (whiteboardContainer) {
            whiteboardContainer.style.display = "none";
        }
    });

// Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onPointerMove(event) {
        if (window.innerWidth <= 500) return; // ❌ Ignore hover on mobile

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([marker1, marker2, marker3, marker4, marker5, marker6]);

        if (intersects.length > 0) {
            gsap.to(intersects[0].object.material, { opacity: 0.6, duration: 0.3 });
            document.body.style.cursor = "pointer";
        } else {
            gsap.to([marker1.material, marker2.material, marker3.material, marker4.material, marker5.material, marker6.material], { opacity: 0, duration: 0.3 });
            document.body.style.cursor = "default";
        }
    }


    
    const markers = [marker1, marker2, marker3, marker4, marker5, marker6];

    function onPointerDown(event) {
        if (resetRecently) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers, true); // ✅ Check all markers

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            console.log("✅ Marker Clicked:", clickedObject.name);

            if (clickedObject.name === "Marker1") {
                moveCamera(marker1);
                enableMarkerDivsAfterDelay(2500, [marker1Div, marker1Div2, marker1Div3, marker1Div4, marker1Div5, marker1Div6]);
            }

            if (clickedObject.name === "Marker2") {
                moveCamera(marker2, -4, 4, 6);
                enableMarkerDivsAfterDelay(2500, [marker2Div]);
            }

            if (clickedObject.name === "Marker3") {
                moveCamera(marker3, -0.5, 1, -2);
                enableMarkerDivsAfterDelay(2500, [marker3aDiv, marker3aDiv2]);
            }

            if (clickedObject.name === "Marker4") {
                moveCamera(marker4, 1, 1, 1.6);
                enableMarkerDivsAfterDelay(2500, [marker4Div]);
            }

            if (clickedObject.name === "Marker5") {
                toggleLight(); // ✅ Call function to dim/restore light
            }
            if (clickedObject.name === "Marker6") {
                moveCamera(marker6, 9, 1, -0.5);
                enableMarkerDivsAfterDelay(2500, [marker6Div]);
            }
            
        }
    } 
    
    let updateScheduled = false;

    function enableDrawing(canvas, texture) {
        let isDrawing = false;
        const ctx = canvas.getContext("2d");
        let selectedColor = "black"; // Default color
        let brushSize = 5; // Default brush size
    
        function getPos(event) {
            const rect = canvas.getBoundingClientRect();
            const x = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
            const y = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top;
            return { x, y };
        }
    
        function startDrawing(event) {
            isDrawing = true;
            const { x, y } = getPos(event);
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    
        function draw(event) {
            if (!isDrawing) return;
            event.preventDefault(); // Prevent scrolling
        
            const { x, y } = getPos(event);
            ctx.lineWidth = brushSize;
            ctx.lineCap = "round";
            ctx.strokeStyle = selectedColor;
        
            ctx.lineTo(x, y);
            ctx.stroke();
        
            // ✅ Optimize texture updates (reduces GPU load)
            if (!updateScheduled) {
                updateScheduled = true;
                setTimeout(() => {
                    texture.needsUpdate = true;
                    updateScheduled = false;
                }, 100);
            }
        }
    
        function stopDrawing() {
            isDrawing = false;
            ctx.closePath();
        }
    
        // Event Listeners
        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", stopDrawing);
        canvas.addEventListener("touchstart", startDrawing, { passive: false });
        canvas.addEventListener("touchmove", draw, { passive: false });
        canvas.addEventListener("touchend", stopDrawing);
    
        // ✅ Color Picker Event
        document.getElementById("colorPicker").addEventListener("input", (event) => {
            selectedColor = event.target.value;
        });
    
        // ✅ Brush Size Event
        document.getElementById("brushSize").addEventListener("input", (event) => {
            brushSize = event.target.value;
        });
    
        // ✅ Eraser Button - Sets Color to White (Background Color)
        document.getElementById("eraserButton").addEventListener("click", () => {
            selectedColor = "white"; // Eraser works by "painting" over with white
        });
    
        // ✅ Clear Button - Fully Clears the Canvas
        document.getElementById("clearButton").addEventListener("click", () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears everything
            ctx.fillStyle = "white"; // Reset to white background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            texture.needsUpdate = true; // 🔥 Ensure the Three.js whiteboard resets
        });
    }
    
    let whiteboardCanvas, whiteboardTexture, whiteboardMesh;

    function setupWhiteboard(whiteboard) {
        if (whiteboardCanvas) return; // Prevent multiple setups
    
        // Create the drawing canvas
        whiteboardCanvas = document.createElement("canvas");
        whiteboardCanvas.width = 600;
        whiteboardCanvas.height = 350;
        const ctx = whiteboardCanvas.getContext("2d");
    
        // Fill the canvas with a white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
    
        // ✅ Create a Three.js texture from the canvas
        whiteboardTexture = new THREE.CanvasTexture(whiteboardCanvas);
        whiteboardTexture.needsUpdate = true;
    
        // ✅ Find the whiteboard in the Three.js scene and apply the texture
        whiteboard.traverse((child) => {
            if (child.isMesh && child.name === "whiteboard") {
                console.log("✅ Applying texture to whiteboard:", child.name);
                whiteboardMesh = child;
                whiteboardMesh.material.map = whiteboardTexture;
                whiteboardMesh.material.needsUpdate = true;
            }
        });
    
        // ✅ Enable drawing and update the texture in real-time
        enableDrawing(whiteboardCanvas, whiteboardTexture);
    
        // ✅ Ensure the container exists before appending
        let container = document.getElementById("whiteboardContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "whiteboardContainer";
            document.body.appendChild(container);
        }
    
        // ✅ Append the canvas inside the container
        container.appendChild(whiteboardCanvas);
        container.style.display = "none"; // Hide until activated

    
        // ✅ Apply styles for centering

        whiteboardCanvas.style.position = "relative"; // Change from "absolute"
        whiteboardCanvas.style.top = "50px";
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";
        container.style.background = "rgba(0, 0, 0, 0.46)"; // Optional: Dim background
        container.style.zIndex = "999";
        container.style.display = "none"; // Hide until activated
    
        whiteboardCanvas.style.border = "2px solid black";
        whiteboardCanvas.style.display = "none"; // Hidden until "Start Drawing" is clicked
    }

    function removeDrawingEvents(canvas) {
    canvas.removeEventListener("mousedown", startDrawing);
    canvas.removeEventListener("mousemove", draw);
    canvas.removeEventListener("mouseup", stopDrawing);
    canvas.removeEventListener("touchstart", startDrawing);
    canvas.removeEventListener("touchmove", draw);
    canvas.removeEventListener("touchend", stopDrawing);
}

    


document.getElementById("drawButton").addEventListener("click", function(event) {
    console.log("🖊 'Start Drawing' button clicked!");

    if (!whiteboardCanvas) {
        console.log("🖼 Setting up whiteboard...");
        setupWhiteboard();
    }

    // ✅ Show the container and canvas
    let container = document.getElementById("whiteboardContainer");
    if (container) container.style.display = "flex";

    whiteboardCanvas.style.display = "block";
    whiteboardCanvas.style.opacity = "1";
    whiteboardCanvas.style.pointerEvents = "auto";

    console.log("📜 Whiteboard is now visible!");

    if (whiteboardControls) {
        whiteboardControls.style.display = "block"; // 🚀 Make controls visible

    }

   
});




window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerdown", onPointerDown);

function handleMobileView() {
    if (window.innerWidth <= 500) {
        console.log("📱 Switching to Mobile Version");

        // Remove hover event listeners completely
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointermove", onPointerMove3);

        // Ensure markers are completely invisible unless tapped
        setMarkerVisibility(0);

        // Add mobile touch event
        window.addEventListener("touchstart", onTouchStart, { passive: false });

    } else {
        console.log("💻 Switching to Desktop Version");

        // Restore hover event listeners for desktop
        window.addEventListener("pointermove", onPointerMove);

        // Remove mobile touch event
        window.removeEventListener("touchstart", onTouchStart);
    }
}
// Function to set marker opacity (0 on desktop, low opacity on mobile)
function setMarkerVisibility(opacityValue) {
    const markers = [marker1, marker2, marker3, marker4, marker5, marker6];

    markers.forEach(marker => {
        marker.material.opacity = opacityValue; // Apply opacity
        marker.material.transparent = true; // Ensure transparency is enabled
    });
}

// Function to handle touch interactions (no hover required)



function onTouchStart(event) {
    if (resetRecently) {
        console.log("🚫 Reset was clicked recently, not enabling divs.");
        return; // Prevent enabling too soon after reset
    }

    if (event.touches.length === 1) { // Ensure it's a single touch
        const touch = event.touches[0];

        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        if (targetElement === renderer.domElement) {
            event.preventDefault(); 

            // Convert touch position
            const rect = renderer.domElement.getBoundingClientRect();
            const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

            mouse.x = x;
            mouse.y = y;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([marker1, marker2, marker3, marker4, marker5, marker6], true);

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;
                console.log("✅ Marker Clicked:", clickedObject.name);

                if (clickedObject.name === "Marker1") {
                    moveCamera(marker1);
                    enableMarkerDivsAfterDelay(2500, [marker1Div, marker1Div2, marker1Div3, marker1Div4, marker1Div5, marker1Div6]);
                }

                if (clickedObject.name === "Marker2") {
                    moveCamera(marker2, -4, 4, 6);
                    enableMarkerDivsAfterDelay(2500, [marker2Div]);
                }

                if (clickedObject.name === "Marker3") {
                    moveCamera(marker3, -0.5, 1, -2);
                    enableMarkerDivsAfterDelay(2500, [marker3aDiv, marker3aDiv2]);
                }

                if (clickedObject.name === "Marker4") {
                    moveCamera(marker4, 1, 1, 1.6);
                    enableMarkerDivsAfterDelay(2500, [marker4Div]);
                }
                

                if (clickedObject.name === "Marker5") {
                    toggleLight(); // ✅ Call function to dim/restore light
                }// ✅ Only toggle lights when clicking marker5

                if (clickedObject.name === "Marker6") {
                    moveCamera(marker6, 9, 1, -0.5);
                    enableMarkerDivsAfterDelay(2500, [marker6Div]);
                }
                
            }
        }
    }
}


/**
 * Enables a list of marker divs after a delay
 * @param {number} delay - Delay in milliseconds
 * @param {Array} markerDivs - List of marker div elements
 */
function enableMarkerDivsAfterDelay(delay, markerDivs) {
    setTimeout(() => {
        if (!resetRecently) {
            markerDivs.forEach(div => {
                div.style.display = "block";
                div.style.pointerEvents = "auto";
            });
        }
    }, delay);
}
function disableMarkerDivs() {
    console.log("❌ Hiding all marker divs after reset...");
    [marker1Div, marker1Div2, marker1Div3, marker1Div4, marker1Div5, marker1Div6,
     marker2Div, marker3aDiv, marker3aDiv2, marker4Div].forEach(div => {
        div.style.display = "none";
        div.style.pointerEvents = "none";
    });
}

let isDimmed = false;

function toggleLight() {
    isDimmed = !isDimmed; // Toggle state

    gsap.to(pointLight1, { intensity: isDimmed ? 0.1 : 2.5, duration: 1 });
    gsap.to(pointLight2, { intensity: isDimmed ? 0.05 : 1, duration: 1 });

    // Ensure scene background is set if transparent
    if (!scene.background) {
        scene.background = new THREE.Color(0x000000); // Default to black if null
    }
    
    gsap.to(scene.background, {
        r: isDimmed ? 0.05 : 1,
        g: isDimmed ? 0.05 : 1,
        b: isDimmed ? 0.05 : 1,
        duration: 1
    });

    console.log(isDimmed ? "🌙 Lights Dimmed" : "☀️ Lights Restored");
}


// Function to create a blinking dot on a marker
function createBlinkingDot(dotId) {
    const dot = document.createElement("div");
    dot.classList.add("blinking-dot");
    dot.id = dotId;
    document.body.appendChild(dot);
}

// Create blinking dots for each marker
createBlinkingDot("marker1Dot");
createBlinkingDot("marker2Dot");
createBlinkingDot("marker3Dot");
createBlinkingDot("marker4Dot");

// Function to update the blinking dot position based on the 3D marker position
function updateBlinkingDot(marker, dotId) {
    if (!marker) return;

    const markerPos = marker.position.clone();
    markerPos.project(camera); // Convert 3D position to 2D screen space

    const x = (markerPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-markerPos.y * 0.8 + 0.5) * window.innerHeight;

    const dot = document.getElementById(dotId);
    if (dot) {
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
    }
}


// Run on page load and when resizing
handleMobileView();
window.addEventListener("resize", handleMobileView);
window.addEventListener("touchstart", onPointerDown, { passive: false });



function applyResponsiveStyles() {
    if (window.innerWidth <= 700) {
        document.body.classList.add("mobile-view");
    } else {
        document.body.classList.remove("mobile-view");
    }
}

applyResponsiveStyles();

// Apply styles on load and resize
window.addEventListener("load", applyResponsiveStyles);
window.addEventListener("resize", applyResponsiveStyles);




// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    updateBlinkingDot(marker1, "marker1Dot");
    updateBlinkingDot(marker2, "marker2Dot");
    updateBlinkingDot(marker3, "marker3Dot");
    updateBlinkingDot(marker4, "marker4Dot");
    
    controls.update();
    updateMarker3aDiv();  
    renderer.render(scene, camera);

    raycaster.setFromCamera(mouse, camera); // ✅ Keeps raycasting active
    renderer.render(scene, camera);
   
}


animate();
