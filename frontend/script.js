// ✅ CONFIGURAÇÃO DA API - VARIÁVEL CORRETA
const API_BASE_URL = 'https://erickdev-production.up.railway.app';

console.log('✅ Script carregado! API_BASE_URL:', API_BASE_URL);

// Toggle mobile menu   
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
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
}

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
if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        scrollToTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
    });
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Fade in animation
const fadeElements = document.querySelectorAll('.fade-in');
if (fadeElements.length > 0) {
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
}

// ========== SISTEMA DE FEEDBACK ==========
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

function showStatus(message, type = 'success') {
    if (!formStatus) return;
    
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const bgColor = type === 'success' ? '#f0fff4' : '#fff5f5';
    const borderColor = type === 'success' ? 'green' : 'red';
    const textColor = type === 'success' ? 'green' : 'red';
    
    formStatus.innerHTML = `
        <div style="color: ${textColor}; background: ${bgColor}; padding: 12px; border-radius: 8px; border: 1px solid ${borderColor}; margin-top: 1rem;">
            <i class="fas ${iconClass}"></i> ${message}
        </div>
    `;
    
    if (type === 'success') {
        setTimeout(() => {
            if (formStatus) formStatus.innerHTML = '';
        }, 5000);
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ VERIFICA CONEXÃO COM BACKEND
if (contactForm) {
    console.log('🔍 Testando conexão com backend...');
    
    fetch(`${API_BASE_URL}/api/db-status`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Backend status:', data);
        })
        .catch(error => {
            console.error('❌ Erro no backend:', error);
        });

    // ✅ FORMULÁRIO CORRETO
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

        try {
            console.log('📤 Enviando para:', `${API_BASE_URL}/api/feedback`);
            
            const response = await fetch(`${API_BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('📨 Status da resposta:', response.status);
            
            const result = await response.json();
            console.log('📨 Resposta completa:', result);

            if (response.ok && result.success) {
                showStatus('✅ ' + result.message, 'success');
                contactForm.reset();
            } else {
                throw new Error(result.error || 'Erro ao enviar mensagem');
            }

        } catch (error) {
            console.error('❌ Erro no envio:', error);
            showStatus('❌ Erro ao enviar mensagem: ' + error.message, 'error');
        } finally {
            submitButton.innerHTML = originalButtonContent;
            submitButton.disabled = false;
        }
    });

    // Validação de email em tempo real
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.style.borderColor = 'red';
            } else {
                this.style.borderColor = '';
            }
        });
    }
}

console.log('🎯 Sistema de feedback carregado e pronto!');
