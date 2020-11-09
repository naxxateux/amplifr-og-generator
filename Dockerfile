FROM node:14.14.0-alpine AS builder
LABEL maintainer="gfrntz@evilmartians.com"

ADD . /app
WORKDIR /app

RUN apk -U upgrade && apk add git curl && npm install

FROM node:14.14.0-alpine
LABEL maintainer="gfrntz@evilmartians.com"

COPY --from=builder /app/node_modules /app/node_modules
ADD --chown=nobody:nogroup . /app

RUN sed -i -e '/nobody/s#/#/app#' /etc/passwd
USER nobody

WORKDIR /app

CMD ["node", "server"]
