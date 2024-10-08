const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/admin/dashboard', adminController.dashboard);
router.get('/admin/products', adminController.getProducts);
router.get('/admin/products/delete/:id', adminController.deleteProducts)
router.get('/admin/products/edit/:id', adminController.getEditProduct)
router.get('/admin/orders', adminController.orders)
router.get('/admin/orders/view/:id', adminController.viewOrders)
router.get('/admin/orders/approved', adminController.approveOrders)
router.get('/admin/orders/cancelled', adminController.cancelOrders)
router.get('/admin/orders/shipped', adminController.shippedOrders)
router.get('/admin/orders/completed', adminController.orderCompleted)


router.post('/admin/add', adminController.addProduct);
router.post('/admin/products/edit/:id', adminController.updateProducts);
router.post('/admin/orders/approve/:id', adminController.orderApprove);
router.post('/admin/orders/cancel/:id', adminController.orderCancel);
router.post('/admin/orders/ship/:id', adminController.orderShip);
router.post('/admin/orders/delete/:id', adminController.orderDelete);

module.exports = router;