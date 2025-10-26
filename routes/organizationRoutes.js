import express from 'express';
import organization from '../controllers/organization.js';
import uploadREC from '../multer/Receipt.js';

const router = express.Router();

router.post('/addOrganization', organization.addOrganization);
router.get('/getOrganization', organization.getOrganization);
router.post('/addMerchant', organization.addMerchant);

// router.post('/colleagueRequest', organization.colleagueRequest);
// router.get('/getOrganizationRequest/:orgid', organization.getOrganizationRequest);
// router.post('/deleteRequest', organization.deleteRequest);
// router.post('/addMerchant', organization.addMerchant);

export default router;
