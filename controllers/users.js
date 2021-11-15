// Reqs
const User = require('../models/user');


// New User

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {

    try {

        const { email, username, password } = req.body;
        //crio nome e o email
        const user = new User({ email, username });
        //crio o usuario com o password "hashado"
        const registeredUser = await User.register(user, password);
        //"forço" o login desse usuário para que não precise logar depois 
        req.login(registeredUser, err => {

            if(err) return next(err); //se erro retorna próximo
            // se sucesso prossegue:
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');

        })

    }catch {

        req.flash('error', 'Username or Email Already Exists')
        res.redirect('/register');

    }

}


// login

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
   
    // Se chegou até aqui é porque passou pelo authenticate
    req.flash('success', 'Welcome Back!');

    // se tiver returnTo então vai pra lá se não tiver vai para campgrounds
    const redirectUrl = req.session.returnTo || '/campgrounds';
    
    // ja atribuí o returnTo a variavel, já posso excluir
    delete req.session.returnTo;
    
    res.redirect(redirectUrl);
    
}


// logout

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}