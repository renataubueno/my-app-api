var express = require('express');
/* requisição do serviço que realmente calcula a simulação */
var serviceSimulacao = require('../services/simulacaoService');
var router = express.Router();

/* Confirmar se este GET é necessário */
router.get('/', function(req, res, next) {
  res.status(200);
  res.send(serviceSimulacao.simulacaoGET());
});

router.post('/', function(req, res, next) {
  /* recebimento do body do front end, com as informações necessárias para calcular a simulação */
  let body = req.body;

  /* primeiro é feita a validação dos dados recebidos */
  /* apesar de já ser feita uma validação no front, devemos conferir se os mesmos dados são recebidos no back end */
  if(validar(body)){
    console.log('BODY: ', body);
    let result = serviceSimulacao.simulacaoPOST(body);
    console.log('RETORNO: ', result);
    res.send(result);
  } else {
    console.log('Erro na Validação do Back End');
    res.status(400);
    res.jsonp('Erro na validação do back end');
  }
});

/* Função para fazer a validação de alguns dados que chegam no back end */
function validar(dado){
  /* Verifica se os dados recebidos não estão nulos ou vazios */
  if(dado.objSimulacao.length === 0 || dado.seeder === null || dado.condParada === null || dado.tipoParada === null){
    return false;
  } else {
    return true;
  }
}

module.exports = router;
