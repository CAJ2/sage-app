FROM node:25-slim AS base
ARG APP_VERSION
ARG APP_SHA
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS build
RUN npm install -g pnpm@latest-10
RUN pnpm add -g nx@latest
COPY package.json pnpm-*.yaml nx.json /usr/src/app/
COPY patches /usr/src/app/patches/
COPY apps/api/package.json /usr/src/app/apps/api/
COPY apps/frontend/package.json /usr/src/app/apps/frontend/
COPY apps/science/package.json /usr/src/app/apps/science/
COPY packages/ui/package.json /usr/src/app/packages/ui/
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM build AS api-build
COPY apps/api /usr/src/app/apps/api
RUN nx run-many -p api -t build
# NOTE(CAJ2): We use --legacy here because pnpm patches don't work with a frozen lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --legacy --filter=...api --prod /prod/api

FROM base AS api
COPY --from=api-build /prod/api /prod/api
ENV NODE_ENV=production
ENV APP_VERSION=$APP_VERSION
ENV APP_SHA=$APP_SHA
WORKDIR /prod/api
EXPOSE 4444
CMD [ "node", "dist/main" ]

FROM build AS frontend-build
COPY apps/frontend /usr/src/app/apps/frontend
COPY packages/ui /usr/src/app/packages/ui/
COPY apps/api/schema/schema.gql /usr/src/app/apps/api/schema/
RUN pnpm --filter=@sageleaf/frontend exec nuxi prepare
RUN nx run-many -p frontend -t build

FROM build AS science-build
COPY apps/science /usr/src/app/apps/science
COPY packages/ui /usr/src/app/packages/ui/
COPY apps/api/schema/schema.gql /usr/src/app/apps/api/schema/
RUN pnpm --filter=@sageleaf/science exec nuxi prepare
RUN nx run-many -p science -t build

FROM base AS web
COPY --from=frontend-build /usr/src/app/apps/frontend/.output /prod/frontend/.output
COPY --from=science-build /usr/src/app/apps/science/.output /prod/science/.output
ENV NODE_ENV=production
ENV APP_VERSION=$APP_VERSION
ENV APP_SHA=$APP_SHA
RUN printf '#!/bin/sh\nexec node /prod/${APP}/.output/server/index.mjs\n' > /start.sh \
    && chmod +x /start.sh
EXPOSE 3000
CMD ["/start.sh"]
