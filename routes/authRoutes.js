import express from 'express';
import auth from '../controllers/authController.js';
     // import middleware similarly

const router = express.Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/generateAndSendToken', auth.generateAndSenToken);

router.post('/colleagueRequest', auth.collegueRequests);

router.post('/deleteRequest', auth.deleteRequest);

// router.post('/login', auth.login);
router.post('/validateToken', auth.validateToken);
// router.post('/sendForgotPassword', auth.sendForgotPassword);
// router.post('/validateForgotToken', auth.validateForgotToken);
// router.post('/logout', auth.logout);
// router.post('/updatePassword', auth.updatePassword);

export default router;
