import "dotenv/config";

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT: number = parseInt(process.env.PORT || "4000");
export const HOST: string = process.env.HOST || "localhost";
export const REDIS_URL = process.env.REDIS || "redis://redis:6379";
export const MONGO_URL = process.env.MONGO || "mongodb://mongo:27017/quikcloud";
export const JWT_KEY = process.env.JWT_SECRET || "test_key";
