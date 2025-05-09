import piloteSocket from './piloteSocket.js';

export default (io) => {
    io.on("connection", (socket) => {

        // Gestion des événements liés aux pilotes
        piloteSocket(io, socket);

        socket.on("disconnect", () => {
        });
    });
};