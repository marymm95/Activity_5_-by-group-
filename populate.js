const { Order, User, OrderItem, Product } = require('./models');

// Retrieve all orders with associated user and product information
Order.findAll({
  include: [
    {
      model: User, // Include the User model to get user information
      attributes: ['id', 'username', 'email'], // Specify which attributes to retrieve
    },
    {
      model: OrderItem, // Include the OrderItem model
      include: [
        {
          model: Product, // Include the Product model to get product details
          attributes: ['id', 'name', 'price'], // Specify which attributes to retrieve
        },
      ],
    },
  ],
})
  .then(orders => {
    console.log(JSON.stringify(orders, null, 2)); // Log the retrieved orders
  })
  .catch(err => {
    console.error(err);
  });
