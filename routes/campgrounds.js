/////////////////////////
// Reqierimentos
/////////////////////////
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/////////////////////////
// Modelos
/////////////////////////
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema } = require('../schemas.js');
const {isLoggedIn} = require('../middleware');

/////////////////////////
// Validação JOI
/////////////////////////
const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }

}


/////////////////////////
// Rotas
/////////////////////////

// Mostrar todos os Camps
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))


// Adicionar Camp
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {

    // aqui as coisas acontecem
    const campground = new Campground(req.body.campground);
    await campground.save();
        // chamei o flash sucesso com uma mensagem
    req.flash('success', 'Successfully made a new campground');
    
    res.redirect(`/campgrounds/${campground._id}`);

}))


// Mostrar Camp específico
router.get('/:id', catchAsync(async (req, res) => {
    
    const { id } = req.params;

    if(mongoose.Types.ObjectId.isValid(id)) {

        const campground = await Campground.findById(id).populate('reviews');
        res.render('campgrounds/show', { campground });

    }else{

        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');

    }

}))


// Editar Camp
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {

    const { id } = req.params;

    if (mongoose.Types.ObjectId.isValid(id)){

        const campground = await Campground.findById(id);
        res.render('campgrounds/edit', { campground });

    } else{

        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds');
        
    }
  
}))

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {

    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);

}))

// Delete Camp
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    //delete camp
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}))


/////////////////////////
// Exportar Rota
/////////////////////////
module.exports = router;