const express = require('express');
const cors = require('cors');
const wppconnect = require('@wppconnect-team/wppconnect');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 5500;

let client = null;

app.use(express.json());
app.use(cors()); // Adiciona o middleware do CORS

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
        console.log('Cliente criado com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        return false;
    }
}

async function enviarMensagem(telefone, mensagem) {
    try {
        if (!client) {
            console.log('Cliente não está logado. Tentando criar novo cliente...');
            const criadoComSucesso = await criarCliente();
            if (!criadoComSucesso) {
                console.log('Não foi possível criar o cliente. Abortando envio de mensagem.');
                return false;
            }
        }

        const res = await enviartexto(telefone, mensagem);
        if (res) {
            console.log(res);
            return true;
        } else {
            console.log('Mensagem não enviada!');
            return false;
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return false;
    }
}

async function enviartexto(telefone, mensagem) {
    return await client.sendText(telefone + '@c.us', mensagem);
}

app.post('/enviar-mensagem', async (req, res) => {
    const { telefone, mensagem } = req.query;
    if (!telefone || !mensagem) {
        return res.status(400).send('Telefone e mensagem são obrigatórios.');
    }

    const mensagemEnviada = await enviarMensagem(telefone, mensagem);

    if (mensagemEnviada) {
        res.send('Mensagem enviada com sucesso!');
    } else {
        res.status(500).send('Erro ao enviar mensagem.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor na porta ${PORT}`);
});
