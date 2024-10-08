const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.login);
router.get('/register', userController.register);
router.get('/home', userController.isAuthenticated, userController.home);
router.get('/shop', userController.isAuthenticated, userController.shop)
router.get('/admin/logout', userController.logout)
router.get('/cart', userController.isAuthenticated, userController.viewCart);
router.get('/cart/remove/:id', userController.removeCart);
router.get('/your-orders', userController.yourOrders);
router.get('/logout', userController.logout);


router.post('/login', userController.handleLogin);
router.post('/register', userController.handleRegister);
router.post('/add-to-cart/:id', userController.addToCart);
router.post('/cart/update', userController.cartUpdate);
router.post('/checkout', userController.checkout);
router.post('/checkout/confirm', userController.checkoutConfirm);
router.post('/orders/:id/complete', userController.ordersComplete);


module.exports = router;