const express = require('express');
const cors = require('cors');
const wppconnect = require('@wppconnect-team/wppconnect');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 5500;
let logado = false

let client = null;

app.use(express.json());
app.use(cors()); 

async function criarCliente() {
    try {
        client = await wppconnect.create({
            session: 'sales',
            statusFind: async (statusSession) => {
                if (statusSession === 'inChat') {
                    console.log('Cliente está pronto para envio.');
                }
            },
        });
        logado = true
        console.log('Cliente criado com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        return false;
    }
}

async function enviartexto(telefone, mensagem) {
    return await client.sendText(telefone + '@c.us', mensagem);
}

async function enviarImg(telefone, imagem, mensagem) {
    return await client
        .sendFileFromBase64(
            telefone + '@c.us',
            imagem,
            mensagem,
            mensagem
        )
        .then((result) => {
            console.log('Result: ', result);
            return true;
        })
        .catch((erro) => {
            console.error('Error when sending: ', erro);
            return false;
        });
}
async function enviarAudio(telefone, audio) {
    return await client
        .sendPtt(telefone + '@c.us', audio)
        .then((result) => {
            console.log('Result: ', result);
            return true; 
        })
        .catch((erro) => {
            console.error('Error when sending: ', erro);
            return false; 
        });
}

app.post('/enviar-mensagem', async (req, res) => {
    const { telefone, mensagem } = req.query;
    if (!telefone || !mensagem) {
        return res.status(400).send('Telefone e mensagem são obrigatórios.');
    }

    try {
        if (!logado) {
            console.log('Cliente não está logado. Tentando criar novo cliente...');
            const criadoComSucesso = await criarCliente();
            if (!criadoComSucesso) {
                console.log('Não foi possível criar o cliente. Abortando envio de mensagem.');
                return res.status(500).send('Erro ao criar cliente.');
            }
        }

        const mensagemEnviada = await enviartexto(telefone, mensagem);
        if (mensagemEnviada) {
            res.send('Mensagem de texto enviada com sucesso!');
        } else {
            res.status(500).send('Erro ao enviar mensagem.');
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).send('Erro interno ao enviar mensagem.');
    }
});

app.post('/enviar-audio', async (req, res) => {
    const { telefone, audio } = req.query;
    if (!telefone || !audio) {
        return res.status(400).send('Telefone e áudio são obrigatórios.');
    }

    try {
        if (!logado) {
            console.log('Cliente não está logado. Tentando criar novo cliente...');
            const criadoComSucesso = await criarCliente();
            if (!criadoComSucesso) {
                console.log('Não foi possível criar o cliente. Abortando envio de mensagem.');
                return res.status(500).send('Erro ao criar cliente.');
            }
        }

        const audioEnviado = await enviarAudio(telefone, audio);
        if (audioEnviado) {
            res.send('Áudio enviado com sucesso!');
        } else {
            res.status(500).send('Erro ao enviar áudio.');
        }
    } catch (error) {
        console.error('Erro ao enviar áudio:', error);
        res.status(500).send('Erro interno ao enviar áudio.');
    }
});

app.post('/enviar-imagem', async (req, res) => {
    const { telefone, imagem, mensagem } = req.query;
    if (!telefone || !imagem || !mensagem) {
        return res.status(400).send('Telefone, imagem e mensagem são obrigatórios.');
    }

    try {
        if (!logado) {
            console.log('Cliente não está logado. Tentando criar novo cliente...');
            const criadoComSucesso = await criarCliente();
            if (!criadoComSucesso) {
                console.log('Não foi possível criar o cliente. Abortando envio de mensagem.');
                return res.status(500).send('Erro ao criar cliente.');
            }
        }

        const imagemEnviada = await enviarImg(telefone, imagem, mensagem);
        if (imagemEnviada) {
            res.send('Imagem enviada com sucesso!');
        } else {
            res.status(500).send('Erro ao enviar imagem.');
        }
    } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        res.status(500).send('Erro interno ao enviar imagem.', error);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor na porta ${PORT}`);
});
