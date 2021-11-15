/////////////////////////
// Mongoose
/////////////////////////
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/////////////////////////
// Modelos
/////////////////////////
const Review = require('./reviews');


/////////////////////////
// Schemas
/////////////////////////
const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, //vai pegar o ID
            ref: 'Review' //o modelo review
        }
    ],
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`
})


/////////////////////////
// MiddleWare
/////////////////////////
// Acontece assim que deletar um Schema
// Com isso eu deleto os reviews ligados ao camp
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // o doc mostra o que foi deletado
    if (doc) {
        await Review.remove({
            _id: { $in: doc.reviews }
        })
    }

})


/////////////////////////
// Exportar Modelo
/////////////////////////
module.exports = mongoose.model('Campground', CampgroundSchema);