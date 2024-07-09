// authMiddleware.test.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { authMiddleware, authenticateJWT } from "./authMiddleware";

// Mock jwt
jest.mock("jsonwebtoken");

// Mock passport
jest.mock("passport");

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn(() => mockResponse as Response)
    };
  });

  describe("authMiddleware", () => {
    it("should return 401 if no token is provided", () => {
      mockRequest.header = jest.fn().mockReturnValue(undefined);

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "No token provided"
      });
    });

    it("should call next() if token is valid", () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer valid_token");
      (jwt.verify as jest.Mock).mockReturnValue({ userId: "123" });

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({ userId: "123" });
    });

    it("should return 401 if token is invalid", () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer invalid_token");
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid token"
      });
    });
  });

  describe("authenticateJWT", () => {
    it("should call passport.authenticate", () => {
      const mockPassportAuthenticate = jest.fn(
        (strategy, options, callback) => {
          return (req: Request, res: Response, next: NextFunction) => {
            callback(null, { id: "123" }, null);
          };
        }
      );

      (passport.authenticate as jest.Mock).mockImplementation(
        mockPassportAuthenticate
      );

      authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(passport.authenticate).toHaveBeenCalledWith(
        "jwt",
        { session: false },
        expect.any(Function)
      );
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({ id: "123" });
    });

    it("should return 500 if there is an error", () => {
      const mockPassportAuthenticate = jest.fn(
        (strategy, options, callback) => {
          return (req: Request, res: Response, next: NextFunction) => {
            callback(new Error("Internal error"), null, null);
          };
        }
      );

      (passport.authenticate as jest.Mock).mockImplementation(
        mockPassportAuthenticate
      );

      authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error"
      });
    });

    it("should return 401 if no user is found", () => {
      const mockPassportAuthenticate = jest.fn(
        (strategy, options, callback) => {
          return (req: Request, res: Response, next: NextFunction) => {
            callback(null, null, { message: "No user found" });
          };
        }
      );

      (passport.authenticate as jest.Mock).mockImplementation(
        mockPassportAuthenticate
      );

      authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  });
});
