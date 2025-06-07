const express = require('express');
const path = require('path')
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection')
const session = require('express-session');

const app = express();

// Importing routes

const homeRoutes = require('./routes/home')
const catalogRoutes = require('./routes/catalog');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');


// Settings

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares (Se ejecutan antes de las peticiones)

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: 'admin',
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
app.use('/catalog', catalogRoutes);
app.use('/register', registerRoutes);
app.use('/', loginRoutes);

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Static files

app.use(express.static(path.join(__dirname, 'public')))

// Inicio de servidor

app.listen(app.get('port'), () => {
    console.log('Servidor corriendo en PORT: 3306');
})