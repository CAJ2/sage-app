FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS build
RUN corepack enable && corepack install --global pnpm@10.8.0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN pnpm add -g nx@latest
COPY package.json pnpm-*.yaml nx.json /usr/src/app/
COPY apps/api/package.json /usr/src/app/apps/api/
COPY apps/frontend/package.json /usr/src/app/apps/frontend/
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM build AS api-build
COPY apps/api /usr/src/app/apps/api
RUN nx run-many -p api -t build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=api --legacy --prod /prod/api

FROM base AS api
COPY --from=api-build /prod/api /prod/api
ENV NODE_ENV=production
WORKDIR /prod/api
EXPOSE 3000
CMD [ "node", "dist/main" ]

FROM build AS frontend-build
COPY apps/frontend /usr/src/app/apps/frontend
RUN nx run-many -p frontend -t build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=frontend --legacy --prod /prod/frontend

FROM base AS frontend
COPY --from=frontend-build /prod/frontend /prod/frontend
ENV NODE_ENV=production
WORKDIR /prod/frontend
EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
