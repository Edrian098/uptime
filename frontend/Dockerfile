FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --prefer-offline --no-audit || npm ci

COPY . .
RUN npm run build || echo "No build script defined"

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm install --prefer-offline --no-audit --omit=dev || npm ci --omit=dev

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
