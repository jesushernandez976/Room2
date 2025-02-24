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
scene.add(new THREE.AmbientLight(0xffffff, .6));
const pointLight1 = new THREE.PointLight(0xffffff, 2, 10);
pointLight1.position.set(0, 2, 0);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1, 10);
pointLight2.position.set(5, 2, -5);
scene.add(pointLight2);

// Initial Camera Position
camera.position.set(9, 2.3, .5);
camera.lookAt(2.5, 2.3, 0);
controls.target.set(5.5, 2.3, 0);
controls.update();

// Load 3D Models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://cdn.skypack.dev/three@0.129.0/examples/js/libs/draco/");
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

async function loadModels() {
    try {
        const gltf1 = loader.loadAsync("./models/eye/r3.gltf");
        // const gltf2 = loader.loadAsync("./models/eye/r22.gltf");

        const [gltf1Result, gltf2Result] = await Promise.all([gltf1]);

        const object1 = gltf1Result.scene;
        // const object2 = gltf2Result.scene;
        
        scene.add(object1);
        // scene.add(object2);

        const box = new THREE.Box3().setFromObject(object1);
        const center = box.getCenter(new THREE.Vector3());

        if (center.length() > 0) {
            camera.position.set(center.x + 9, 2.3, center.z + 0.5);
            camera.lookAt(center.x, 2.3, center.z);
            controls.target.set(center.x + 2.5, 2.3, center.z);
            controls.update();
        }
    } catch (error) {
        console.error("Error loading models:", error);
    }
}
loadModels();

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
const marker2 = createMarker([3.43, 1.94, -2.98], [0.2, 1.01, 1.64], "Marker2", [0, Math.PI / 4.3, 0]);
const marker3 = createMarker([5.9, 1.29, 1.3], [1, 1, .5], "Marker3", [Math.PI / 2, Math.PI /1, 0]);
const marker3a = createMarker([5.9, 1.29, 1.9], [2.5, 2.5,2.5], "Marker3a", [Math.PI / 2, Math.PI /1, 0, 0], "circle")
marker3a.visible = false;
const marker4 = createMarker([.10, 1.2, -1.6], [.7, 1, .7], "Marker4", [Math.PI / 2, Math.PI / 2, 0]);


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

// Function to handle mouse click (for redirection



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
resetButton.addEventListener("click", () => {
    console.log("🔄 Resetting Camera");


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

    marker1.visible = true;
    marker1Div.style.pointerEvents = "none";
    marker1Div2.style.pointerEvents = "none";
    marker1Div3.style.pointerEvents = "none";
    marker1Div4.style.pointerEvents = "none";
    marker1Div5.style.pointerEvents = "none";
    marker1Div6.style.pointerEvents = "none";
    marker2.visible = true;
    marker2Div.style.pointerEvents = "none";
    marker3.visible = true; 
    marker3a.visible = false;
    marker4.visible = true;
    marker3aDiv.style.display = "none"; // Hide marker3aDiv on reset
    marker3aDiv2.style.pointerEvents = "none";
    marker3aDiv.style.pointerEvents = "none";
    marker4Div.style.pointerEvents = "none";


    setTimeout(() => {
        resetButton.style.display = "none";
    }, 1500);
});



// Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onPointerMove(event) {
    if (window.innerWidth <= 500) return; // ❌ Ignore hover on mobile

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([marker1, marker2, marker3, marker4]);

    if (intersects.length > 0) {
        gsap.to(intersects[0].object.material, { opacity: 0.12, duration: 0.3 });
        document.body.style.cursor = "pointer";
    } else {
        gsap.to([marker1.material, marker2.material, marker3.material, marker4.material], { opacity: 0, duration: 0.3 });
        document.body.style.cursor = "default";
    }
}


function onPointerDown(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([marker1, marker2, marker3,marker4]);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        if (clickedObject.name === "Marker1") {
            moveCamera(marker1);
            marker3.visible = true;  
            marker3a.visible = false;
            marker1.visible = false;
        
            // List of marker divs
            const markerDivs = [
                marker1Div, marker1Div2, marker1Div3, 
                marker1Div4, marker1Div5, marker1Div6
            ];
        
            // Apply delay before enabling each marker div
            markerDivs.forEach((div, index) => {
                setTimeout(() => {
                    div.style.display = "block";
                    div.style.pointerEvents = "auto";
                }, 1500 + index * 50); // 300ms base delay + 50ms incremental for each
            });
        }
        
        // Hide marker divs instantly when clicking elsewhere
        if (clickedObject.name !== "Marker1" && marker1Div.style.pointerEvents === "auto") {
            const markerDivs = [
                marker1Div, marker1Div2, marker1Div3, 
                marker1Div4, marker1Div5, marker1Div6
            ];
        
            markerDivs.forEach(div => {
                div.style.display = "none"; 
                div.style.pointerEvents = "none";
            });
        }
        

        if (clickedObject.name === "Marker2") {
            moveCamera(marker2, -1, 4, 1);
            marker3.visible = true;  
            marker3a.visible = false;
            marker2.visible = false;
        
            setTimeout(() => {
                marker2Div.style.display = "block";
                marker2Div.style.pointerEvents = "auto";
            }, 1500);
        }
        
        if (clickedObject.name !== "Marker2" && marker2Div.style.pointerEvents === "auto") {
            marker2Div.style.display = "none";
            marker2Div.style.pointerEvents = "none";
        }


        if (clickedObject.name === "Marker3") {
        moveCamera(marker3, -0.5, 1, -2);
        marker3.visible = false;
        marker3a.visible = true;

        setTimeout(() => {
            marker3aDiv.style.display = "block";
            marker3aDiv.style.pointerEvents = "auto";

        }, 1500);
        }

        if (clickedObject.name === "Marker3") {
            moveCamera(marker3, -0.5, 1, -2);
            marker3.visible = false;
            marker3a.visible = true;
    
            setTimeout(() => {
                marker3aDiv2.style.display = "block";
                marker3aDiv2.style.pointerEvents = "auto";
    
            }, 1500);
            }

        if (clickedObject.name !== "Marker3" && marker3aDiv.style.pointerEvents === "auto") {
        marker3aDiv.style.display = "none";
        marker3aDiv.style.pointerEvents = "none";
        }

        if (clickedObject.name !== "Marker3" && marker3aDiv2.style.pointerEvents === "auto") {
            marker3aDiv2.style.display = "none";
            marker3aDiv2.style.pointerEvents = "none";
            }


        if (clickedObject.name === "Marker4") {
            moveCamera(marker4, 1, 1, 1.6);
            marker3.visible = true;  
            marker3a.visible = false;
            marker4.visible = false;
        
            setTimeout(() => {
                marker4Div.style.display = "block";
                marker4Div.style.pointerEvents = "auto";
            }, 1500);
        }
        
        if (clickedObject.name !== "Marker4" && marker4Div.style.pointerEvents === "auto") {
            marker4Div.style.display = "none";
            marker4Div.style.pointerEvents = "none";
        }
    }
}

window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerdown", onPointerDown);


function handleMobileView() {
    if (window.innerWidth <= 500) {
        console.log("📱 Switching to Mobile Version");

        // Remove hover event listeners completely
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointermove", onPointerMove3);

        // Ensure markers are completely invisible unless tapped
        setMarkerVisibility(.2);

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
    const markers = [marker1, marker2, marker3, marker4];

    markers.forEach(marker => {
        marker.material.opacity = opacityValue; // Apply opacity
        marker.material.transparent = true; // Ensure transparency is enabled
    });
}

// Function to handle touch interactions (no hover required)
function onTouchStart(event) {
    if (event.touches.length === 1) { // Ensure it's a single touch
        const touch = event.touches[0];

        // Check if the user touched the 3D canvas (Three.js renderer)
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        if (targetElement === renderer.domElement) {
            event.preventDefault(); // Only prevent default if touching the 3D scene

            // Convert touch position to normalized coordinates
            const rect = renderer.domElement.getBoundingClientRect();
            const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

            mouse.x = x;
            mouse.y = y;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([marker1, marker2, marker3, marker4], true);

            console.log("📱 Touch detected at:", touch.clientX, touch.clientY);
            console.log("🔍 Intersected Markers:", intersects.map(obj => obj.object.name)); // Debugging output

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;
                console.log("✅ Marker Clicked:", clickedObject.name); // Debugging output

                if (clickedObject.name === "Marker1") moveCamera(marker1);
                if (clickedObject.name === "Marker2") moveCamera(marker2, -4, 4, 6);
                if (clickedObject.name === "Marker3") moveCamera(marker3, -0.5, 1, -2);
                if (clickedObject.name === "Marker4") moveCamera(marker4, 1, 2, 9.6);
            } else {
        
            }
        }
    }
}

// Run on page load and when resizing
handleMobileView();
window.addEventListener("resize", handleMobileView);
window.addEventListener("touchstart", onTouchStart, { passive: false }); // Ensure touchstart is added

function loadCSS(cssFile) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssFile;
    link.type = "text/css";
    document.head.appendChild(link);
}

// Load CSS file (update the path if needed)
loadCSS("styles.css");
function applyResponsiveStyles() {
    if (window.innerWidth <= 500) {
        document.body.classList.add("mobile-view");
    } else {
        document.body.classList.remove("mobile-view");
    }
}

// Apply styles on load and resize
window.addEventListener("load", applyResponsiveStyles);
window.addEventListener("resize", applyResponsiveStyles);


// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateMarker3aDiv();  
    renderer.render(scene, camera);
     // Update div position
   
}


animate();
