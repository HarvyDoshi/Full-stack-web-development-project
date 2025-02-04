import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

// Token creation function
export const createToken = (id: string, email: string, expiresIn: string) => {
  const payload = { id, email };
  if (!JWT_SECRET) {
    throw new Error("JWT secret is not defined");
  }

  const signOptions: SignOptions = { expiresIn };
  const token = jwt.sign(payload, JWT_SECRET, signOptions);
  return token;
};

// Token verification middleware
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies[COOKIE_NAME];
  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Token Not Received" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token Expired or Invalid" });
    }
    res.locals.jwtData = decoded as JwtPayload;
    next();
  });
};

// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { COOKIE_NAME } from "./constants.js";

// export const createToken = (id: string, email: string, expiresIn: string) => {
//   const payload = { id, email };
//   const token = jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn,
//   });
//   return token;
// };

// export const verifyToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.signedCookies[`${COOKIE_NAME}`];
//   if (!token || token.trim() === "") {
//     return res.status(401).json({ message: "Token Not Received" });
//   }
//   return new Promise<void>((resolve, reject) => {
//     return jwt.verify(token, process.env.JWT_SECRET, (err, success) => {
//       if (err) {
//         reject(err.message);
//         return res.status(401).json({ message: "Token Expired" });
//       } else {
//         resolve();
//         res.locals.jwtData = success;
//         return next();
//       }
//     });
//   });
// };
//harvy
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { COOKIE_NAME } from "./constants.js";

// export const createToken = (id: string, email: string, expiresIn: string) => {
//   const payload = { id, email };
//   const token = jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn
//   });
//   return token;
// };

// export const verifyToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.signedCookies[`${COOKIE_NAME}`];
//   if (!token || token.trim() === "") {
//     return res.status(401).json({ message: "Token Not Received" });
//   }
//   return new Promise<void>((resolve, reject) => {
//     return jwt.verify(token, process.env.JWT_SECRET, (err, success) => {
//       if (err) {
//         reject(err.message);
//         return res.status(401).json({ message: "Token Expired" });
//       } else {
//         resolve();
//         res.locals.jwtData = success;
//         return next();
//       }
//     });
//   });
// };
