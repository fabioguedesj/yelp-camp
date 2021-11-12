/////////////////////////
// Express
/////////////////////////
const express = require('express');
const router = express.Router({ mergeParams: true });


/////////////////////////
// Modelos
/////////////////////////
const Campground = require('../models/campground');
const Review = require('../models/reviews');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas.js');


/////////////////////////
// Validação JOI
/////////////////////////

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


/////////////////////////
// Rotas
/////////////////////////

// Add Review
router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    const review = new Review(req.body.review);
    campground.reviews.push(review);

    await review.save();
    await campground.save();

    req.flash('success', 'Successfully created a new Review');

    res.redirect(`/campgrounds/${id}`);
}))


// Delete Review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId)

    req.flash('success', 'Successfully deleted Review');

    res.redirect(`/campgrounds/${id}`);
}))

// Nesse caso eu tirei a rota /:id do parametro
// Logo eu preciso dizer "mergeParams: true" quando chamar
// o express aqui em cima

/////////////////////////
// Exportar Rota
/////////////////////////
module.exports = router;