// Requerimentos
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');

// Grupo /register
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))


// Grupo /login
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)


// Sign Out
router.get('/logout', users.logout)


// Exporta
module.exports = router;