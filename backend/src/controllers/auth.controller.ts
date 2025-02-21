import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const authenticate = async (req: Request, res: Response) => {
  try {
    const { message, signature, address } = req.body;

    if (!message || !signature || !address) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const isValidSignature = authService.verifySignature(message, signature, address);
    if (!isValidSignature) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const token = authService.generateToken(address);
    res.status(200).json({ token }); // Removed await
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: 'Authentication failed' }); // Removed await
  }
};