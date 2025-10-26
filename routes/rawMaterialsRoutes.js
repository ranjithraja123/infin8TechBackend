// const express = require('express');
import express from 'express'
import rawMaterials from '../controllers/rawMaterials.js'
// const { newItems, newRawCategories, newRawMaterials, getItems, getCategories, addSubCategories, getSubcategories, getItemById, getMateials, getMaterials, addMaterialItems } = require('../controllers/rawMaterials');
const router = express.Router();

router.post('/addItems', rawMaterials.newItems);
router.get('/getItems/:orgid', rawMaterials.getItems);
router.get('/getCategories/:orgid', rawMaterials.getCategories);
router.post('/newRawCategories', rawMaterials.newRawCategories);
router.get('/getCategories/:orgid', rawMaterials.getCategories);
router.post('/newRawMaterials', rawMaterials.newRawMaterials);
router.post('/addSubCategories', rawMaterials.addSubCategories);
router.get('/getSubcategories/:orgid/:rcatid', rawMaterials.getSubcategories);
router.get('/getItemById/:orgid/:itemid', rawMaterials.getItemById);

router.get('/getMaterials/:orgid', rawMaterials.getMaterials);


router.post('/addMaterials', rawMaterials.addMaterials);

router.post('/deductmaterials', rawMaterials.deductmaterials);

router.post('/getaddedMaterials', rawMaterials.getaddedMaterials);

// deleteMaterialsByid, deleteInventoryRawMaterials
router.post('/deleteMaterialsByid', rawMaterials.deleteMaterialsByid);

router.post('/deleteInventoryRawMaterials', rawMaterials.deleteInventoryRawMaterials);

router.post('/updateRawMaterials', rawMaterials.updateRawMaterials);

router.post('/served', rawMaterials.served);

// router.post('/addMaterialItems', addMaterialItems);


export default router;
