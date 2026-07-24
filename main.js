// Initialize AOS (Animate on Scroll)
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        once: true,
        offset: 100
    });
    // Animate Counters
    const counters = document.querySelectorAll('.counter');
    if(counters.length > 0) {
        const speed = 100;
        const startCounters = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const inc = target / speed;
                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
            });
        };
    const statsSection = document.getElementById('stats-section');
        if (statsSection) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    startCounters();
                    observer.disconnect();
                }
            }, { threshold: 0.5 });
            observer.observe(statsSection);
        }
    }
    // Dynamic Database Fetching based on current page
    if (window.location.pathname.includes('notices.html')) {
        fetchNotices();
    }
    if (window.location.pathname.includes('hub.html')) {
        fetchHubPosts();
    }
    
    // Login Form Intercept
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});
    
// Chatbot functionality
/* ================================
   DYNAMIC DATABASE FUNCTIONS
   ================================ */
async function handleLogin(e) {
    e.preventDefault();
    const rollNo = document.getElementById('roll-no').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    errorDiv.style.display = 'none';
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roll_no: rollNo, password: password })
        });
        const data = await response.json();
        if (data.success) {
            alert(`Welcome back, ${data.user.name}!`);
            window.location.href = 'hub.html';
        } else {
            errorDiv.innerText = data.message;
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        errorDiv.innerText = "Error connecting to server.";
        errorDiv.style.display = 'block';
    }
}
async function fetchNotices() {
    const container = document.getElementById('notices-container');
    if (!container) return;
    
    try {
        const response = await fetch('/api/notices');
        const notices = await response.json();
        
        container.innerHTML = ''; // clear existing
        notices.forEach(notice => {
            const dateStr = new Date(notice.date).toLocaleDateString();
            const badgeClass = notice.category === 'Examinations' ? 'bg-danger' : 
                               notice.category === 'Placements' ? 'bg-success' : 'bg-primary';
            const borderClass = notice.category === 'Examinations' ? 'border-danger' : 
                                notice.category === 'Placements' ? 'border-success' : 'border-primary';
            
            const newBadge = notice.is_new ? '<span class="badge bg-primary rounded-pill">NEW</span>' : '';
            
            container.innerHTML += `
                <div class="col-12" data-aos="fade-up">
                    <div class="glass-card p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 border-start border-4 ${borderClass}">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="badge ${badgeClass} rounded-pill">${notice.category}</span>
                                ${newBadge}
                                <small class="text-secondary"><i class="fa-regular fa-calendar me-1"></i> ${dateStr}</small>
                            </div>
                            <h5 class="fw-bold text-white mb-0">${notice.title}</h5>
                        </div>
                        <button class="btn btn-outline-info text-nowrap"><i class="fa-solid fa-paperclip me-2"></i>Attachment</button>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Failed to fetch notices");
    }
}
async function fetchHubPosts() {
    const container = document.getElementById('hub-posts-container');
    if (!container) return;
    
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        
        container.innerHTML = ''; // clear existing
        posts.forEach(post => {
            const dateStr = new Date(post.created_at).toLocaleDateString();
            
            container.innerHTML += `
                <div class="glass-card p-4 mb-4" data-aos="fade-up">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex gap-3 align-items-center">
                            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width: 50px; height: 50px;">
                            ${post.author_name.charAt(0)}
                            </div>
                            <div>
                                <h6 class="fw-bold text-white mb-0">${post.author_name}</h6>
                                <small class="text-secondary">${dateStr}</small>
                            </div>
                        </div>
                        <button class="btn btn-sm text-secondary"><i class="fa-solid fa-ellipsis"></i></button>
                    </div>
                    <p class="text-white mb-3">${post.content}<br><br><span class="text-info">${post.tags || ''}</span></p>
                    <div class="border-top border-secondary pt-3 d-flex justify-content-between px-3">
                        <button class="btn btn-sm text-secondary"><i class="fa-regular fa-thumbs-up me-2"></i>Like (${post.likes})</button>
                        <button class="btn btn-sm text-secondary"><i class="fa-regular fa-comment me-2"></i>Comment (${post.comments})</button>
                        <button class="btn btn-sm text-secondary"><i class="fa-solid fa-share me-2"></i>Share</button>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Failed to fetch posts");
    }
}

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'flex';
        // Minor animation
        chatWindow.style.opacity = '0';
        setTimeout(() => chatWindow.style.opacity = '1', 50);
        document.getElementById('chat-input').focus();
    } else {
        chatWindow.style.display = 'none';
    }
}
function fillInput(text) {
    document.getElementById('chat-input').value = text;
}
function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}
async function sendMessage() {
    const inputField = document.getElementById('chat-input');
    const message = inputField.value.trim();
    if (!message) return;
    const chatBody = document.getElementById('chat-body');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerText = message;
    chatBody.appendChild(userMsg);
    
    inputField.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
// Add thinking placeholder
    const botThinking = document.createElement('div');
    botThinking.className = 'chat-message bot text-secondary';
    botThinking.innerText = 'Thinking...';
    chatBody.appendChild(botThinking);
    chatBody.scrollTop = chatBody.scrollHeight;
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove thinking, add real response
        chatBody.removeChild(botThinking);
        
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot';
         botMsg.innerText = data.reply || 'Network Error.';
        chatBody.appendChild(botMsg);
    } catch (error) {
        chatBody.removeChild(botThinking);
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot text-danger';
         botMsg.innerText = 'Error connecting to AI backend.';
        chatBody.appendChild(botMsg);
    }
    
    chatBody.scrollTop = chatBody.scrollHeight;
}
