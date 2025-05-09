import { PiloteModel } from '../models/index.js';

function calculateTimeGap(startDate, endDate) {
    const diffMs = endDate - startDate;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    const milliseconds = diffMs % 1000;
    return `${minutes}.${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function getBestTime(time1, time2) {
    const timeToMs = (time) => {
        const [minutes, seconds, milliseconds] = time.split('.').map(Number);
        return (minutes * 60000) + (seconds * 1000) + milliseconds;
    };

    if (time1 == "0.00.000")
        return time2
    const time1Ms = timeToMs(time1);
    const time2Ms = timeToMs(time2);
    return time1Ms < time2Ms ? time1 : time2;
}

function gapTime(t1, t2) {
    function toMs(t) {
        const parts = t.split('.');
        if (parts.length !== 3) {
        throw new Error(`Format invalide : '${t}' (attendu M.S.SSS)`);
        }
        const [min, sec, ms] = parts.map(Number);
        return min * 60000 + sec * 1000 + ms;
    }

    const ms1 = toMs(t1);
    const ms2 = toMs(t2);
    const diff = Math.abs(ms1 - ms2);

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const milliseconds = diff % 1000;

    // Formatage avec zéros à gauche
    const secStr = String(seconds).padStart(2, '0');
    const msStr  = String(milliseconds).padStart(3, '0');

    return `${minutes}.${secStr}.${msStr}`;
}

export default (io, socket) => {
    const sendData = async () => {
        try {
            let pilotes = await PiloteModel.find();

            // Trier les pilotes par leur meilleur temps (bestLap)
            pilotes = pilotes.sort((a, b) => {
                const timeToMs = (time) => {
                    if (time === "0.00.000") return Infinity; // Considérer "0.00.000" comme le pire temps
                    const [minutes, seconds, milliseconds] = time.split('.').map(Number);
                    return (minutes * 60000) + (seconds * 1000) + milliseconds;
                };
                return timeToMs(a.bestLap) - timeToMs(b.bestLap);
            });
            io.emit("piloteData", pilotes);
        } catch (error) {
            console.error("Erreur lors de la récupération des données des pilotes :", error);
        }
    };



    sendData();

    socket.on("resetChrono", async () => {
        try {
            // Récupérer tous les pilotes
            const pilotes = await PiloteModel.find();
    
            // Réinitialiser les chronos pour chaque pilote
            for (const pilote of pilotes) {
                pilote.startTime = null;
                pilote.endTime = null;
                pilote.status = "NO";
                pilote.nbrTenv = 0;
                pilote.lastLap = "0.00.000";
                pilote.bestLap = "0.00.000";
                pilote.gap = "-";
                await pilote.save();
            }
    
            // Envoyer les données mises à jour à tous les clients
            const updatedPilotes = await PiloteModel.find();
            io.emit("piloteData", updatedPilotes);
        } catch (error) {
            console.error("Erreur lors de la réinitialisation des chronos :", error);
            socket.emit("error", { message: "Erreur lors de la réinitialisation des chronos" });
        }
    });
    
    socket.on("chronoAction", async (number) => {
        try {
            const pilote = await PiloteModel.findOne({ number });

            if (!pilote) {
                return socket.emit("error", { message: "Pilote introuvable" });
            }


            if (pilote.status == "NO") {
                pilote.startTime = new Date();
                pilote.endTime = null;
                pilote.status = "YES";
                await pilote.save();
                await sendData();
            } else if (pilote.status == "YES") {
                let oldBest = pilote.bestLap;

                pilote.endTime = new Date();
                pilote.status = "NO";
                pilote.nbrTenv += 1;
                pilote.lastLap = calculateTimeGap(pilote.startTime, pilote.endTime);
                pilote.bestLap = getBestTime(pilote.bestLap, pilote.lastLap);

                await pilote.save()
                if (oldBest != pilote.bestLap) {
                    let pilotes = await PiloteModel.find();

                    pilotes = pilotes.sort((a, b) => {
                        const timeToMs = (time) => {
                            if (time === "0.00.000") return Infinity; // Considérer "0.00.000" comme le pire temps
                            const [minutes, seconds, milliseconds] = time.split('.').map(Number);
                            return (minutes * 60000) + (seconds * 1000) + milliseconds;
                        };
                        return timeToMs(a.bestLap) - timeToMs(b.bestLap);
                    });
        
                    // Calculer le gap pour chaque pilote par rapport au premier
                    const firstBestLap = pilotes[0]?.bestLap || "0.00.000";
                    pilotes = pilotes.map(async (pilote, index) => {
                        let gap = "-";
                        if (index === 0 || pilote.bestLap == "0.00.000") {
                            gap = "-"; // Pas de gap pour le premier
                        } else {
                            gap = `+${gapTime(firstBestLap, pilote.bestLap)}`;
                        }
                        if (pilote.gap != gap) {
                            pilote.gap = gap;
                            await pilote.save();
                        }
                        return pilote;
                    });
                    await sendData();
                }
                await sendData();
            } else {
                return socket.emit("error", { message: "Action invalide" });
            }

            
        } catch (error) {
            console.error("Erreur lors de la gestion du chronomètre :", error);
            socket.emit("error", { message: "Erreur interne" });
        }
    });
};