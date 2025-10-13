FROM node:18-alpine

WORKDIR /app

# Copia package.json primeiro para cache de dependências
COPY package*.json ./

RUN npm ci --only=production

# Copia o resto do código
COPY . .

EXPOSE 3000

CMD ["npm", "start"]