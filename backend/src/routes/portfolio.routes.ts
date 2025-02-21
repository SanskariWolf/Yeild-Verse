import express from 'express';
import * as portfolioController from '../controllers/portfolio.controller';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', async (req, res, next) => { // Add async here
    await portfolioController.getPortfolio(req, res).catch(next); // await here
});
router.post('/', async (req,res, next) => { // Add async here
    await portfolioController.createPortfolio(req, res).catch(next); // await here
});
router.put('/',  async (req, res, next) => { // Add async here
   await portfolioController.updatePortfolio(req, res).catch(next); // await here
});

export default router;
