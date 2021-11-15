// Reqs
const Campground = require('../models/campground');
const mongoose = require('mongoose');
const { cloudinary } = require('../cloudinary');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


// Mostrar Campgrounds
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

// Novo campground

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {

    // Aqui é o MapBox
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    // Cria o Campground
    const campground = new Campground(req.body.campground);

    // Definir a localização
    campground.geometry = geoData.body.features[0].geometry;

    // aqui vem do multer
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));

    // o req.user já é do passport
    campground.author = req.user._id;

    console.log(campground);

    await campground.save();
    // chamei o flash sucesso com uma mensagem
    req.flash('success', 'Successfully made a new campground');

    res.redirect(`/campgrounds/${campground._id}`);

}

// Mostrar Camp Especifico

module.exports.showCampground = async (req, res) => {

    const { id } = req.params;

    if (mongoose.Types.ObjectId.isValid(id)) {

        const campground = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
            // ele 'populate' o 'reviews' no 'campground' e depois da um 'populete' no 'author' do 'reviews'
        }).populate('author');

        res.render('campgrounds/show', { campground });

    } else {

        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');

    }

}


// Editar campground

module.exports.renderEditForm = async (req, res) => {

    const { id } = req.params;

    if (mongoose.Types.ObjectId.isValid(id)) {

        const campground = await Campground.findById(id);
        res.render('campgrounds/edit', { campground });

    } else {

        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds');

    }

}


module.exports.updateCampground = async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

    // aqui vem do multer
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    // faço spread pq não posso jogar um array dentro de um array, não iria validar. Então para para uma variavel e depois divido em objetos
    campground.images.push(...imgs);

    if (req.body.deleteImages) {

        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }

        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });

    }

    await campground.save();

    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);

}

// Excluir campground

module.exports.deleteCampground = async (req, res) => {

    const { id } = req.params;

    await Campground.findByIdAndDelete(id);

    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');

}