var express = require('express');
/* requisição do serviço que realmente calcula a simulação */
var router = express.Router();
var fs = require('fs');
const path = require('path');

/* Confirmar se este GET é necessário */
router.get('/', function(req, res, next) {
  res.status(200);
  console.log('EXPORT');
  //res.send({texto: "testando o get"});
  res.download('./public/teste.json');
});

router.post('/', async function(req, res, next) {
  /* recebimento do body do front end */
  let body = req.body;
  let arqRetorno;

  console.log('BODY: ', body);

  let dados = JSON.stringify(body);
  await fs.writeFile('./public/teste.json', dados, erro => {
    let fileLocation = path.join('./public', 'teste.json');
    console.log('Renata: ', fileLocation);
    res.download(fileLocation, 'teste.json');
  });

});

module.exports = router;
