const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const {upload, imageFilterMiddleware} = require('../middlewares/multer.middleware');


// Protected routes
router.route('/:userId')
    .get(auth.authMiddleware, userController.getProfile) // GET /api/v2/users/:userId - Retrieve a single User with id (User)
    .put(auth.authMiddleware, userController.updateProfile) // PUT /api/v2/users/:userId - Update a User with id (User)
    .delete(auth.authMiddleware, userController.deleteUser) // DELETE /api/v2/users/:userId - Delete a User with id (User)

router.route('/:userId/avatar')
    .patch(auth.authMiddleware, upload.single('avatar'), imageFilterMiddleware, userController.updateAvatar) // PATCH /api/v2/users/:userId/avatar - Upload Avatar of a User with id (User)

router.route('/:userId/password')
    .patch(auth.authMiddleware, userController.changePassword) // PATCH /api/v2/users/:userId/password - Change Password of a User with id (User)
// Admin routes
router.route('/')
    .get(auth.adminMiddleware, userController.getAllUsers) // GET /api/v2/users - Retrieve all Users from the database (Admin)

router.route('/admin/:userId')
    .get(auth.adminMiddleware, userController.getUserById) // GET /api/v2/users/admin/:userId - Retrieve a single User with id (Admin)
    .delete(auth.adminMiddleware, userController.deleteUser) // DELETE /api/v2/users/admin/:userId - Delete a User with id (Admin)
    .put(auth.adminMiddleware, userController.changeStatus) // PUT /api/v2/users/admin/:userId - Change Status of a User with id (Admin)



module.exports = router;