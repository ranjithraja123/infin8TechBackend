const express = require('express');
const { getInventoryProducts, overallinventoryProducts, getItemDetails } = require('../controllers/inventoryController');
const router = express.Router();

router.get('/getInventoryProducts/:orgid', getInventoryProducts);
router.get('/overallinventoryProducts/:orgid', overallinventoryProducts);
router.get('/getItemDetails/:itemid/:catid/:orgid/:state', getItemDetails);



export default router;
