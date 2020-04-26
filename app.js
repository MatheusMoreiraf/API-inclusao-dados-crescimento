import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import logger from "morgan";
import progressRouter from "./routes/progressRouter";
import ProgressModel from "./model/progressModel";
import dataProgress from "./data/progress.json";

const app = express();
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on('error', console.error.bind(console, "Erro de conexão. "));

let progress = new ProgressModel(dataProgress);

progress.save(err => {
    if (err) {
        console.error(`Erro ao salvar: ${err}`);
    } else {
        console.log(`Progresso para o usuário ${dataProgress.account.email} criado com sucesso!`);
    }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/progress', progressRouter);

export default app;
