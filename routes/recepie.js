import express from 'express';
import recepieController from '../controllers/recepieController.js';
import uploadFood from '../multer/Food.js';

const router = express.Router();

router.post('/addFood/:orgid/:userid', uploadFood, recepieController.addFood);

router.get('/getOrgFoods/:orgid/:userid', recepieController.getOrgFoods);



router.get('/getAvailableIngredients/:orgid/:userid', recepieController.getAvailableIngredients);


router.post('/updateAvailableIngredients/:orgid/:userid', recepieController.updateAvailableIngredients);


router.post('/deleteFood/:orgid/:userid', recepieController.deleteFood);

router.post('/updateFood/:orgid/:userid/:recid',uploadFood, recepieController.updateFood);

router.get('/getFoodById/:orgid/:userid', recepieController.getFoodById);

export default router