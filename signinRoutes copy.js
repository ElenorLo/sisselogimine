const express = require('express');

const router = express.Router();


//kasutatavad controllerid
const {
   signinPage,
   signinPagePost} = require('../controllers/signinControllers');
  
router.route('/').get(signinPage);

router.route('/').post(signinPagePost);

module.exports = router;
