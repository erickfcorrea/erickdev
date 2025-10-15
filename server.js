const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS CORRIGIDO - Permite todas as origens
app.use(cors({
    origin: true, // Permite qualquer origem
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight
app.options('*', cors());

app.use(express.json());

// Configuração do PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Portfolio - Online!',
        timestamp: new Date().toISOString()
    });
});

// Status do banco
app.get('/api/db-status', async (req, res) => {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        
        res.json({ 
            database: "connected",
            message: "Banco de dados conectado com sucesso!"
        });
    } catch (error) {
        console.error('❌ Erro no banco:', error);
        res.status(500).json({ 
            database: "disconnected",
            error: error.message
        });
    }
});

// Endpoint de feedback
app.post('/api/feedback', async (req, res) => {
    console.log('📥 Feedback recebido:', req.body);
    
    try {
        const { nome, email, mensagem } = req.body;

        // Validação
        if (!nome || !email || !mensagem) {
            return res.status(400).json({
                success: false,
                error: 'Todos os campos são obrigatórios'
            });
        }

        // Query simplificada
        const query = `
            INSERT INTO feedback (nome, email, mensagem) 
            VALUES ($1, $2, $3)
        `;

        const values = [nome, email, mensagem];
        await pool.query(query, values);

        console.log('✅ Feedback salvo com sucesso');
        
        res.json({
            success: true,
            message: 'Mensagem enviada com sucesso! Obrigado pelo seu feedback.'
        });

    } catch (error) {
        console.error('❌ Erro ao salvar feedback:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao processar sua mensagem. Tente novamente mais tarde.'
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌐 CORS configurado para todas as origens`);
});
