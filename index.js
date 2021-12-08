const express = require('express');
const PORT = process.env.PORT || 5000;
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./middlewares/connectDB');
const authRoutes =  require('./routes/auth');
const cookieParser = require('cookie-parser');
const startSocket = require('./socket/main');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
    serveClient: false,
    cors: {
        origin: '*',
    }
});

if (process.env.NODE_ENV !== "production") {
    // Load environment variables from .env file in non prod environments
    require("dotenv").config()
}

const whitelist = process.env.WHITELISTED_DOMAINS
    ? process.env.WHITELISTED_DOMAINS.split(',')
    : [];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({'extended': false}));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors(corsOptions));
app.use(cookieParser(process.env.COOKIE_SECRET));


startSocket(io);

app.get('/', (req, res) => {
    res.render('index');
});

app.use('/auth', authRoutes);


server.listen(PORT, () => console.log(`Server up at http://localhost:${PORT}`));