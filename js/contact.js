const bubble = document.getElementById('chat-bubble');
const chatWindow = document.getElementById('chat-window');
const chatCover = document.getElementById('chatCover');

let iframeLoaded = false;

bubble.addEventListener('click', () => {
    const isVisible = chatWindow.style.display === 'block';

    if (!iframeLoaded) {
        const iframe = document.createElement('iframe');
        iframe.src = "https://www.chatbase.co/chatbot-iframe/LQyVnaPo9zgfrPZ4ikRsk";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.frameBorder = "0";
        chatWindow.appendChild(iframe);
        iframeLoaded = true;
    }

    chatWindow.style.display = isVisible ? 'none' : 'block';
    chatCover.style.display = isVisible ? 'none' : 'block';
});
