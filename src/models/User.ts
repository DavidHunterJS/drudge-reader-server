import fs from "fs";
import path from "path";
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as yup from "yup";

const IMAGES_FOLDER_PATH = path.join("public/images/");

export interface UserDocument extends Document {
  provider: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  bio?: string;
  googleId?: string;
  facebookId?: string;
  messages: mongoose.Types.ObjectId[];
  resetToken?: string;
  resetTokenExpiration?: Date;
  createdAt: Date;
  updatedAt: Date;
  toJSON(): () => string;
  generateJWT(): string;
  registerUser(
    newUser: UserDocument,
    callback: (err?: Error | null) => void
  ): void;
  comparePassword(
    candidatePassword: string,
    callback: (err: Error | null, isMatch: boolean) => void
  ): void;
}
const isValidUrl = (str: string) => {
  var urlRegex =
    "^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$";
  var url = new RegExp(urlRegex, "i");
  return str.length < 2083 && url.test(str);
};
const userSchemaYup = yup.object().shape({
  avatar: yup.mixed().optional(),
  firstname: yup.string().min(2).max(20),
  lastname: yup.string().min(2).max(20),
  username: yup
    .string()
    .min(2)
    .max(20)
    .matches(/^[a-zA-Z0-9_]+$/, {
      message: "is invalid",
      excludeEmptyString: true
    })
    .required(),
  password: yup.string().min(6).max(20).required()
});

export const userSchema = new Schema<UserDocument>(
  {
    provider: {
      type: String,
      required: true
    },
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9_]+$/, "is invalid"],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true
    },
    password: {
      type: String,
      trim: true,
      minlength: 6,
      maxlength: 60
    },
    firstName: {
      type: String,
      minlength: 3,
      maxlength: 20
    },
    lastName: {
      type: String,
      minlength: 3,
      maxlength: 20
    },
    avatar: String,
    bio: String,
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER"
    },
    resetToken: String,
    resetTokenExpiration: Date,
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const AFP = process.cwd();
  const absoluteAvatarFilePath = `${AFP}/${IMAGES_FOLDER_PATH}${this.avatar}`;
  const avatar = isValidUrl(this.avatar || "")
    ? this.avatar || ""
    : fs.existsSync(absoluteAvatarFilePath)
    ? `${AFP}/${IMAGES_FOLDER_PATH}${this.avatar || ""}`
    : `${AFP}/${IMAGES_FOLDER_PATH}avatar2.jpg`;

  return {
    id: this._id,
    provider: this.provider,
    firstName: this.firstName,
    lastName: this.lastName,
    username: this.username,
    email: this.email,
    avatar: avatar,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const secretOrKey =
  process.env.NODE_ENV === "production"
    ? process.env.JWT_SECRET_PROD || "default_prod_secret"
    : process.env.JWT_SECRET_DEV || "default_dev_secret";

userSchema.methods.generateJWT = function () {
  const token = jwt.sign(
    {
      expiresIn: "12h",
      id: this._id,
      provider: this.provider,
      email: this.email
    },
    secretOrKey
  );
  return token;
};

userSchema.methods.registerUser = function (
  newUser: UserDocument,
  callback: (err?: Error | null) => void
) {
  bcrypt.genSalt(10, (err: Error | null, salt: string) => {
    bcrypt.hash(newUser.password, salt, (err: Error | null, hash: string) => {
      if (err) {
        console.log(err);
        callback(err);
        return;
      }
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

userSchema.methods.comparePassword = function (
  candidatePassword: string,
  callback: (err: Error | null, isMatch: boolean) => void
) {
  bcrypt.compare(
    candidatePassword,
    this.password,
    (err: Error | null, isMatch: boolean) => {
      if (err) return callback(err, false);
      callback(null, isMatch);
    }
  );
};

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export const validateUser = async (user: any) => {
  try {
    await userSchemaYup.validate(user, { strict: true, abortEarly: false });
    return null; // Return null if validation passes
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      return { error: err }; // Return an error object with the validation error
    } else {
      throw err; // Throw other errors
    }
  }
};

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
