import express from "express";
import ProgressModel from "../model/progressModel";
import jwt from "jsonwebtoken";

const progressRouter = express.Router();

progressRouter.route("/").get((req, resp) => {
    try {
        let token = req.headers['token'];
        if (token) {
            jwt.verify(token, process.env.SECRET, function (err, decoded) {
                if (err) {
                    status401(resp);
                } else if (decoded) {
                    ProgressModel.find({}, (err, progress) => {
                        if (err) {
                            status400(resp, err);
                        } else {
                            status200(resp, progress);
                        }
                    });
                }
            });
        } else {
            status401(resp);
        }
    } catch (error) {
        status500(resp, error);
    }
}).post((req, resp) => {
    try {
        let token = req.headers['token'];
        if (token) {
            jwt.verify(token, process.env.SECRET, function (err, decoded) {
                if (err) {
                    status401(resp);
                } else if (decoded) {
                    let progress = new ProgressModel(req.body);
                    progress.save(err => {
                        if (err) {
                            status400(resp, err);
                        } else {
                            status201(resp, progress);
                        }
                    });
                }
            })
        } else {
            status401(resp);
        }
    } catch (error) {
        status500(resp, error);
    }
});

progressRouter.use("/:id", (req, resp, next) => {
    try {
        let token = req.headers['token'];
        if (token) {
            jwt.verify(token, process.env.SECRET, function (err, decoded) {
                if (err) {
                    status401(resp);
                } else if (decoded) {
                    ProgressModel.findById(req.params.id, (err, progress) => {
                        if (err) {
                            status400(resp, err);
                        } else if (!progress) {
                            status404(resp, req.params.id);
                        } else {
                            req.progress = progress;
                            next();
                        }
                    });
                }
            })
        } else {
            status401(resp);
        }
    } catch (error) {
        status500(resp, error);
    }
});
progressRouter.route("/:id").get((req, resp) => {
    status200(resp, req.progress);
}).put((req, resp) => {
    req.progress.height = req.body.height;
    req.progress.weight = req.body.weight;
    req.progress.weight = req.body.weight;
    req.progress.headCircumference = req.body.headCircumference;
    req.progress.dataProgress = req.body.dataProgress;

    req.progress.account.id = req.body.account.id;
    req.progress.account.firstName = req.body.account.firstName;
    req.progress.account.lastName = req.body.account.lastName;
    req.progress.account.email = req.body.account.email;
    req.progress.account.dateBirth = req.body.account.dateBirth;
    req.progress.account.gender = req.body.account.gender;

    req.progress.save(err => {
        if (err) {
            status400(resp, err);
        } else {
            status202(resp);
        }
    });
}).delete((req, resp) => {
    req.progress.remove(err => {
        if (err) {
            status400(resp, err);
        } else {
            status204(resp);
        }
    });
});


function status200(resp, data) {
    resp.statusMessage = "OK";
    resp.status(200).json(data);
}

function status201(resp, data) {
    resp.statusMessage = "Criado";
    resp.status(201).json(data);
}

function status202(resp) {
    resp.statusMessage = "Aceito";
    resp.status(202).send("");
}

function status204(resp) {
    resp.statusMessage = "Sem conteúdo";
    resp.status(204).send("");
}

function status400(resp, err) {
    console.error(`Erro ao salvar: ${err}`);
    resp.statusMessage = "Bad request";
    resp.status(400).json({
        'codigo': '3',
        'mensagem': 'Dados request enviados incorretos'
    });
}

function status401(resp) {
    resp.statusMessage = "Unauthorized";
    resp.status(401).json({
        'codigo': '2',
        'mensagem': 'Token invalido, inexistente ou expirado'
    });
}

function status404(resp, id) {
    resp.statusMessage = "Not found";
    resp.status(404).json({
        'codigo': '4',
        'mensagem': `Recurso ${id} não encontrado`
    });
}

function status500(resp, error) {
    console.error(error);
    resp.statusMessage = "Internal error";
    resp.status(500).json({
        'codigo': '1',
        'mensagem': 'Erro no servidor'
    });
}

export default progressRouter;