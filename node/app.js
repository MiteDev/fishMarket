const express = require('express');
const app = express();

const fishRouter = require('./routers/fish');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'))


app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', fishRouter);


module.exports = app;