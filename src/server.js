const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
// Para salvar as sessões dentro da pasta sessions
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express();

const conn = require('./db/conn')

// Template engine
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')


// Midlewares para receber resposta do doby
app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json())

// session midleware
app.use(
    session({
        name: "session",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        // Onde vou salvar os logs
        stone: new FileStore({
            logFn: function(){},
            path: require('path').join(require('os').tmpdir(), 'sessions')
        }),
        cookie: {
            secure: false,
            maxAge: 360000,
            expires: new Date(Date.now() + 360000),
            httpOnly: true
        }
    })
)

// Flash messages

app.use(flash())

// public path

app.use(express.static('public'))

// set session to res
app.use((req, res, next) => {
    if(req.session.userId) {
        res.locals.session = req.session
    }

    next();

})

const port = process.env.DB_PORT || 3000
conn
    .sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor rodando na porta http://localhost:${port}`)
        })
    })
    .catch((e) => console.log(e))