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
// Definir Rotas
/////////////////////////

// Home
app.get('/', (req, res) => {
    res.render('home');
})

// Mostrar todos os Camps
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})


// Adicionar Camp
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})


// Mostrar Camp específico
app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
})


// Editar Camp
app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
})

// Delete Camp
app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})


/////////////////////////
// Escutando a porta 8080
/////////////////////////
app.listen(8080, () => {
    console.log('Serving on port 8080')
})