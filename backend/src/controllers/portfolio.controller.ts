import { Request, Response } from 'express';
import * as portfolioService from '../services/portfolio.service';
import { AuthRequest } from '../services/auth.service';
import { Portfolio } from '../models/portfolio.model';

export const getPortfolio = async (req: AuthRequest, res: Response) => {
  try{
    const userId = req.user?.address;
    if(!userId){
      return res.status(401).json({ message: 'Unauthorized - user not found' });
    }

    const portfolio = await portfolioService.getPortfolio(userId); // Added await
    if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.status(200).json(portfolio); // Removed await
  } catch(error) {
    console.error('Error fetching portfolio on controller:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' }); // Removed await
  }
};

export const createPortfolio = async (req: AuthRequest, res: Response) => {
  try{
    const userId = req.user?.address;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - user not found' });
    }
    const portfolioData: Omit<Portfolio, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = req.body;
    const newPortfolio = await portfolioService.createPortfolio(userId, portfolioData); // Added await
    res.status(201).json(newPortfolio); // Removed await
  } catch(error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({ message: 'Failed to create portfolio' }); // Removed await
  }
}

export const updatePortfolio = async (req: AuthRequest, res: Response) => {
  try{
    const userId = req.user?.address;
     if (!userId) {
        return res.status(401).json({ message: 'Unauthorized - user not found' });
      }
      const updatedData: Partial<Portfolio> = req.body;

      const updatedPortfolio = await portfolioService.updatePortfolio(userId, updatedData); // Added await

      if (!updatedPortfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

    res.status(200).json(updatedPortfolio); // Removed await
  } catch(error){
    console.error('Error updating portfolio on controller:', error);
    res.status(500).json({ message: 'Failed to update portfolio' }); // Removed await
  }
}