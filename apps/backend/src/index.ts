import express from "express";
import { createYoga, useReadinessCheck } from "graphql-yoga";
import { useCSRFPrevention } from "@graphql-yoga/plugin-csrf-prevention";
import { useCookies } from "@whatwg-node/server-plugin-cookies";
import { useJWT } from "@graphql-yoga/plugin-jwt";
import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";
import { useResponseCache } from "@graphql-yoga/plugin-response-cache";
import { schema } from "./schema";
import { NODE_ENV, PORT, JWT_KEY } from "./utils/env";
import { redisCache } from "./utils/redis";
import { connectDB } from "./utils/database";

const app = express();

const yoga = createYoga({
  schema,
  graphiql: NODE_ENV == "development" ? true : false,
  logging: NODE_ENV == "development" ? "debug" : "info",
  healthCheckEndpoint: "/health",
  batching: {
    limit: 5,
  },
  cors: {
    origin: "*",
    credentials: true,
    allowedHeaders: ["Authorization"],
    methods: ["POST"],
  },
  plugins: [
    NODE_ENV == "development"
      ? {}
      : useCSRFPrevention({
          requestHeaders: ["x-graphql-yoga-csrf"],
        }),
    useResponseCache({
      session: (request) => request.headers.get("Authorization"),
      cache: redisCache,
    }),
    useReadinessCheck({
      endpoint: "/ready",
      check: async () => {
        try {
          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      },
    }),
    useCookies(),
    useJWT({
      issuer: `https://ryandsilva.local`,
      signingKey: JWT_KEY,
      getToken: ({ request }) =>
        request.headers?.get("Authorization") || undefined,
    }),
    NODE_ENV == "development" ? {} : EnvelopArmorPlugin(),
  ],
});

app.use("/api", yoga);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.info(`Server is running on http://ryandsilva.local/api/graphql`);
  });
});
