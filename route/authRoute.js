const router = require('express').Router();
const { signUp, login } = require('../controller/authController');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

router.post('/signup', signUp);
router.post('/login', login);

module.exports = router;