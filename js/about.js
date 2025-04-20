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


function toggleMenu() {
    document.getElementById('menuOverlay').classList.toggle('show');
  }


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