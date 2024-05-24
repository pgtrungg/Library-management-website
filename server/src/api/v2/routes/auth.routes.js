let express = require('express');
let router = express.Router();

let authController = require('../controllers/auth.controller');
let auth = require('../middlewares/auth.middleware');
let csrf = require('../middlewares/csrf.middleware');

router.route('/register')
    .post(authController.register); // POST /api/v2/auth/register - Register a new User (Public)
router.route('/verify-email/:token')
    .get(authController.verifyEmail); // GET /api/v2/auth/verify-email/:token - Verify Email (Public)

router.route('/login')
    .post(authController.login); // POST /api/v2/auth/login - Login User (Public)

router.route('/logout')
    .post(csrf.csrfMiddleware, auth.authMiddleware, authController.logout); // POST /api/v2/auth/logout - Logout User (User)

router.route('/refresh-token')
    .post(authController.refreshToken); // POST /api/v2/auth/refresh-token - Refresh Token (User)

router.route('/forgot-password')
    .post(authController.forgotPassword); // POST /api/v2/auth/forgot-password - Forgot Password (Public)

router.route('/reset-password/:token')
    .post(authController.resetPassword); // POST /api/v2/auth/reset-password/:token - Reset Password (Public)


router.route('/activate-account')
    .post(authController.activateAccount); // POST /api/v2/auth/activate-account/:token (Public)





module.exports = router;



