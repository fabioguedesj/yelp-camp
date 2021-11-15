/////////////////////////
// Modelos
/////////////////////////
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');


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
// Array Aleatório
/////////////////////////
const sample = array => array[Math.floor(Math.random() * array.length)];


/////////////////////////
// Delete All and Create
/////////////////////////
const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({

            author: '618e7f372188e1735200cdef',

            location: `${cities[random1000].city} - ${cities[random1000].state}`,

            title: `${sample(descriptors)} ${sample(places)}`,

            description: 'mply dummy text of the printing and  of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into ele',

            price: price,

            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,    
                ]
            },

            images: [
                {
                    url: 'https://res.cloudinary.com/fabioguedesj/image/upload/v1636837891/YelpCamp/qeeevjn7cxht5nkkozto.jpg',
                    filename: 'YelpCamp/qeeevjn7cxht5nkkozto',
                },
                {
                    url: 'https://res.cloudinary.com/fabioguedesj/image/upload/v1636837891/YelpCamp/t2rr8hgphuvnglqqm5e0.jpg',
                    filename: 'YelpCamp/t2rr8hgphuvnglqqm5e0',
                }
            ]

        })

        await camp.save();;
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })