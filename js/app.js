window.handleFormSubmit = function () {

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]+$/;

    if (!name || !email || !phone || !message) {
        showMessage('error', "Please fill in all fields.");
        return;
    }

    if (!nameRegex.test(name)) {
        showMessage('error', "Name can only contain letters and spaces.");
        return;
    }

    if (!emailRegex.test(email)) {
        showMessage('error', "Please enter a valid email address.");
        return;
    }

    if (!phoneRegex.test(phone)) {
        showMessage('error', "Phone number can only contain digits.");
        return;
    }

    // If all validations pass, proceed
    fetch('https://email-backend-nwmz.onrender.com/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
    })
        .then(response => response.json())
        .then(data => {
            showMessage('success', data.message);
            document.getElementById('contactForm').reset();
            setTimeout(() => {
                closeModal('emailForm');
                document.getElementById('formMessage').style.display = 'none';
            }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('error', 'Failed to send message. Please try again later.');
        });
};

function showMessage(type, text) {
    const msgBox = document.getElementById('formMessage');
    const msgText = document.getElementById('formMessageText');
    msgText.textContent = text;
    msgBox.className = `form-message ${type} show`;
    msgBox.style.display = 'block';
}

// Close button handler
document.getElementById('closeMessage').addEventListener('click', () => {
    const msgBox = document.getElementById('formMessage');
    msgBox.classList.remove('show');
    setTimeout(() => {
        msgBox.style.display = 'none';
    }, 300);
});