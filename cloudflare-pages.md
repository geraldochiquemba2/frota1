# Guia de Deploy para Cloudflare Workers + Pages

Este documento explica como fazer o deploy da aplicação FleetTrack no Cloudflare.

## Arquitetura

- **Backend**: Cloudflare Workers (API em `/workers`)
- **Frontend**: Cloudflare Pages (React/Vite em `/client`)
- **Base de Dados**: Neon PostgreSQL (compatível com Workers)

## Pré-requisitos

1. Conta no Cloudflare (https://cloudflare.com)
2. Wrangler CLI instalado: `npm install -g wrangler`
3. Base de dados Neon PostgreSQL (https://neon.tech)

## Passo 1: Configurar Secrets no Workers

```bash
cd workers

# Fazer login no Cloudflare
wrangler login

# Configurar o DATABASE_URL (string de conexão do Neon)
wrangler secret put DATABASE_URL

# Configurar o JWT_SECRET (gere uma string aleatória segura)
wrangler secret put JWT_SECRET
```

## Passo 2: Deploy do Backend (Workers)

```bash
cd workers

# Instalar dependências
npm install

# Deploy para produção
npm run deploy
```

Após o deploy, você receberá uma URL como:
`https://fleettrack-api.<seu-username>.workers.dev`

## Passo 3: Configurar o Frontend

Atualize o arquivo `.env` do frontend com a URL do Workers:

```env
VITE_API_URL=https://fleettrack-api.<seu-username>.workers.dev
```

## Passo 4: Deploy do Frontend (Cloudflare Pages)

### Opção A: Via Dashboard do Cloudflare

1. Acesse https://pages.cloudflare.com
2. Clique em "Create a project"
3. Conecte seu repositório Git
4. Configure:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `client`
5. Adicione a variável de ambiente:
   - `VITE_API_URL` = URL do seu Worker

### Opção B: Via Wrangler CLI

```bash
cd client

# Build do frontend
npm run build

# Deploy para Cloudflare Pages
wrangler pages deploy dist --project-name=fleettrack
```

## Passo 5: Configurar Domínio Personalizado (Opcional)

1. No dashboard do Cloudflare Pages, vá em "Custom domains"
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruído

## Estrutura de URLs

- **Frontend**: `https://fleettrack.pages.dev` ou seu domínio personalizado
- **API**: `https://fleettrack-api.<username>.workers.dev`

## Variáveis de Ambiente

### Workers (Secrets)
- `DATABASE_URL`: String de conexão do Neon PostgreSQL
- `JWT_SECRET`: Chave secreta para assinar tokens JWT

### Frontend (Build-time)
- `VITE_API_URL`: URL completa do Workers API

## Comandos Úteis

```bash
# Ver logs do Worker em tempo real
cd workers && wrangler tail

# Desenvolvimento local do Worker
cd workers && wrangler dev

# Build do frontend para produção
cd client && npm run build
```

## Notas Importantes

1. **HTTPS Automático**: Tanto Workers quanto Pages têm HTTPS automático, o GPS funcionará em dispositivos móveis.

2. **CORS**: O backend já está configurado para aceitar requisições de qualquer origem.

3. **Autenticação**: A aplicação usa JWT (JSON Web Tokens) em vez de sessões, compatível com a arquitetura serverless.

4. **Base de Dados**: Use o driver HTTP do Neon (`@neondatabase/serverless`) que é compatível com Workers.

## Troubleshooting

### Erro de CORS
Verifique se a URL do frontend está correta nas configurações de CORS do Worker.

### Erro de Banco de Dados
Certifique-se de que o `DATABASE_URL` está configurado corretamente como secret.

### Token Expirado
Os tokens JWT expiram em 24 horas. O frontend remove automaticamente tokens inválidos.
