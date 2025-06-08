FROM node:24-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

COPY src ./src

EXPOSE 4000 9229

ENV NODE_ENV=development

CMD ["pnpm", "debug"]
