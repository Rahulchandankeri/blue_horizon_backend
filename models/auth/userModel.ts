import { Model, Schema, model } from 'mongoose';
const { isEmail } = require('validator');
export interface IUser extends Document {
  _id: any;
  user_id: number;
  email_id: string;
  role: 'user' | 'admin' | 'super_admin';
  account_created_on: Date;
  otp: number;
}

const userSchema: Schema<IUser> = new Schema(
  {
    user_id: {
      type: Number,
      required: true,
      unique: true,
      immutable: true,
    },
    email_id: {
      type: String,
      require: true,
      unique: true,
      validate: [isEmail, 'Enter valid email'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      required: true,
      default: 'user',
    },
    account_created_on: {
      type: Date,
      required: true,
      default: Date.now,
    },
    otp: {
      type: Number,
    },
  },
  { timestamps: true }
);

// TTL index for otp field to expire after 5 minutes
userSchema.index({ otp: 1 }, { expireAfterSeconds: 300 });

const User: Model<IUser> = model<IUser>('User', userSchema);
export default User;
