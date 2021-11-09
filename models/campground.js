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
// Schema
/////////////////////////
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId, //vai pegar o ID
            ref: 'Review' //o modelo review
        }
    ]
})


/////////////////////////
// MiddleWare
/////////////////////////
// Acontece assim que deletar um Schema
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