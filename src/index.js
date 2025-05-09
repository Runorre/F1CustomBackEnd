import http from 'http';
import express from 'express';
import dotenv from 'dotenv';

import { connectDb } from './services/MongooseService.js';
import router from './routes/index.js';
import { Server } from "socket.io";
import cors from 'cors';
import bodyParser from 'body-parser';
import socketHandlers from './sockets/index.js';

dotenv.config();



(async () => {
    const app = express();

    app.use(express.json());
    app.use(bodyParser.json({ type: 'application/*+json' }))

    app.use(cors());

    app.use('/api', router);

    const server = http.createServer(app);
    const io = new Server(server, {cors: {
        origin: "*", // Autorise toutes les origines
        methods: ["GET", "POST"], // Autorise ces méthodes HTTP
    },});

    socketHandlers(io);

    server.listen(process.env.PORT_HTTP, () => {
        console.log(`HTTP Port : ${process.env.PORT_HTTP}`);
    })

    await connectDb(process.env.MONGODB_USERNAME, process.env.MONGODB_PASSWORD, process.env.MONGODB_URL);
})();