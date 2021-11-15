// Req
const Campground = require('../models/campground');
const Review = require('../models/reviews');


// Adicionar review

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    const review = new Review(req.body.review);
    review.author = req.user._id; 
    campground.reviews.push(review);

    await review.save();
    await campground.save();

    req.flash('success', 'Successfully created a new Review');

    res.redirect(`/campgrounds/${id}`);
}

    // Pelo que eu entendi, se eu estiver vindo de uma requisição, put, post, delete, eu uso req.user
    // Agora dentro de um file, tipo ejs, eu uso currentUser

// Deletar Review

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId)

    req.flash('success', 'Successfully deleted Review');

    res.redirect(`/campgrounds/${id}`);
}