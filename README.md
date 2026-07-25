# NexFiscal

Frontend do NexFiscal — gestão de propostas comerciais e notas fiscais de serviço (NFS-e).

## Desenvolvimento

```sh
npm install
cp .env.example .env
npm run dev
```

O front consome a API em `http://localhost:8085/api` (configurável via `VITE_API_URL`). **Todos os dados** (propostas, notas, prestador) vêm do backend — a API precisa estar rodando para usar o app.

### API local

O backend fica em [`nexfiscal-api`](../nexfiscal-api). Para subir PostgreSQL + API:

```sh
cd ../nexfiscal-api
docker compose up -d postgres
./mvnw spring-boot:run
```

Credenciais padrão: `admin@nexfiscal.local` / `admin123`

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Stack

- TanStack Start / Router / Query
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
