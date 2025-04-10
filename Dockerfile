FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY package.json pnpm-*.yaml /usr/src/app/
COPY apps/api/package.json /usr/src/app/apps/api/
COPY apps/frontend/package.json /usr/src/app/apps/frontend/
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . /usr/src/app/
RUN pnpm run -r build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=api --legacy --prod /prod/api
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=frontend --legacy --prod /prod/frontend

FROM base AS api
COPY --from=build /prod/api /prod/api
ENV NODE_ENV=production
WORKDIR /prod/api
EXPOSE 3000
CMD [ "sleep", "infinity" ]

FROM base AS frontend
COPY --from=build /prod/frontend /prod/frontend
ENV NODE_ENV=production
WORKDIR /prod/frontend
EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
