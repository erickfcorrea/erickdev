FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de dependência
COPY package.json package-lock.json ./

# Instala dependências de produção
RUN npm ci --only=production --omit=dev

# Copia o código da aplicação
COPY . .

# Expõe a porta
EXPOSE 3001

# Define a variável de ambiente
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
