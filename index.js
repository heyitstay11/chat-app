const express = require('express');
const PORT = process.env.PORT || 5000;
const path = require('path');
const cors = require('cors');
const startSocket = require('./socket/main')
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
    serveClient: false
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({'extended': false}));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

startSocket(io);

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(PORT, () => console.log(`Server up at http://localhost:${PORT}`));