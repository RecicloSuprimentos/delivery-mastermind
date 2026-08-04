# LLM Architecture Context: Delivery Mastermind

> [!IMPORTANT]
> **ATENÇÃO PARA FUTURAS IAs E DESENVOLVEDORES:** 
> Leia este documento antes de sugerir grandes mudanças arquiteturais. Ele registra decisões passadas críticas que moldaram a base de código atual.

## 1. A "Refatoração Nativa" (Business Logic no Frontend)

Você notará que lógicas complexas de negócios (como extração de janelas de tempo de strings, formatação de telefone usando Regex, cálculo de troco) estão implementadas no frontend em `src/utils/serviceProcessor.ts`. 

**Por que não usar o Banco (RPCs/Triggers) ou Edge Functions?**
- Originalmente existiam Supabase Edge Functions, mas o proprietário decidiu eliminá-las para simplificar a esteira de CI/CD e a infraestrutura ("Refatoração Nativa").
- O sistema opera no **Cenário A**: A interface Web (este código) é a **ÚNICA** responsável por *criar* serviços (via importação de JSON ou formulários). O aplicativo móvel conectado a este banco serve *apenas para consumo* (os entregadores visualizam as rotas e dão baixa).
- Portanto, **manter a lógica no frontend não é um tech debt grave neste contexto**. Não tente refatorar `serviceProcessor.ts` para Edge Functions ou Triggers no PostgreSQL a menos que o requisito mude e o app móvel passe a *criar* serviços.

## 2. Solução de CORS e o Proxy Nginx

O banco de dados é um Supabase self-hosted (`https://supabase.mgbase.com.br`).
Se o frontend tentar acessar essa API diretamente do navegador, o Kong (API Gateway) do Supabase bloqueará por CORS.

**Como resolvemos:**
- **Desenvolvimento (`vite dev`):** O arquivo `vite.config.ts` possui proxies para interceptar rotas sensíveis (`/rest`, `/auth`, `/storage`, `/realtime`) e as repassa para a VPS server-to-server.
- **Produção (Docker):** Utilizamos um `Dockerfile` multi-stage que compila o React e o joga dentro de um Nginx (`nginx.conf`). Este Nginx espelha EXATAMENTE as regras do Vite, fazendo `proxy_pass` das mesmas rotas para a VPS. 
- **O que isso significa:** Nunca use a URL absoluta do Supabase diretamente nas chamadas (fetch, Axios). O SDK do Supabase já está configurado em `client.ts` para bater em `/` (via env), delegando o roteamento cross-origin para o Proxy local ou o Nginx de produção.

## 3. Integração em Lote (Lidando com Falhas)

Em `src/components/settings/ApiIntegration.tsx`, os serviços são processados em lote.
- Utilizamos `Promise.allSettled()` porque os dados vêm de terceiros e frequentemente contêm erros. 
- Se um serviço de um lote de 100 falhar, os outros 99 DEVEM ser inseridos no Supabase. 
- Nunca substitua por uma única Promise que faça fail-fast ou por uma query SQL de bulk insert rígida (`insert([...])`), pois uma constraint violation em um único item derrubaria toda a transação no Postgres.

## 4. Variáveis de Ambiente

As variáveis críticas são mantidas no `.env`:
- `VITE_SUPABASE_URL`: Em produção local deve apontar para `/` ou `http://localhost:8080` (para usar o proxy).
- Chaves do Google Maps não estão no `.env` do front. Elas são puxadas **dinamicamente** do banco de dados (tabela `system_settings`) para segurança extra. Consulte o hook que gerencia as configurações antes de presumir que as chaves estão estáticas.
