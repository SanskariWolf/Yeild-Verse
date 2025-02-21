import * as portfolioModel from '../models/portfolio.model';
import { Portfolio, Asset } from '../models/portfolio.model';

export const getPortfolio = async (userId: string): Promise<Portfolio | undefined> => {
    return portfolioModel.getPortfolioByUserId(userId);
};

export const createPortfolio = async (userId: string, portfolioData: Omit<Portfolio, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Portfolio> => {
  const newPortfolioData = {
    ...portfolioData,
    userId,
  };
  return portfolioModel.createPortfolio(newPortfolioData);
}

export const updatePortfolio = async (userId: string, updatedData: Partial<Portfolio>): Promise<Portfolio | undefined> => {
    return portfolioModel.updatePortfolio(userId, updatedData);
};