FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN yarn install --frozen-lockfile
RUN yarn workspace @task-app/shared build
RUN yarn workspace @task-app/api build
RUN yarn workspace @task-app/api prisma:generate

EXPOSE 4000

CMD ["sh", "-c", "yarn workspace @task-app/api prisma:migrate:deploy && yarn workspace @task-app/api start"]
