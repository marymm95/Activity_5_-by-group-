// models/index.js
const User = require('./User');
const Cart = require('./Cart');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define relationships
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Cart.belongsTo(Product, { foreignKey: 'productId' }); 
Product.hasMany(Cart, { foreignKey: 'productId' });

module.exports = {
  User,
  Cart,
  Product,
  Order,
  OrderItem,
};
