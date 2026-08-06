# =========================================================================
# [LLM CONTEXT] DOCKERFILE PARA PRODUÇÃO (MULTI-STAGE BUILD)
# Stage 1: Usa o Node.js para compilar o React via Vite (gera arquivos estáticos)
# Stage 2: Usa o Nginx para servir os arquivos estáticos e atuar como Proxy Reverso
# =========================================================================

# --- STAGE 1: Build ---
FROM node:18-alpine AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência primeiro para aproveitar cache do Docker
COPY package.json package-lock.json ./

# Instala dependências
RUN npm ci

# Copia todo o restante do código
COPY . .

# Variáveis de build injetadas pelo GitHub Actions (embutidas no bundle React)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

# Faz o build de produção
RUN npm run build

# --- STAGE 2: Serve ---
FROM nginx:alpine

# Remove configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copia nossa configuração de proxy com bypass de CORS como um template
# O Nginx automaticamente rodará envsubst neste arquivo e o salvará em conf.d
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copia os arquivos estáticos gerados no Stage 1 para a pasta que o Nginx expõe
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80 do container
EXPOSE 80

# Inicia o Nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
