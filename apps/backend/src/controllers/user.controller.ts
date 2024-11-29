import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { compare, hash } from "bcryptjs";
import { JWT_KEY } from "../utils/env";
import { GraphQLError } from "graphql";

interface UserInput {
  name: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  authority: string;
}

class UserController {
  async register(userInput: UserInput, ctx: any) {
    try {
      const { name, email, password } = userInput;
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new GraphQLError("user already exists", {
          extensions: {
            http: {
              status: 400,
            },
            code: "USER_ALREADY_EXISTS",
          },
        });
      }
      const user = new User({ name, email, password });
      await user.save();
      const token = jwt.sign({ id: user.id }, JWT_KEY, {
        expiresIn: "1d",
        subject: user.id.toString(),
      });
      ctx.request.cookieStore?.set({
        name: "token",
        sameSite: "strict",
        secure: true,
        domain: "https://ryandsilva.local",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        value: token,
        httpOnly: true,
      });
      return token;
    } catch (error: any) {
      console.log(error);
      throw new GraphQLError("error creating user", {
        extensions: {
          http: {
            status: 500,
          },
          code: "CREATE_USER_ERROR",
        },
      });
    }
  }

  async login(email: string, password: string, ctx: any) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError("user not found", {
          extensions: {
            http: {
              status: 400,
            },
            code: "USER_NOT_FOUND",
          },
        });
      }
      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        throw new GraphQLError("invalid credentials", {
          extensions: {
            http: {
              status: 401,
            },
            code: "INVALID_CREDENTIALS",
          },
        });
      }
      const token = jwt.sign({ id: user.id }, JWT_KEY, {
        expiresIn: "1d",
        subject: user.id,
      });
      ctx.request.cookieStore?.set({
        name: "token",
        sameSite: "strict",
        secure: true,
        domain: "https://ryandsilva.local",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        value: token,
        httpOnly: true,
      });
      return token;
    } catch (error: any) {
      console.log(error);
      throw new GraphQLError("error logging in user", {
        extensions: {
          http: {
            status: 500,
          },
          code: "LOGIN_ERROR",
        },
      });
    }
  }

  async updateUser(userInput: UserInput, ctx: any) {
    try {
      if (!ctx.jwt) {
        throw new GraphQLError("unauthorized", {
          extensions: {
            http: {
              status: 401,
            },
            code: "UNAUTHORIZED",
          },
        });
      }
      const { name, email, password } = userInput;
      const updatedData: any = {};
      if (name) updatedData.name = name;
      if (email) updatedData.email = email;
      if (password) updatedData.password = await hash(password, 8);
      const user = await User.findByIdAndUpdate(ctx.jwt.sub, updatedData, {
        new: true,
      });
      if (!user) {
        throw new GraphQLError("user not found", {
          extensions: {
            http: {
              status: 400,
            },
            code: "USER_NOT_FOUND",
          },
        });
      }
      return true;
    } catch (error: any) {
      console.log(error);
      throw new GraphQLError("error updating user", {
        extensions: {
          http: {
            status: 500,
          },
          code: "USER_UPDATE_ERROR",
        },
      });
    }
  }

  async deleteUser(id: string, ctx: any) {
    try {
      if (!ctx.jwt) {
        throw new GraphQLError("unauthorized", {
          extensions: {
            http: {
              status: 401,
            },
            code: "UNAUTHORIZED",
          },
        });
      }
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new GraphQLError("user not found", {
          extensions: {
            http: {
              status: 400,
            },
            code: "USER_NOT_FOUND",
          },
        });
      }
      return true;
    } catch (error: any) {
      console.log(error);
      throw new GraphQLError("error deleting user", {
        extensions: {
          http: {
            status: 500,
          },
          code: "USER_DELETE_ERROR",
        },
      });
    }
  }

  async getUser(ctx: any) {
    try {
      if (!ctx.jwt) {
        throw new GraphQLError("unauthorized", {
          extensions: {
            http: {
              status: 401,
            },
            code: "UNAUTHORIZED",
          },
        });
      }
      const user = await User.findById(ctx.jwt.sub);
      if (!user) {
        throw new GraphQLError("user not found", {
          extensions: {
            http: {
              status: 400,
            },
            code: "USER_NOT_FOUND",
          },
        });
      }
      return user as User;
    } catch (error: any) {
      console.log(error);
      throw new GraphQLError("error fetching user", {
        extensions: {
          http: {
            status: 500,
          },
          code: "USER_FETCH_ERROR",
        },
      });
    }
  }
}

const userController = new UserController();

export { User, userController };
