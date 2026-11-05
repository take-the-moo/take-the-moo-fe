# EC2 배포용 이미지. BE 저장소의 compose.prod.yml이 빌드하고, Caddy가 /api 밖의 요청을 여기(3000)로 보낸다
# NEXT_PUBLIC_* 값은 빌드할 때 번들에 들어간다 — 바꾸면 다시 빌드한다
FROM node:24-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_USE_MOCK=false
ARG NEXT_PUBLIC_DEMO_STAMP_AT_PLACE=false
ARG NEXT_PUBLIC_NAVER_MAP_KEY_ID=
# 같은 도메인의 /api는 Caddy가 백엔드로 바로 보낸다. 이 값은 Next 서버를 거치는 경우를 위한 것
ARG API_PROXY_TARGET=http://api:8080
ENV NEXT_PUBLIC_USE_MOCK=$NEXT_PUBLIC_USE_MOCK \
    NEXT_PUBLIC_DEMO_STAMP_AT_PLACE=$NEXT_PUBLIC_DEMO_STAMP_AT_PLACE \
    NEXT_PUBLIC_NAVER_MAP_KEY_ID=$NEXT_PUBLIC_NAVER_MAP_KEY_ID \
    API_PROXY_TARGET=$API_PROXY_TARGET \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=1536
RUN pnpm build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 API_PROXY_TARGET=http://api:8080
COPY --from=build /app ./
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
