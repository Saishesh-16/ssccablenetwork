/**
 * Login Page Logic
 * Handles login form submission and captcha generation
 */

let captchaCode = '';

// Generate captcha on page load
document.addEventListener('DOMContentLoaded', () => {
    generateCaptcha();
    
    // Check if user is already logged in
    if (localStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = 'index.html';
    }
});

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('passwordIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}

/**
 * Generate random captcha code and display it
 */
function generateCaptcha() {
    // Generate random 5-digit number
    captchaCode = Math.floor(10000 + Math.random() * 90000).toString();
    
    const canvas = document.getElementById('captchaCanvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some random lines for security
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }
    
    // Draw captcha text
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add slight rotation to each digit
    const spacing = canvas.width / 6;
    for (let i = 0; i < captchaCode.length; i++) {
        ctx.save();
        ctx.translate(spacing * (i + 1), canvas.height / 2);
        ctx.rotate((Math.random() - 0.5) * 0.3); // Random rotation
        ctx.fillText(captchaCode[i], 0, 0);
        ctx.restore();
    }
}

/**
 * Handle login form submission
 */
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const captcha = document.getElementById('captcha').value.trim();
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    // Hide error message
    errorDiv.classList.add('hidden');
    
    // Validate captcha
    if (captcha !== captchaCode) {
        errorText.textContent = 'Invalid captcha code. Please try again.';
        errorDiv.classList.remove('hidden');
        generateCaptcha(); // Generate new captcha
        document.getElementById('captcha').value = '';
        return;
    }
    
    // Simple authentication (for demo - in production, use proper backend authentication)
    // Default credentials: naveen2030 / naveen123
    if (username === 'naveen2030' && password === 'naveen123') {
        // Store authentication status
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        
        // Redirect to dashboard
        window.location.href = 'index.html';
    } else {
        errorText.textContent = 'Invalid username or password. Please try again.';
        errorDiv.classList.remove('hidden');
        generateCaptcha(); // Generate new captcha
        document.getElementById('captcha').value = '';
        document.getElementById('password').value = '';
    }
});

