const express = require("express");
const app = express();
const bodyParser = require("body-parser");

    // MODELS (tabelas do Banco de Dados)
        const Pergunta = require("./database/models/Pergunta");
        const Resposta = require("./database/models/Resposta");
    // CONEXÃO COM BANCO DE DADOS
        const connection = require('./database/database');
        connection.authenticate().then(() => {
            console.log("Conexão feito com sucesso!");
        }).catch((err) => {
            console.log(`Erro ao se conectar! ${err}`);
        });
    // CONFIGURANDO TEMPLATE ENGINE
        app.set('view engine','ejs');
    // CONFIGURANDO ARQUIVOS ESTÁTICOS
        app.use(express.static('public'));
    // CONFIGURANDO O BODY-PARSER
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());


// ROTAS
app.get("/", (req, res) => {
    Pergunta.findAll({ raw: true, order: [
        ['id','DESC'] // Estou ordenando as perguntas para ficarem na ordem decrescente
        // ASC = crescente
        // DESC = decrecente
    ] }).then(perguntas => {
    // raw significa "cru", diz que só é pra listar as perguntas e nada mais
        res.render("home", {
            perguntas: perguntas,
        });
    });
});

app.get("/perguntar", (req, res) => {
    res.render("perguntar");
});

app.post("/salvarpergunta", (req, res) => {
    Pergunta.create({
        titulo: req.body.titulo,
        descricao: req.body.descricao,
    }).then(() => {
        res.redirect("/");
    }).catch((err) => {
        console.log(`Erro ao criar pergunta no Banco de Dados! ${err}`);
        res.redirect("/404");
    });
});

app.get("/pergunta/:id", (req, res) => {
    let id = req.params.id;
    Pergunta.findOne({
        where: { id: id },
        // Aqui eu estou dizendo pro meu MySQL que eu quero buscar uma pergunta que tenha o id igual o id passado nos params
    }).then(pergunta => {
        if(pergunta != undefined || pergunta != null){
            Resposta.findAll({
                where: { perguntaId: pergunta.id },
                // Aqui estou dizendo pra achar todas as respostas de uma respectiva pergunta
                raw: true,
                order: [
                    ['id', 'DESC']
                ]
            }).then(respostas => {
                res.render("pergunta", {
                    pergunta: pergunta,
                    respostas: respostas,
                });
            });
        }else{
            res.redirect("/");
        }
    });
});

app.post("/responder", (req, res) => {
    Resposta.create({
        corpo: req.body.corpo,
        perguntaId: req.body.perguntaId,
    }).then(() => {
        res.redirect(`/pergunta/${req.body.perguntaId}`);
    });
});




app.get("/404", (req, res) => {
    res.send("Erro na aplicação! Verifique o código fonte!")
});

// RODANDO A APLICAÇÃO...
const PORTA = 8088;
app.listen(PORTA, (err) => {
    if(err){
        console.log(`Houve um erro na aplicação! ${err}`);
    }else{
        console.log(`Servidor rodando na porta ${PORTA}...`);
    }
});