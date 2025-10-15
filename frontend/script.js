// ⚙️ CONFIGURAÇÃO DA API
// ✅ CORRETO - URL completa e correta
const API_BASE_URL = 'https://erickdev-production.up.railway.app';

// E verifique se não há esta linha conflitante em outro lugar:
// REMOVA se existir: const API_CONFIG = { ... };

// Toggle mobile menu   
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll to top button
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    scrollToTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Fade in animation
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < window.innerHeight - 150) {
            element.style.opacity = 1;
            element.style.transform = 'translateY(0)';
        }
    });
};

fadeElements.forEach(element => {
    element.style.opacity = 0;
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
});

window.addEventListener('scroll', fadeInOnScroll);
window.addEventListener('load', fadeInOnScroll);

// Active nav highlighting
const sections = document.querySelectorAll('section');
const navLinksElements = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    navLinksElements.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Auto-hide header
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    lastScrollTop = scrollTop;
});

// Scroll indicator
document.querySelector('.scroll-indicator').addEventListener('click', () => {
    document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
});

// ========== SISTEMA DE FEEDBACK ==========

// Verifica conexão com backend
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/db-status`);
        const data = await response.json();
        
        if (data.database === "connected") {
            console.log("✅ Backend conectado!");
        } else {
            console.warn("⚠️ Backend online mas banco desconectado");
        }
    } catch (error) {
        console.error("❌ Backend não acessível:", error);
    }
});

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

function showStatus(message, type = 'success') {
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const bgColor = type === 'success' ? '#f0fff4' : '#fff5f5';
    const borderColor = type === 'success' ? 'green' : 'red';
    const textColor = type === 'success' ? 'green' : 'red';
    
    formStatus.innerHTML = `
        <div style="
            color: ${textColor}; 
            background: ${bgColor}; 
            padding: 12px; 
            border-radius: 8px; 
            border: 1px solid ${borderColor};
            margin-top: 1rem;
            animation: fadeIn 0.3s ease;
        ">
            <i class="fas ${iconClass}"></i> ${message}
        </div>
    `;
    
    if (type === 'success') {
        setTimeout(() => formStatus.innerHTML = '', 5000);
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonContent = submitButton.innerHTML;

    const formData = {
        nome: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        mensagem: `Assunto: ${document.getElementById('subject').value.trim()}\n\nMensagem: ${document.getElementById('message').value.trim()}`
    };

    // Validações
    if (!formData.nome || !formData.email || !formData.mensagem) {
        showStatus('Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (!isValidEmail(formData.email)) {
        showStatus('Por favor, insira um email válido.', 'error');
        return;
    }

    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitButton.disabled = true;
    formStatus.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showStatus(result.message, 'success');
            contactForm.reset();
        } else {
            throw new Error(result.error || 'Erro ao enviar mensagem');
        }
    } catch (error) {
        console.error("❌ Erro:", error);
        
        let errorMessage = 'Erro ao enviar mensagem. ';
        
        if (!navigator.onLine) {
            errorMessage += 'Você está offline.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Servidor indisponível.';
        } else {
            errorMessage += error.message;
        }
        
        showStatus(errorMessage, 'error');
    } finally {
        submitButton.innerHTML = originalButtonContent;
        submitButton.disabled = false;
    }
});

// Validação de email em tempo real
document.getElementById('email').addEventListener('blur', function() {
    if (this.value && !isValidEmail(this.value)) {
        this.style.borderColor = 'red';
    } else {
        this.style.borderColor = '';
    }
});
