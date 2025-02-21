// src/services/auth.service.ts
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { Request } from 'express'; // Import Request


export const verifySignature = (message: string, signature: string, address: string): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

export const generateToken = (address: string): string => {
  const payload = { address };
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      throw new Error("JWT_SECRET is not defined");
  }
  const token = jwt.sign(payload, secret, { expiresIn: '1h' }); // Token expires in 1 hour
  return token;
};


export interface AuthRequest extends Request {
    user?: { address: string }; // Add user property to Request
}