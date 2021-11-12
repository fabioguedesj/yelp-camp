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
const User = require('./models/user');

const ExpressError = require('./utils/ExpressError');

const { campgroundSchema, reviewSchema } = require('./schemas.js');

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');


/////////////////////////
// Mongoose
/////////////////////////
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
// Permite usar um modelo ejs
// <% layout('rota') %>
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);


/////////////////////////
// Usar a pasta Public
/////////////////////////
app.use(express.static(path.join(__dirname, 'public')));


/////////////////////////
// Session 
/////////////////////////
const session = require('express-session');

const sessionConfig = {
    secret: 'exemplodesegredo',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Uma semana (ms)
        maxAge: 7 * 24 * 60 * 60 * 1000 // Uma semana (ms)
    }
}

app.use(session(sessionConfig));


/////////////////////////
// Passport (AUTH)
/////////////////////////
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.use(passport.initialize());
app.use(passport.session()); // essa parte tem que vir depois de "app.use(session(sessionConfig))"

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/////////////////////////
// Flash 
/////////////////////////
const flash = require('connect-flash');
app.use(flash());

// setei as variaveis sucesso e erro para serem usadas
// sempre que forem chamadas
// Obs.: chamo elas no "app.post", por exemplo
app.use((req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    //mostra o usuario logado
    //tem que vir depois do passport visto que primeiro
    //precisa setar o req.user com o passport
    next();
})


/////////////////////////
// Definir Rotas
/////////////////////////

// Home
app.get('/', (req, res) => {
    res.render('home');
})

// Rota /campground
app.use('/campgrounds', campgroundsRoutes);


// Rota dos reviews
app.use('/campgrounds/:id/reviews', reviewsRoutes);


// Register
app.use('/', userRoutes);


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