function updateTime() {
    const timeElement = document.querySelector(".time p"); // Selects the <p> inside .time
    const now = new Date();
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert to 12-hour format
    minutes = minutes.toString().padStart(2, '0'); // Ensure two-digit minutes

    timeElement.textContent = `${hours}:${minutes} ${ampm}`;
}

// Update time every second
setInterval(updateTime, 1000);
updateTime(); // Call once to set the time immediately
