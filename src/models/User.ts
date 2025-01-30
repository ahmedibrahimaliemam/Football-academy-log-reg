import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

// Define the User interface with comparePassword
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "player" | "coach";
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create the Mongoose Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "player", "coach"], required: true },
  },
  { timestamps: true }
);

// **Hash password before saving**
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// **Define comparePassword method**
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// **Export User model**
export const User = mongoose.model<IUser>("User", UserSchema);
