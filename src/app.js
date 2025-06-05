const express = require('express');
const path = require('path')
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection')
const session = require('express-session');

const app = express();

// Importing routes

const homeRoutes = require('./routes/home')
const cartRoutes = require('./routes/shop-cart');

// Settings

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares (Se ejecutan antes de las peticiones)

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: 'mi_secreto_sesion',
  resave: false,
  saveUninitialized: false
}));

app.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'sfl-db'
}, 'single'))

// Routes

app.use('/', homeRoutes)
app.use('/shop-cart', cartRoutes);

// Static files

app.use(express.static(path.join(__dirname, 'public')))

// Inicio de servidor

app.listen(app.get('port'), () => {
    console.log('Servidor corriendo en PORT: 3306');
})