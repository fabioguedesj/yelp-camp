if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    // pelo que entendi isso aqui só mostra se tive em modo de desenvolvimento, ou seja, em dev ele vai mostrar pastas ocultas
}


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

// mongodb://localhost:27017/yelp-camp

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Verificar erros de conexão:
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


// CONECTAR COM O BANCO DELES
const session = require('express-session'); //botei o session aqui por que precisa vir antes do MongoStore

const MongoStore = require('connect-mongo');

// o heroku manda o process.env.SECRET
const secret = process.env.SECRET || 'istoeumsegredo';

app.use(session({
    secret,
    store: MongoStore.create({
        mongoUrl: dbUrl
    }),
    afterTouch: 24 * 60 * 60
  }));

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
// Helmet
// É pra segurança também
/////////////////////////
const helmet = require('helmet');
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/fabioguedesj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


/////////////////////////
// Usar a pasta Public
/////////////////////////
app.use(express.static(path.join(__dirname, 'public')));


/////////////////////////
// Session 
/////////////////////////

const sessionConfig = {
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, //tirar o comentário depois do deploy, porque o secure só permite https, ou seja, não funciona com localhost
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
// Sanitize
// Contra 'SQL Injection'
/////////////////////////
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

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
    //cria uma variavel currentUser com o usuário logado
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
// Escutando a porta
/////////////////////////
const port = process.env.PORT || 8080// o heroku manda o .PORT

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})