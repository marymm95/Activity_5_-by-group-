const fs = require('fs');
const path = require('path');
const { Order, User, OrderItem, Product } = require('../models');
const multer = require('multer');
const sequelize = require('../db');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const messages = {}; 

const admin = {
    dashboard: (req, res) => {
        res.render('admin/dashboard');
    },

    products: (req, res) => {
        res.render('admin/products');
    },

    orders: async (req, res) => {
        const productMessages = messages['productMessage'] || null; 
        delete messages['productMessage']; 
        try {
            // Retrieve only orders with status 'pending'
            const orders = await Order.findAll({
                where: {
                    status: 'pending' // Filter by status
                },
                include: [
                    {
                        model: User, 
                        attributes: ['id', 'username', 'email'], 
                    },
                    {
                        model: OrderItem, 
                        include: [
                            {
                                model: Product, 
                                attributes: ['id', 'name', 'price'], 
                            },
                        ],
                    },
                ],
            });
    
            // console.log("Orders retrieved:", JSON.stringify(orders, null, 2)); 
            res.render('admin/orders', { orders: orders, productMessage: productMessages }); 
        } catch (error) {
            console.error("Error retrieving orders:", error);
            res.render('admin/orders', { orders: [], error_msg: 'Failed to load orders.' });
        }
    },
    

    addProduct: [
        upload.single('image'), // Handle image upload
        async (req, res) => {
            const success_msg = 'Successfully added product';
            const error_msg = 'Failed to add product';

            try {
                const productData = {
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    stock: req.body.stock,
                    category: req.body.category,
                    image: req.file ? req.file.filename : 'default.png', // Use default image if none is uploaded
                };

                await Product.create(productData);
                messages['productMessage'] = success_msg;
                return res.redirect('/admin/products');
            } catch (err) {
                console.error(err.message);
                messages['productMessage'] = error_msg;
                return res.redirect('/admin/products');
            }
        }
    ],

    getProducts: async (req, res) => {
        const productMessages = messages['productMessage'] || null; 
        delete messages['productMessage']; 

        try {
            const products = await Product.findAll();
            res.render('admin/products', { products: products, productMessage: productMessages });
        } catch (err) {
            console.error(err.message);
            res.render('admin/products', { products: [], error_msg: 'Failed to load products.' });
        }
    },

    deleteProducts: async (req, res) => {
        const productId = req.params.id;
        const success_msg = 'Successfully deleted product';
        const error_msg = 'Failed to delete product';

        try {
            const product = await Product.findByPk(productId);
            if (product.imageUrl && product.imageUrl !== 'default.png') {
                const imagePath = path.join(__dirname, '../public/images', product.imageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Remove image from filesystem
                }
            }

            await Product.destroy({ where: { id: productId } });
            messages['productMessage'] = success_msg;
        } catch (err) {
            console.error(err.message);
            messages['productMessage'] = error_msg;
        } finally {
            return res.redirect('/admin/products');
        }
    },

    getEditProduct: async (req, res) => {
        const productId = req.params.id;
        const productMessages = messages['productMessage'] || null; 
        delete messages['productMessage']; 

        try {
            const product = await Product.findByPk(productId);
            if (!product) return res.status(404).send('Product not found');
            res.render('admin/edit_product', { product: product, productMessage: productMessages });
        } catch (err) {
            console.error(err.message);
            res.render('admin/edit_product', { product: null, error_msg: 'Failed to load product.' });
        }
    },

    updateProducts: [
        upload.single('image'), // Handle image upload
        async (req, res) => {
            const productId = req.params.id;
            const success_msg = 'Successfully updated product';
            const error_msg = 'Failed to update product';

            try {
                const product = await Product.findByPk(productId);
                if (!product) return res.status(404).send('Product not found');

                // Update fields
                product.name = req.body.name || product.name;
                product.description = req.body.description || product.description;
                product.price = req.body.price || product.price;
                product.stock = req.body.stock || product.stock;
                product.category = req.body.category || product.category;

                // Handle image separately
                if (req.file) {
                    // Delete old image if it exists and is not the default
                    if (product.imageUrl && product.imageUrl !== 'default.png') {
                        const oldImagePath = path.join(__dirname, '../public/images', product.imageUrl);
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath); 
                        }
                    }
                    product.imageUrl = req.file.filename; // Save new image filename
                }

                await product.save();

                messages['productMessage'] = success_msg;
                return res.redirect('/admin/products');
            } catch (err) {
                console.error(err.message);
                messages['productMessage'] = error_msg;
                return res.redirect('/admin/products');
            }
        }
    ],

    viewOrders: async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await Order.findByPk(orderId, {
                include: [
                    { model: User, as: 'user' }, // Include user details
                    { model: OrderItem, as: 'orderitems', include: [{ model: Product, as: 'product' }] }
                ]
            });
    
            if (!order) {
                return res.status(404).send('Order not found');
            }
            res.render('admin/order_details', { order: order }); // Render the view-order page with order details
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    },

    orderApprove: async (req, res) => {
        const success_msg = 'Successfully approved order';
        const error_msg = 'Failed to approve order';
        try {
            const orderId = req.params.id;
            console.log(`Order ID: ${orderId}`); // Log the order ID
    
            const order = await Order.findByPk(orderId);
            console.log(order); // Log the order object to check its current state
            
            if (!order) {
                return res.status(404).send('Order not found');
            }
    
            order.status = 'approved';
            await order.save();
            messages['productMessage'] = success_msg;
            return res.redirect('/admin/orders'); // Redirect back to orders page after approval
        } catch (error) {
            console.error(error);
            messages['productMessage'] = error_msg;
            return res.redirect('/admin/orders'); 
        }
    },

    orderCancel: async (req, res) => {
        const orderId = req.params.id; // Extract the order ID from the request
        const success_msg = 'Successfully cancel order';
        const error_msg = 'Failed to cancel order';
        try {
            const order = await Order.findByPk(orderId);
            if (!order) {
                return res.status(404).send('Order not found');
            }
            
            order.status = 'cancelled'; // Update the order status to 'cancelled'
            await order.save(); // Save the changes
            messages['productMessage'] = success_msg;
            return res.redirect('/admin/orders'); // Redirect back to the orders page
        } catch (error) {
            console.error(error);
            messages['productMessage'] = error_msg;
            return res.redirect('/admin/orders'); // Redirect on error
        }
    },

    approveOrders: async (req, res) => {
        const productMessages = messages['productMessage'] || null; 
        delete messages['productMessage']; 
        try {
            // Retrieve only orders with status 'pending'
            const orders = await Order.findAll({
                where: {
                    status: 'approved' // Filter by status
                },
                include: [
                    {
                        model: User, 
                        attributes: ['id', 'username', 'email'], 
                    },
                    {
                        model: OrderItem, 
                        include: [
                            {
                                model: Product, 
                                attributes: ['id', 'name', 'price'], 
                            },
                        ],
                    },
                ],
            });
    
            // console.log("Orders retrieved:", JSON.stringify(orders, null, 2)); 
            res.render('admin/approved', { orders: orders, productMessage: productMessages }); 
        } catch (error) {
            console.error("Error retrieving orders:", error);
            res.render('admin/approved', { orders: [], error_msg: 'Failed to load orders.' });
        }
    },

    cancelOrders: async (req, res) => {
        const productMessages = messages['productMessage'] || null; 
        delete messages['productMessage']; 
        try {
            // Retrieve only orders with status 'pending'
            const orders = await Order.findAll({
                where: {
                    status: 'cancelled' // Filter by status
                },
                include: [
                    {
                        model: User, 
                        attributes: ['id', 'username', 'email'], 
                    },
                    {
                        model: OrderItem, 
                        include: [
                            {
                                model: Product, 
                                attributes: ['id', 'name', 'price'], 
                            },
                        ],
                    },
                ],
            });
    
            res.render('admin/cancelled', { orders: orders, productMessage: productMessages }); 
        } catch (error) {
            console.error("Error retrieving orders:", error);
        }
    },

    orderShip: async (req, res) => {
        const orderId = req.params.id;
        const success_msg = 'Successfully shipped order';
        const error_msg = 'Failed to ship order';
    
        try {
            const order = await Order.findOne({
                where: { id: orderId },
                include: [{ model: OrderItem, as: 'orderitems' }],
            });
    
            if (!order || order.status === 'shipped') {
                return res.status(400).json({ error: 'Invalid order status' });
            }
    
            // Update the status of the order to 'shipped'
            order.status = 'shipped';
            await order.save();
    
            // Update stock directly with a raw query
            await sequelize.query(`
                UPDATE products
                SET stock = stock - (
                    SELECT SUM(quantity) FROM orderitems WHERE orderId = :orderId
                )
                WHERE id IN (
                    SELECT productId FROM orderitems WHERE orderId = :orderId
                )
            `, {
                replacements: { orderId },
            });
    
            messages['productMessage'] = success_msg;
            return res.redirect('/admin/orders');
        } catch (error) {
            console.error(error);
            messages['productMessage'] = error_msg;
            return res.redirect('/admin/orders');
        }
    },

    shippedOrders: async (req, res) => {
        const productMessages = messages['productMessage'] || null; 
        delete messages['productMessage']; 
        try {
            // Retrieve only orders with status'shipped'
            const orders = await Order.findAll({
                where: {
                    status:'shipped' // Filter by status
                },
                include: [
                    {
                        model: User, 
                        attributes: ['id', 'username', 'email'], 
                    },
                    {
                        model: OrderItem, 
                        include: [
                            {
                                model: Product, 
                                attributes: ['id', 'name', 'price'], 
                            },
                        ],
                    },
                ],
            }); 
        
            res.render('admin/shipped', { orders: orders, productMessage: productMessages });
            
        } catch (error) {
            console.error("Error retrieving orders:", error);
            res.render('admin/shipped', { orders: [], error_msg: 'Failed to load orders.' });
        }
    },

    orderDelete: async (req, res) => {
        const orderId = req.params.id; // Extract the order ID from the request
        const success_msg = 'Successfully deleted order';
        const error_msg = 'Failed to delete order';
        try {
            const order = await Order.findByPk(orderId);
            if (!order) {
                return res.status(404).send('Order not found');
            }
            
            await order.destroy(); // Delete the order
            messages['productMessage'] = success_msg;
            return res.redirect('/admin/orders'); // Redirect back to the orders page
        } catch (error) {
            console.error(error);
            messages['productMessage'] = error_msg;
            return res.redirect('/admin/orders'); // Redirect on error
        }
    },

    orderCompleted: async (req, res) => {
        const productMessages = messages['productMessage'] || null;
        delete messages['productMessage'];
    
        try {
            // Retrieve only orders with status 'completed'
            const orders = await Order.findAll({
                where: {
                    status: 'completed',
                },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username', 'email'],
                    },
                    {
                        model: OrderItem, // Include OrderItem model
                        as: 'orderitems', // Correct alias from the error message
                        include: [
                            {
                                model: Product, // Include the product model to access stock
                                attributes: ['id', 'name', 'price', 'stock'], // Include stock attribute
                            },
                        ],
                    },
                ],
            });
    
           
            res.render('admin/completed', { orders: orders, productMessage: productMessages });
        } catch (error) {
            console.error("Error retrieving or updating orders:", error);
            res.render('admin/completed', { orders: [], error_msg: 'Failed to load orders.' });
        }
    },
    
};

module.exports = admin;
