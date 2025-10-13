import express from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configuração do PostgreSQL com variáveis de ambiente
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Configurações importantes para produção
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20, // máximo de conexões no pool
});

// Configuração CORS dinâmica
const corsOptions = {
    origin: function (origin, callback) {
        // Permite requisições sem origin (ex: Postman, aplicações móveis)
        if (!origin) return callback(null, true);
        
        // Em desenvolvimento, aceita qualquer origem
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // Em produção, verifica a lista de origens permitidas
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim())
            : [];
            
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`⚠️ CORS bloqueou origem: ${origin}`);
            callback(null, false); // Bloqueia mas não gera erro
        }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de log
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log(`🌐 Origin: ${req.headers.origin || 'No origin'}`);
    next();
});

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Portfolio Backend API",
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Teste de conexão com banco de dados
app.get("/api/db-status", async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            database: "connected",
            timestamp: result.rows[0].now
        });
    } catch (error) {
        console.error("❌ Erro ao conectar no banco:", error);
        res.status(500).json({
            database: "disconnected",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
        });
    }
});

// Rota para receber feedback
app.post("/api/feedback", async (req, res) => {
    try {
        console.log("🎯 Feedback recebido!");
        console.log("📦 Body:", req.body);
        
        const { nome, email, mensagem } = req.body;

        // Validação básica
        if (!nome || !email || !mensagem) {
            return res.status(400).json({ 
                success: false,
                error: "Todos os campos são obrigatórios." 
            });
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                error: "Email inválido." 
            });
        }

        // Limita o tamanho da mensagem
        if (mensagem.length > 5000) {
            return res.status(400).json({ 
                success: false,
                error: "Mensagem muito longa (máximo 5000 caracteres)." 
            });
        }

        // Salva no banco
        const result = await pool.query(
            "INSERT INTO feedback (nome, email, mensagem) VALUES ($1, $2, $3) RETURNING id, criado_em",
            [nome.trim(), email.toLowerCase().trim(), mensagem.trim()]
        );

        console.log("✅ Feedback salvo:", result.rows[0]);
        
        res.json({ 
            success: true, 
            message: "Mensagem enviada com sucesso! Obrigado pelo seu feedback.",
            id: result.rows[0].id
        });
        
    } catch (error) {
        console.error("❌ Erro ao salvar feedback:", error);
        
        // Envia erro genérico em produção para não expor detalhes
        res.status(500).json({ 
            success: false,
            error: process.env.NODE_ENV === 'development' 
                ? error.message 
                : "Erro ao processar sua mensagem. Tente novamente mais tarde."
        });
    }
});

// Rota para listar feedbacks (protegida - adicione autenticação em produção!)
app.get("/api/feedbacks", async (req, res) => {
    try {
        // ⚠️ IMPORTANTE: Adicione autenticação antes de usar em produção!
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ 
                error: "Acesso negado. Esta rota requer autenticação." 
            });
        }

        const result = await pool.query(
            "SELECT id, nome, email, LEFT(mensagem, 100) as preview, criado_em FROM feedback ORDER BY criado_em DESC LIMIT 50"
        );
        
        res.json({
            success: true,
            count: result.rows.length,
            feedbacks: result.rows
        });
    } catch (error) {
        console.error("❌ Erro ao buscar feedbacks:", error);
        res.status(500).json({ 
            success: false,
            error: "Erro ao buscar feedbacks"
        });
    }
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        error: "Rota não encontrada",
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Erro não tratado:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Erro interno do servidor'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 SIGTERM recebido. Fechando conexões...');
    pool.end(() => {
        console.log('✅ Pool de conexões fechado');
        process.exit(0);
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`
    🚀 Servidor rodando!
    📍 Porta: ${port}
    🌍 Ambiente: ${process.env.NODE_ENV || 'development'}
    🔗 URL: http://localhost:${port}
    📊 Status do banco: http://localhost:${port}/api/db-status
    `);
});