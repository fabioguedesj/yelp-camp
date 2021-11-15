/////////////////////////
// Reqierimentos
/////////////////////////
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// O multer permite o envio de arquivos
// Atributo single: uma imagem
// Atributo array: multiplas imagens

/////////////////////////
// Modelos
/////////////////////////
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

const campgrounds = require('../controllers/campgrounds');

/////////////////////////
// Rotas
/////////////////////////

// Grupo /
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

// Adicionar Camp
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// grupo /:id
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
    //obs: esse array('image), o image é o 'name' do form

// Editar Camp
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


/////////////////////////
// Exportar Rota
/////////////////////////
module.exports = router;