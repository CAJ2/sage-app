FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=api --legacy --prod /prod/api
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=frontend --legacy --prod /prod/frontend

FROM base AS api
COPY --from=build /prod/api /prod/api
WORKDIR /prod/api
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS frontend
COPY --from=build /prod/frontend /prod/frontend
WORKDIR /prod/frontend
EXPOSE 3000
CMD [ "pnpm", "start" ]
