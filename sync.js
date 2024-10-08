const sequelize = require('./db'); // Make sure the path is correct to your db.js file
const models = require('./models'); // Import all models (User, Product, Order, etc.)

// Sync the database
sequelize.sync({ force: false, alter: true})
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch((error) => {
        console.error('Error syncing the database:', error);
    });
