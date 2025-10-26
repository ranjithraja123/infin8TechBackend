// const express = require('express');
// const uploadREC = require('../multer/Receipt');
// const { getExpenses, saveExpense, approvalChange, getOganizationMerchant, getCategories } = require('../controllers/expenseController');
import express from 'express';
import expense from '../controllers/expenseController.js';
import uploadREC from '../multer/Receipt.js'
const router = express.Router();


// router.post('/saveExpense/:wallid/:orgid',uploadREC,saveExpense);
router.get('/getExpenses',expense.getExpenses);
router.post('/approvalChange',expense.approvalChange);
router.post('/saveExpense/:wallid/:orgid', uploadREC, expense.saveExpense);
router.post('/getOganizationMerchant',expense.getOganizationMerchant);
router.get('/getCategories',expense.getCategories);

router.post('/addcategories',expense.addcategories);




export default router;
