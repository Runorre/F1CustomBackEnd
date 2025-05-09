import { PiloteModel } from "../models/index.js";

export default {
    addPilote : async (req, res) => {
        try {
            const {number, name} = req.body;

            if (!number || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            const pilote = new PiloteModel({
                number,
                name
            })

            await pilote.save()

            return res.status(201).json({
                success: true,
                message: 'Pilote added successfully',
            });
        } catch (err) {
            console.err(err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },
    getallPilote : async (req, res) => {
        try {
            let pilotes = await PiloteModel.find();
            
            // Trier les pilotes par leur meilleur temps (bestLap)
            pilotes = pilotes.sort((a, b) => {
                const timeToMs = (time) => {
                    const [minutes, seconds, milliseconds] = time.split('.').map(Number);
                    return (minutes * 60000) + (seconds * 1000) + milliseconds;
                };
                return timeToMs(a.bestLap) - timeToMs(b.bestLap);
            });

            return res.status(200).json({
                success: true,
                pilotes
            });
        } catch (err) {
            console.err(err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}