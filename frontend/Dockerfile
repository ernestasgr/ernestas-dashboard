FROM node:23-slim

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm i -g pnpm

# Copy lockfiles and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Enable file watching for Next.js inside Docker
ENV WATCHPACK_POLLING=true

EXPOSE 3000

CMD ["pnpm", "dev"]
