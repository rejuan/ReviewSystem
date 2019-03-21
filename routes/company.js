const express = require("express");
const companyController = require("../controllers/company");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();

router.post("/", auth, companyController.createCompany);

router.patch('/:id', auth, companyController.updateCompany);

router.delete('/:id', auth, companyController.deleteCompany);

router.get('/:id', auth, companyController.getCompany);

router.patch('/suspend/:id', [auth, admin], companyController.suspendCompany);

router.get('/', auth, companyController.companyList);

module.exports = router;