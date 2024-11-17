const mongoose = require('mongoose');

const url = `mongodb+srv://kjha7865:1234@cluster0.9520r.mongodb.net/`;

mongoose.connect(url, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB')).catch((e)=> console.log('Error', e))