// Configuração da API
const API_CONFIG = {
    baseURL: 'https://seu-app.up.railway.app', // URL que o Railway te deu
    endpoints: {
        feedback: '/api/feedback',
        dbStatus: '/api/db-status'
    }
};

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

// Check for saved theme preference or default to light
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

// Smooth scrolling for anchor links
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
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'flex';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Fade in animation on scroll
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = 1;
            element.style.transform = 'translateY(0)';
        }
    });
};

// Set initial state for fade elements
fadeElements.forEach(element => {
    element.style.opacity = 0;
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
});

window.addEventListener('scroll', fadeInOnScroll);
window.addEventListener('load', fadeInOnScroll);

// Active navigation link highlighting
const sections = document.querySelectorAll('section');
const navLinksElements = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

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

// Auto-hide header on scroll
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

// Scroll indicator click
document.querySelector('.scroll-indicator').addEventListener('click', () => {
    document.querySelector('#about').scrollIntoView({
        behavior: 'smooth'
    });
});

// ========== SISTEMA DE FEEDBACK MELHORADO ==========

// Verifica conexão com o backend ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.dbStatus}`);
        const data = await response.json();
        
        if (data.database === "connected") {
            console.log("✅ Backend conectado e funcionando!");
        } else {
            console.warn("⚠️ Backend online mas banco de dados desconectado");
        }
    } catch (error) {
        console.error("❌ Backend não está acessível:", error);
        console.log("💡 Certifique-se de que o servidor está rodando");
    }
});

// Form submission melhorado
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

// Função para mostrar mensagem de status
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
    
    // Remove a mensagem após 5 segundos para mensagens de sucesso
    if (type === 'success') {
        setTimeout(() => {
            formStatus.innerHTML = '';
        }, 5000);
    }
}

// Função para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Submissão do formulário
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("📄 Enviando formulário...");

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonContent = submitButton.innerHTML;

    // Coleta os dados do formulário
    const formData = {
        nome: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        mensagem: `Assunto: ${document.getElementById('subject').value.trim()}\n\nMensagem: ${document.getElementById('message').value.trim()}`
    };

    // Validação no frontend
    if (!formData.nome || !formData.email || !formData.mensagem) {
        showStatus('Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (!isValidEmail(formData.email)) {
        showStatus('Por favor, insira um email válido.', 'error');
        return;
    }

    if (formData.mensagem.length > 5000) {
        showStatus('A mensagem é muito longa. Máximo de 5000 caracteres.', 'error');
        return;
    }

    // Desabilita o botão e mostra loading
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitButton.disabled = true;
    formStatus.innerHTML = '';

    try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.feedback}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log("✅ Feedback enviado com sucesso!");
            showStatus(result.message, 'success');
            contactForm.reset();
        } else {
            throw new Error(result.error || 'Erro ao enviar mensagem');
        }
    } catch (error) {
        console.error("❌ Erro ao enviar feedback:", error);
        
        // Mensagem de erro amigável
        let errorMessage = 'Erro ao enviar mensagem. ';
        
        if (!navigator.onLine) {
            errorMessage += 'Você está offline. Verifique sua conexão.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Servidor indisponível. Tente novamente mais tarde.';
        } else {
            errorMessage += error.message;
        }
        
        showStatus(errorMessage, 'error');
    } finally {
        // Restaura o botão
        submitButton.innerHTML = originalButtonContent;
        submitButton.disabled = false;
    }
});

// Adiciona validação em tempo real
document.getElementById('email').addEventListener('blur', function() {
    if (this.value && !isValidEmail(this.value)) {
        this.style.borderColor = 'red';
        this.setCustomValidity('Email inválido');
    } else {
        this.style.borderColor = '';
        this.setCustomValidity('');
    }
});

// Contador de caracteres para mensagem
const messageField = document.getElementById('message');
const maxChars = 5000;

messageField.addEventListener('input', function() {
    const remaining = maxChars - this.value.length;
    
    // Cria ou atualiza contador
    let counter = document.getElementById('charCounter');
    if (!counter) {
        counter = document.createElement('small');
        counter.id = 'charCounter';
        counter.style.color = 'var(--text-light)';
        this.parentElement.appendChild(counter);
    }
    
    if (remaining < 100) {
        counter.textContent = `${remaining} caracteres restantes`;
        counter.style.color = remaining < 0 ? 'red' : 'orange';
    } else {
        counter.textContent = '';
    }
});