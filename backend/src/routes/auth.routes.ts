import express from 'express';
import * as authController  from '../controllers/auth.controller'; 

const router = express.Router();

router.post('/authenticate', (req, res, next) => { // Wrap in an anonymous function
    authController.authenticate(req, res).catch(next); // Important: Pass errors to the error handler
  });
  

export default router;
