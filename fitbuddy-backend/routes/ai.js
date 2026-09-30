const express = require('express');
const router = express.Router();
const { generatePlan, submitFeedback } = require('../controllers/aiController');

router.post('/generate-plan', generatePlan);
router.post('/feedback', submitFeedback);

module.exports = router;
