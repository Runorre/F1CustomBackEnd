import http from 'http';
import https from 'https';
import fs from 'fs';
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

    const sslOptions = {
        key: fs.readFileSync(process.env.PATH_KEY_HTTPS),
        cert: fs.readFileSync(process.env.PATH_CERF_HTTPS),
    };

    const httpsServer = https.createServer(sslOptions, app);
    const server = http.createServer(app);
    const io = new Server(httpsServer, {cors: {
        origin: "*", // Autorise toutes les origines
        methods: ["GET", "POST"], // Autorise ces méthodes HTTP
    },});

    socketHandlers(io);

    httpsServer.listen(process.env.PORT_HTTPS, () => {
        console.log(`HTTPS Port : ${process.env.PORT_HTTPS}`);
    });

    server.listen(process.env.PORT_HTTP, () => {
        console.log(`HTTP Port : ${process.env.PORT_HTTP}`);
    })

    await connectDb(process.env.MONGODB_USERNAME, process.env.MONGODB_PASSWORD, process.env.MONGODB_URL);
})();