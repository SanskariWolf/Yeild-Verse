import { Request, Response } from 'express';
import * as aiService from '../services/ai.service';
import { AuthRequest } from '../services/auth.service';

export const getPredictions = async (req: AuthRequest, res: Response) => {
   try {
    const userId = req.user?.address;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const predictions = await aiService.getAIPredictions(userId);
    res.json(predictions); // Removed await
  } catch(error){
    console.error('Error getting AI predictions:', error);
    res.status(500).json({ message: 'Failed to get AI predictions' }); // Removed await
  }
};