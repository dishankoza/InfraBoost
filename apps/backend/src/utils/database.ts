import { connect } from "mongoose";
import { MONGO_URL } from "./env";

const connectDB = async () => {
  try {
    const conn = await connect(MONGO_URL, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export { connectDB };
