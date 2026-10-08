# Mega Capacetes — loja + painel + PIX (independente)

## O que tem na pasta
- src/routes/index.tsx ............ página inicial (VSL + loja)
- src/routes/produto/ ............. páginas de cada capacete
- src/routes/colecao/ ............. coleções por marca
- src/routes/checkout.tsx ......... checkout
- src/routes/pagamento.tsx ........ página do PIX (QR Code, garantia, feedbacks)
- src/routes/acompanhar-pedido.tsx  rastreio
- src/routes/_authenticated/ ...... painel ADM (dashboard, funis, lucro/prejuízo)
- src/routes/api/public/ .......... APIs (ingest, webhooks, comprovantes)
- src/lib/mega-pix.functions.ts ... API PIX BravoPay
- src/lib/mega-store.ts ........... produtos e preços
- public/img/ ..................... todas as fotos
- banco/criar-banco.sql ........... cria o banco de dados

## Passo a passo
1. Crie conta grátis em supabase.com > New project.
2. No Supabase, abra "SQL Editor", cole o arquivo banco/criar-banco.sql e clique RUN.
3. Em Project Settings > API copie: URL, publishable key e service_role key.
4. Suba esta pasta inteira num repositório do GitHub.
5. Na Vercel: Add New Project > escolha o repositório > em Environment Variables
   preencha todas as chaves do arquivo .env.example > Deploy.
6. Abra seusite.vercel.app/auth e crie sua conta: a primeira conta vira ADM.
