window.showMessage = function (type, text) {
    const msgBox = document.getElementById('formMessage');
    const msgText = document.getElementById('formMessageText');
    msgText.textContent = text;
    msgBox.className = `form-message ${type} show`;
    msgBox.style.display = 'block';
};

document.getElementById('closeMessage').addEventListener('click', () => {
    const msgBox = document.getElementById('formMessage');
    msgBox.classList.remove('show');
    setTimeout(() => {
        msgBox.style.display = 'none';
    }, 300);
});

window.handleFormSubmit = function () {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]+$/;

    // Check if all fields are filled
    if (!name || !email || !phone || !message) {
        showMessage('error', "Please fill in all fields.");
        return;
    }

    // Validate name
    if (!nameRegex.test(name)) {
        showMessage('error', "Name can only contain letters and spaces.");
        return;
    }

    // Validate email
    if (!emailRegex.test(email)) {
        showMessage('error', "Please enter a valid email address.");
        return;
    }

    // Validate phone
    if (!phoneRegex.test(phone)) {
        showMessage('error', "Phone number can only contain digits.");
        return;
    }

    // Validate reCAPTCHA
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        showMessage('error', "Please complete the reCAPTCHA verification.");
        return;
    }

    // If all validations pass, proceed with sending email
    fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            email,
            phone,
            message,
            recaptchaResponse // Send the reCAPTCHA token to your backend
        }),
    })
        .then(response => response.json())
        .then(data => {
            showMessage('success', data.message);
            document.getElementById('contactForm').reset();
            grecaptcha.reset(); // Reset the reCAPTCHA after successful submission
            setTimeout(() => {
                closeModal('emailForm');
                document.getElementById('formMessage').style.display = 'none';
            }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('error', 'Failed to send message. Please try again later.');
            grecaptcha.reset(); // Reset reCAPTCHA on error too
        });
};