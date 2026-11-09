const express = require('express');

const router = express.Router();


//kasutatavad controllerid
const {
   signupPage,
   signupPagePost} = require('../controllers/signupControllers');
  
router.route('/').get(signupPage);

router.route('/').post(signupPagePost);

module.exports = router;
