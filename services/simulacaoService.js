var random = require('random');
var seedrandom = require('seedrandom');

let escalonador = [];
let numChegadasMax = 0;
let tempoMax = 0;

exports.simulacaoGET = function () {
  return {
      id: 1,
      numChegadas: "Abacaxi",
      numAtendimentos: "B",
      tempoOcupada: "C",
      taxaChegada: "A/T",
      vazao: "C/T",
      Utilizacao: "B/T",
      tempoMedioServico: "B/C"
  };
}

exports.simulacaoPOST = function (dados) {
  let fila = dados.objSimulacao.filter(item => item.tipo === 'UNIFORME');
  let entrada = dados.objSimulacao.filter(item => item.tipo === 'ENTRADA');
  let saida = dados.objSimulacao.filter(item => item.tipo === 'SAIDA');

  let seed = dados.seeder;

  if(dados.tipoParada === 'CHEGADAS'){
    numChegadasMax = dados.condParada;
  } else {
    tempoMax = dados.condParada;
  }


  console.log('ANTES DE ENTRAR NA SIMULACAO');
  let resultado = simulacao(fila, entrada, numChegadasMax, seed);
  console.log('DEPOIS DE ENTRAR NA SIMULACAO');

  let numChegadas = resultado.numChegadas;
  let numAtendimentos = resultado.numAtendimentos;
  let tempoOcupada = resultado.tempoOcupada;
  let tempoTotal = resultado.tempoTotal;
  let probEstadosFila = resultado.probEstadosFila;
  let taxaChegada = calculaTaxaChegada(numChegadas, tempoTotal);
  let vazao = calculaVazao(tempoOcupada, tempoTotal);
  let utilizacao = calculaUtilizacao(numAtendimentos, tempoTotal);
  let tempoMedioServico = calculaTempoMedioServico(numAtendimentos, tempoOcupada);
  let probabilidadesEstadosFila = calculaProbabilidadesEstadosFila(tempoTotal, probEstadosFila)

  return {
      id: fila[0].id, //id da fila
      numChegadas: numChegadas,
      numAtendimentos: numAtendimentos,
      tempoOcupada: tempoOcupada,
      taxaChegada: taxaChegada,
      vazao: vazao,
      utilizacao: utilizacao,
      tempoMedioServico: tempoMedioServico,
      probabilidadesEstadosFila: probabilidadesEstadosFila
  };
}

function simulacao(fila, entrada, numChegadasMax, seed){
  console.log('NA SIMULACAO');

  return {
    numChegadas: 10,
    numAtendimentos: 12,
    tempoOcupada: 13,
    tempoTotal: 11,
    probEstadosFila: [1, 2, 3, 4]
  };
}

function geraAleatorio(){
  let numAleatorio = random.float(min = 0, max = 1);
  random.next();

  return numAleatorio;
}

function uniforme(min, max){
  let numAleatorio = geraAleatorio();
  //console.log('MIN RECEBIDO: ', min);
  //console.log('MAX RECEBIDO: ', max );
  //console.log('numAleatorio: ', numAleatorio);
  return (max - min) * numAleatorio + min;
}

function calculaTaxaChegada(numChegadas, tempoTotal){
  return numChegadas/tempoTotal;
}

function calculaUtilizacao(numAtendimentos, tempoTotal){
  return numAtendimentos/tempoTotal;
}

function calculaTempoMedioServico(numAtendimentos, tempoOcupada){
  return numAtendimentos/tempoOcupada;
}

function calculaVazao(tempoOcupada, tempoTotal){
  return tempoOcupada/tempoTotal;
}

function calculaProbabilidadesEstadosFila(tempoTotal, probEstadosFila){
  let probEstadosFilaTratado = [];
  let x = 0;

  for(let i = 0; i < probEstadosFila.length; i++){
    x = (probEstadosFila[i] * 100)/tempoTotal;
    probEstadosFilaTratado.push(x);
  }

  console.log('PROBABILIDADE ESTADO TRATADO', probEstadosFilaTratado);
  return probEstadosFilaTratado;
}
