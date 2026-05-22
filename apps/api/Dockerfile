FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json yarn.lock tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN yarn install --frozen-lockfile --network-timeout 600000

COPY packages ./packages
COPY apps/api ./apps/api

RUN yarn workspace @task-app/shared build
ENV DATABASE_URL=mysql://task_user:task_password@mysql:3306/task_management
ENV SHADOW_DATABASE_URL=mysql://task_user:task_password@mysql:3306/task_management_shadow
RUN yarn workspace @task-app/api prisma:generate
RUN yarn workspace @task-app/api build

EXPOSE 4000

CMD ["sh", "-c", "yarn workspace @task-app/api prisma:migrate:deploy && yarn workspace @task-app/api start"]
