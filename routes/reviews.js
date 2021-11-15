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
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');


/////////////////////////
// Rotas
/////////////////////////

// Add Review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))


// Delete Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

// Nesse caso eu tirei a rota /:id do parametro
// Logo eu preciso dizer "mergeParams: true" quando chamar
// o express aqui em cima

/////////////////////////
// Exportar Rota
/////////////////////////
module.exports = router;