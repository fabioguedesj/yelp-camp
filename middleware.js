const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/reviews');

// Verifica a autenticação para a cessar X página
module.exports.isLoggedIn = (req, res, next) => {

    req.session.returnTo = req.originalUrl;

    if (!req.isAuthenticated()){
        req.flash('error', 'You must be sign in');
        return res.redirect('/login');
    }

    next();

}

//Valida o preenchimento do formulário
module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }

}

//valida se é ou não o autor de X conteudo
module.exports.isAuthor = async(req, res, next) => {
    
    const {id} = req.params;
    const campground = await Campground.findById(id)

    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    } 
    
    next();
}

//valida se o campos do review foram preenchidos
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//valida se é ou não o autor de X review
module.exports.isReviewAuthor = async(req, res, next) => {
    
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId)

    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    } 
    
    next();
}