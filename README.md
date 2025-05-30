# ernestas-dashboard

To run:

without ELK stack logging:
```docker compose up --build --watch```

with ELK stack logging:
```docker compose --profile elk -f docker-compose.yml -f docker-compose.elk.yml up --build --watch```