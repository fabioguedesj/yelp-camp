/////////////////////////
// Express
/////////////////////////
const express = require('express');
const app = express();
const path = require('path');


/////////////////////////
// Permite ler o req.body
/////////////////////////
app.use(express.urlencoded({ extended: true }));

/////////////////////////
// Modelos
/////////////////////////
const Campground = require('./models/campground');
const Review = require('./models/reviews');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');

/////////////////////////
// Mongoose
/////////////////////////
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Verificar erros de conexão:
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

/////////////////////////
// EJS
/////////////////////////
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


/////////////////////////
// Override
/////////////////////////
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


/////////////////////////
// EJS - Mate (modelos)
/////////////////////////
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);


/////////////////////////
// Joi [JS Validation]
/////////////////////////

// Validação do Camp
const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }

}

// Validação do Review
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
// Definir Rotas
/////////////////////////

// Home
app.get('/', (req, res) => {
    res.render('home');
})

// Mostrar todos os Camps
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))


// Adicionar Camp
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // aqui as coisas acontecem
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))


// Mostrar Camp específico
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))


// Editar Camp
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Delete Camp
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    //delete camp
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))


// Add Review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    const review = new Review(req.body.review);
    campground.reviews.push(review);

    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${id}`);
}))


// Delete Review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId)

    res.redirect(`/campgrounds/${id}`);
}))


// Se nada for, vem pra cá
// "Não" é um erro
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


// Erros (o 'next' joga pra cá)
// É um erro
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


/////////////////////////
// Escutando a porta 8080
/////////////////////////
app.listen(8080, () => {
    console.log('Serving on port 3000')
})