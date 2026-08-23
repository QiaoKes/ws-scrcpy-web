FROM node:24-bookworm-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build \
    && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    android-tools-adb \
    ca-certificates \
    tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/assets/scrcpy-server ./seed/scrcpy-server/scrcpy-server
COPY docker/config.example.json ./docker-config.example.json
COPY docker/entrypoint.sh /usr/local/bin/ws-scrcpy-web-entrypoint

RUN chmod +x /usr/local/bin/ws-scrcpy-web-entrypoint

ENV DATA_ROOT=/data \
    DEPS_PATH=/data/dependencies \
    WS_SCRCPY_CONFIG=/data/config.json

VOLUME ["/data", "/root/.android"]
EXPOSE 8000

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/ws-scrcpy-web-entrypoint"]
CMD ["node", "dist/index.js"]
