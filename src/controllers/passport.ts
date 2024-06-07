import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import User from "../models/User"; // Assuming you have a User model

// Define the types for the 'done' function
type Done = (error: any, user?: any, info?: any) => void;
// Define the type for the JWT payload
interface JwtPayload {
  userId: string;
  // Add other properties if needed
}

// Local strategy for username/password authentication
passport.use(
  new LocalStrategy(async (username: string, password: string, done: Done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Invalid username or password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// JWT strategy for token-based authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET // Make sure to define JWT_SECRET in your environment variables
    },
    async (payload: JwtPayload, done: Done) => {
      try {
        const user = await User.findById(payload.userId);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
