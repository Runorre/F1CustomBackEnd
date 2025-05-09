import { Schema, Types, model } from 'mongoose';

export const PiloteModel = new Schema({
    number: {
        type: Number, // Correction : "type" au lieu de "Types"
        required: true
    },
    name: {
        type: String, // Correction : "type" au lieu de "Types"
        required: true
    },
    bestLap: {
        type: String, // Correction : "type" au lieu de "Types"
        default: "0.00.000"
    },
    gap: {
        type: String, // Correction : "type" au lieu de "Types"
        default: "-"
    },
    lastLap: {
        type: String, // Correction : "type" au lieu de "Types"
        default: "0.00.000"
    },
    status: {
        type: String, // Correction : "type" au lieu de "Types"
        default: "NO"
    },
    nbrTenv: {
        type: Number, // Correction : "type" au lieu de "Types"
        default: 0 // Correction : valeur par défaut en tant que nombre
    },
    startTime: {
        type: Date, // Utilisation du type Date pour stocker le moment où le chrono commence
        default: null // Par défaut, aucune valeur
    },
    endTime: {
        type: Date, // Utilisation du type Date pour stocker le moment où le chrono s'arrête
        default: null // Par défaut, aucune valeur
    }
});

const Pilote = model('Pilote', PiloteModel)
export default Pilote;