import { model, Schema, Document } from "mongoose";

interface IConfig extends Document {
  regions: [string];
}

const configSchema: Schema<IConfig> = new Schema({
  regions: {
    type: [String],
    required: true,
  },
});

export const Config = model<IConfig>("Config", configSchema);
