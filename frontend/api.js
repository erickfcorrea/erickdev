// api.js
const API_URL = "https://erickdev-production.up.railway.app";

// Enviar feedback
export async function enviarFeedback(nome, email, mensagem) {
    try {
        const response = await fetch(`${API_URL}/api/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                mensagem: mensagem
            })
        });
        
        return await response.json();
    } catch (error) {
        return { success: false, error: "Erro de conexão" };
    }
}

// Verificar status da API
export async function verificarStatus() {
    try {
        const response = await fetch(`${API_URL}/`);
        return await response.json();
    } catch (error) {
        return { status: "offline" };
    }
}
