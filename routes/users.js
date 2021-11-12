// Requerimentos
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');


// New User (Register)
router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res, next) => {

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

}))


// Login
router.get('/login', (req, res) => {
    res.render('users/login');
})


router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
   
    // Se chegou até aqui é porque passou pelo authenticate
    req.flash('success', 'Welcome Back!');
    // se tiver returnTo então vai pra lá se não tiver vai para campgrounds
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // ja atribuí o returnTo a variavel, já posso excluir
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    
})


// Sign Out
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
})


// Exporta
module.exports = router;