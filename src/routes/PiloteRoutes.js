import express from 'express';
import { PiloteController } from '../controllers/index.js';

const PiloteRouter = express.Router()

PiloteRouter.post("/", PiloteController.addPilote)
PiloteRouter.get("/", PiloteController.getallPilote)

export default PiloteRouter