import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

// Create token function
export const createToken = (id: string, email: string, expiresIn: string) => {
  const payload = { id, email };
  const secretKey = process.env.JWT_SECRET || "defaultSecret";
  return jwt.sign(payload, secretKey, { expiresIn });
};

// Middleware to verify token
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies[COOKIE_NAME];

  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Token Not Received" });
  }

  const secretKey = process.env.JWT_SECRET || "defaultSecret";

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token Expired or Invalid" });
    }

    res.locals.jwtData = decoded;
    next();
  });
};

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
