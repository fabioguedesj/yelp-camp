// Verifica a autenticação para a cessar X página

module.exports.isLoggedIn = (req, res, next) => {

    req.session.returnTo = req.originalUrl;

    if (!req.isAuthenticated()){
        req.flash('error', 'You must be sign in');
        return res.redirect('/login');
    }

    next();

}


