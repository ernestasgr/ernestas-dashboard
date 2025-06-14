# ernestas-dashboard

To run:

without ELK stack logging:
`docker compose up --build --watch`

with ELK stack logging:
`docker compose --profile elk -f docker-compose.yml -f docker-compose.elk.yml up --build --watch`

tests:
frontend: `cd frontend && pnpm test`
e2e: `cd frontend && pnpm test:e2e`
gateway: `cd gateway && pnpm test`
auth: `cd backend/auth && ./mvnw test`
