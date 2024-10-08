const { Op } = require('sequelize');
const { Order, User, OrderItem, Product, Cart } = require('../models'); 
const bcrypt = require('bcrypt');  
const sequelize = require('../db');

const defaultAdmin = {
    username: 'admin',
    password: 'admin123',  // You might want to hash this password
};

const userController = {
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error logging out. Please try again.');
            }

            // Redirect to the login page or home page after successful logout
            res.redirect('/');
        });
    },
    login: (req, res) => {
        res.render('client/login');
    },
    register: (req, res) => {
        res.render('client/register');
    },
    home: (req, res) => {
        res.render('client/home');
    },
    isAuthenticated: (req, res, next) => {
        if (req.session.userId) {
            next();
        } else {
            res.redirect('/');
        }
    },
    handleLogin: async (req, res) => {
        const { name, password } = req.body;

        if (name === defaultAdmin.username && password === defaultAdmin.password) {
            req.session.user = defaultAdmin; 
            return res.redirect('/admin/dashboard'); 
        }

        try {
            const user = await User.findOne({
                where: {
                    username: name, 
                }
            });

            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    req.session.userId = user.id;
                    console.log('User logged in:', req.session); 
                    return res.redirect('/home'); 
                } else {
                    return res.render('client/login', { error: 'Invalid username or password.' });
                }
            } else {
                return res.render('client/login', { error: 'Invalid username or password.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    handleRegister: async (req, res) => {
        const { username, email, password, confirmPassword } = req.body; 

        if (!username || !email || !password || !confirmPassword) {
            return res.render('client/register', { error: 'All fields are required.' });
        }

        if (password !== confirmPassword) {
            return res.render('client/register', { error: 'Passwords do not match.' });
        }

        try {
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: email }
                    ]
                }
            });

            if (existingUser) {
                return res.render('client/register', { error: 'Username or email already exists.' });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);

            const user = await User.create({
                username: username,
                email: email,
                password: hashedPassword
            });

            req.session.userId = user.id; 

            res.redirect('/home');
        } catch (err) {
            console.error(err);
            res.status(500).render('client/register', { error: 'Error registering user. Please try again.' });
        }
    },
    shop: async (req, res) => {
        try {
            const products = await Product.findAll();

            res.render('client/shop', { products });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    addToCart: async (req, res) => {
        try {
            const productId = req.params.id;
            const userId = req.session.userId; 

            if (!userId) {
                return res.status(401).send('User not logged in.'); 
            }

            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).send('Product not found.');
            }

            const existingCartItem = await Cart.findOne({
                where: { userId: userId, productId: productId }
            });

            if (existingCartItem) {
                existingCartItem.quantity += 1;
                await existingCartItem.save();
            } else {
                await Cart.create({
                    userId: userId,
                    productId: productId,
                    quantity: 1 
                });
            }

            res.redirect('/shop'); 
        } catch (error) {
            console.error(error);
            res.status(500).send('Error adding product to cart');
        }
    },
    viewCart: async (req, res) => {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login'); 
        }
    
        try {
            const cartItems = await Cart.findAll({
                where: { userId: userId },
                include: [{ model: Product, required: true }] 
            });
    
            if (cartItems.length === 0) {
                return res.render('client/cart', { cartItems, message: 'Your cart is empty.' });
            }
    
            res.render('client/cart', { cartItems });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error retrieving cart items');
        }
    },
    removeCart: async (req, res) => {
        const productId = req.params.id;
        const userId = req.session.userId; 

        try {
            const cartItem = await Cart.findOne({
                where: {
                    productId: productId,
                    userId: userId
                }
            });

            if (cartItem) {
                await cartItem.destroy(); 
            }

            res.redirect('/cart'); 
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    cartUpdate: async (req, res) => {
        const { productId, quantity } = req.body;
        const userId = req.session.userId; 
    
        if (!productId || !quantity || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Invalid product ID or quantity' });
        }
    
        try {
            const cartItem = await Cart.findOne({
                where: {
                    productId: productId,
                    userId: userId
                }
            });
    
            if (cartItem) {
                cartItem.quantity = quantity;
                await cartItem.save();
    
                return res.json({ success: true, cartItem });
            } else {
                return res.json({ success: false, message: 'Item not found in cart.' });
            }
        } catch (error) {
            console.error('Error updating cart item:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    checkout: async (req, res) => {
        const { selectedProducts } = req.body;

        if (!selectedProducts || selectedProducts.length === 0) {
            return res.redirect('/cart'); 
        }
    
        try {
            const cartItems = await Cart.findAll({
                where: {
                    productId: selectedProducts,
                    userId: req.session.userId
                },
                include: [{ model: Product }] 
            });
    
            res.render('client/checkout', { cartItems });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error loading checkout page.');
        }
    },
    checkoutConfirm: async (req, res) => {
        const userId = req.session.userId; 
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const cartItems = await Cart.findAll({
            where: { userId: userId }, 
            include: [{ model: Product }]
        });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: 'No items in cart' });
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

        try {
            const order = await Order.create({
                userId: userId,
                totalAmount: totalAmount,
                status: 'pending', 
            });

            const orderItemsPromises = cartItems.map(item => {
                return OrderItem.create({
                    orderId: order.id,
                    productId: item.product.id, 
                    quantity: item.quantity,
                    subtotal: item.quantity * item.product.price,
                });
            });

            await Promise.all(orderItemsPromises);

            await Cart.destroy({ where: { userId: userId } });

            res.redirect('/your-orders')
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create order' });
        }

    },
    yourOrders: async (req, res) => {
        const userId = req.session.userId;
    
        if (!userId) {
            return res.redirect('/'); 
        }
    
        try {
            const orders = await Order.findAll({
                where: { userId: userId }, 
                include: [
                    { model: User, as: 'user' }, 
                    { model: OrderItem, as: 'orderitems', include: [{ model: Product, as: 'product' }] } 
                ]
            });
    
            console.log('Orders retrieved:', JSON.stringify(orders, null, 2)); 
            res.render('client/your-orders', { orders });
        } catch (error) {
            console.error('Error fetching orders:', error); 
            res.status(500).send('Internal Server Error'); 
        }
    },
    ordersComplete: async (req, res) => {
        const orderId = req.params.id; 

        try {
            const order = await Order.findByPk(orderId);

            if (!order) {
                return res.status(404).send('Order not found');
            }

            order.status = 'completed';
            await order.save();

            res.redirect('/your-orders'); 
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    
};

module.exports = userController;
