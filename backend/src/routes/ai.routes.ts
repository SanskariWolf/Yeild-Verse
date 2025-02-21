import express from 'express';
import * as aiController from '../controllers/ai.controller';
import authMiddleware from '../middleware/authMiddleware';
const router = express.Router();

router.get('/predictions', async (req, res, next) => { // Add async here
    await aiController.getPredictions(req, res).catch(next); // await here
});

export default router;
