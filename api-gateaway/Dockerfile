FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install --production

COPY src src
COPY tsconfig.json .
COPY prisma prisma

RUN bunx prisma generate

RUN bunx prisma migrate deploy

RUN bun build

CMD ["bun", "start"]

EXPOSE 3000
