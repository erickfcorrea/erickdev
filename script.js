// ⚙️ CONFIGURAÇÃO DA API - URL CORRETA
const API_BASE_URL = 'https://portfolio-backend-production-8c6a.up.railway.app';

// Sistema de feedback - função corrigida
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
        console.log('📤 Enviando para:', `${API_BASE_URL}/api/feedback`);
        
        const response = await fetch(`${API_BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        // Verifica se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Resposta não é JSON:', text.substring(0, 200));
            throw new Error('Resposta do servidor não é JSON');
        }

        const result = await response.json();

        if (response.ok && result.success) {
            showStatus(result.message, 'success');
            contactForm.reset();
        } else {
            throw new Error(result.error || 'Erro ao enviar mensagem');
        }
    } catch (error) {
        console.error("❌ Erro completo:", error);
        
        let errorMessage = 'Erro ao enviar mensagem. ';
        
        if (!navigator.onLine) {
            errorMessage += 'Você está offline.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Servidor indisponível no momento.';
        } else {
            errorMessage += error.message;
        }
        
        showStatus(errorMessage, 'error');
    } finally {
        submitButton.innerHTML = originalButtonContent;
        submitButton.disabled = false;
    }
});
