import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../services/auth.service'; // Import AuthRequest

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }
  const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
  try {
    const decoded = jwt.verify(token, secret) as { address: string };
    req.user = { address: decoded.address }; // Attach user information to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
