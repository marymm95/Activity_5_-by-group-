const authMiddleware = {
    isAuthenticated: (req, res, next) => {
        if (req.session.user) {
            next(); // User is authenticated, proceed to the next middleware
        } else {
            res.redirect('/login'); // Redirect to login if not authenticated
        }
    }
};

module.exports = authMiddleware;
