import { makeExecutableSchema } from "@graphql-tools/schema";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import path from "path";
import { userController } from "./controllers/user.controller";

const typesArray = loadFilesSync(path.join(__dirname, "graphql"), {
  extensions: ["graphql"],
});
const typeDefs = mergeTypeDefs(typesArray);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      async me(_, __, ctx) {
        return userController.getUser(ctx);
      },
    },
    Mutation: {
      async register(_, { userInput }, ctx) {
        return userController.register(userInput, ctx);
      },
      async login(_, { email, password }, ctx) {
        return userController.login(email, password, ctx);
      },
      async updateUser(_, { userInput }, ctx) {
        return userController.updateUser(userInput, ctx);
      },
      async deleteUser(_, { id }, ctx) {
        return userController.deleteUser(id, ctx);
      },
    },
  },
});
