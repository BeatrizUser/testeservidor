const express = require('express');
const cors = require('cors');
const wppconnect = require('@wppconnect-team/wppconnect');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json());
app.use(cors()); // Adiciona o middleware do CORS

async function enviarMensagem(telefone, mensagem) {
  try {
    const client = await wppconnect.create({
      session: 'sales',
      statusFind: async (statusSession) => {
        if (statusSession === 'inChat') {
            console.log('Cliente está Pronto pro envio.');
            const res = await client.sendText(telefone + '@c.us', mensagem);
            if(res){
              console.log('Mensagem enviada com sucesso!');
              enviado = true;
            }else{
              console.log('Mensagem não enviada!');
              enviado = false;
            }
        }
      },
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return false;
  }
}

app.post('/enviar-mensagem', async (req, res) => {
  const { telefone, mensagem } = req.query;
  if (!telefone || !mensagem) {
    return res.status(400).send('Telefone e mensagem são obrigatórios.');
  }
  await enviarMensagem(telefone, mensagem);

  if (enviarMensagem) {
    res.send('Mensagem enviada com sucesso!');
  } else {
    res.status(500).send('Erro ao enviar mensagem.');
  }
});


app.listen(PORT, () => {
  console.log(`Servidor na porta ${PORT}`);
});

