FROM node:20-alpine

WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:4000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json yarn.lock tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN yarn install --frozen-lockfile --network-timeout 600000

COPY packages ./packages
COPY apps/web ./apps/web

RUN yarn workspace @task-app/shared build
RUN yarn workspace @task-app/web build

EXPOSE 5173

CMD ["yarn", "workspace", "@task-app/web", "preview", "--host", "0.0.0.0", "--port", "5173"]
