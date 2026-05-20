# Cliente Docker 27+ compatible con el daemon del host (API 1.44+)
FROM docker:27-cli
RUN apk add --no-cache nodejs npm bash curl git procps
WORKDIR /app
COPY server.mjs .
ENV PORT=3099
EXPOSE 3099
ENTRYPOINT []
CMD ["node", "server.mjs"]
