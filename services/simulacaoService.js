var random = require('random');
var seedrandom = require('seedrandom');

let numChegadasMax = 0;
let tempoMax = 0;
//criar as variaveis de retorno: numChegadas e numAtendimentos
let numChegadas = 0;
let numAtendimentos = 0;

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

exports.simulacaoPOST = dados => {
  let resultado = '';
  let fila = dados.objSimulacao.filter(item => item.tipo === 'UNIFORME');

  let seed = dados.seeder;

  if(dados.tipoParada === 'CHEGADAS'){
    numChegadasMax = dados.condParada;
  } else {
    tempoMax = dados.condParada;
  }

  let filaRetorno = [];

  console.log('ANTES DE ENTRAR NA SIMULACAO');
  if(dados.tipoParada === 'CHEGADAS'){
    fila.forEach(item => {
      filaRetorno.push(tratamentoCondParadaChegadas(item, numChegadasMax, seed));
    });
    return filaRetorno;
  } else {
    fila.forEach(item => {
      filaRetorno.push(tratamentoCondParadaTempo(item, tempoMax, seed));
    });
    return filaRetorno;
  }
}

function tratamentoCondParadaChegadas(fila, numChegadasMax, seed){
  let resultado = simulacaoSimplesChegada(fila, numChegadasMax, seed);

  let numChegadas = resultado.numChegadas;
  let numAtendimentos = resultado.numAtendimentos;
  let tempoOcupada = resultado.tempoOcupada;
  let tempoTotal = resultado.tempoTotal;
  let probEstadosFila = resultado.probEstadosFila;
  let taxaChegada = calculaTaxaChegada(numChegadas, tempoTotal);
  let vazao = calculaVazao(tempoOcupada, tempoTotal);
  let utilizacao = calculaUtilizacao(numAtendimentos, tempoTotal);
  let tempoMedioServico = calculaTempoMedioServico(numAtendimentos, tempoOcupada);
  let probabilidadesEstadosFila = calculaProbabilidadesEstadosFila(tempoTotal, probEstadosFila);

  return {
      id: fila.id, //id da fila
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

function tratamentoCondParadaTempo(fila, tempoMax, seed){
  let resultado = simulacaoSimplesTempo(fila, tempoMax, seed);

  let numChegadas = resultado.numChegadas;
  let numAtendimentos = resultado.numAtendimentos;
  let tempoOcupada = resultado.tempoOcupada;
  let tempoTotal = resultado.tempoTotal;
  let probEstadosFila = resultado.probEstadosFila;
  let taxaChegada = calculaTaxaChegada(numChegadas, tempoTotal);
  let vazao = calculaVazao(tempoOcupada, tempoTotal);
  let utilizacao = calculaUtilizacao(numAtendimentos, tempoTotal);
  let tempoMedioServico = calculaTempoMedioServico(numAtendimentos, tempoOcupada);
  let probabilidadesEstadosFila = calculaProbabilidadesEstadosFila(tempoTotal, probEstadosFila);

  return {
      id: fila.id, //id da fila
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

function simulacaoSimplesTempo(fila, tempoMax, seed){
  console.log('NA SIMULACAO');

  random.use(seedrandom(seed));
  let numAleatorio = geraAleatorio();
  let agendaChegada = 0;
  let agendaSaida = 0;
  //tenho que pegar todas as infos que preciso dos objetos e salvar em objetos locais
  let minChegada = fila.minChegada;
  let maxChegada = fila.maxChegada;
  let minServico = fila.minServico;
  let maxServico = fila.maxServico;
  let capacidade = fila.capacidade;
  let servidores = fila.servidores;
  let entrada = fila.chegadas.filter(item => item.origem === 'Entrada');
  let chegada = parseInt(entrada[0].chegada);
  //criar variável de controle pra quantidade de usuários na fila e que já tenham sido atendidos (agendada a saida)
  fila.probabilidadesEstadosFila = Array(capacidade+1);
  let momentoAnterior = 0;
  let momentoAtual = 0;
  //reiniciar o escalonador
  fila.escalonador = [];
  fila.escalonador.push({
    momento: chegada,
    tipo: 'CHEGADA'});
  fila.condicaoFila = 0;
  numChegadas = 0;
  numAtendimentos = 0;

  /* Algoritmo da simulação */
  while(fila.escalonador.length !== 0 && momentoAnterior < tempoMax){
    console.log('ESCALONADOR', fila.escalonador);
    let next = fila.escalonador[0];
    fila.escalonador.splice(0, 1);
    /* Aqui começa o agendaChegada */
    if(next.tipo === 'CHEGADA'){
      //verificar quanto tempo a fila ficou com capacidade = 0, 1, 2...
      nextMomento = next.momento;
      momentoAtual = nextMomento - momentoAnterior;
      momentoAnterior = nextMomento;
      numChegadas++;

      agendarChegada(fila, capacidade, servidores, momentoAtual, nextMomento, minServico, maxServico, minChegada, maxChegada);

    /* Aqui começa o agendaSaida */
    } else {
      nextMomento = next.momento;
      momentoAtual = nextMomento - momentoAnterior;
      momentoAnterior = nextMomento;

      agendarSaida(fila, servidores, momentoAtual, nextMomento, minServico, maxServico);
    }
  }

  let tempoTotal = momentoAnterior;
  let tempoOcupada = momentoAnterior - fila.probabilidadesEstadosFila[0];
  console.log('PROBABILIDADE DE ESTADOS DA FILA - FINAL: ', fila.probabilidadesEstadosFila);

  return {
    numChegadas: numChegadas,
    numAtendimentos: numAtendimentos,
    tempoOcupada: tempoOcupada,
    tempoTotal: tempoTotal,
    probEstadosFila: fila.probabilidadesEstadosFila
  };
}

function simulacaoSimplesChegada(fila, numChegadasMax, seed){
  console.log('NA SIMULACAO');

  random.use(seedrandom(seed));
  let numAleatorio = geraAleatorio();
  let agendaChegada = 0;
  let agendaSaida = 0;
  //tenho que pegar todas as infos que preciso dos objetos e salvar em objetos locais
  let minChegada = fila.minChegada;
  let maxChegada = fila.maxChegada;
  let minServico = fila.minServico;
  let maxServico = fila.maxServico;
  let capacidade = fila.capacidade;
  let servidores = fila.servidores;
  let entrada = fila.chegadas.filter(item => item.origem === 'Entrada');
  let chegada = parseInt(entrada[0].chegada);
  //criar variável de controle pra quantidade de usuários na fila e que já tenham sido atendidos (agendada a saida)
  fila.probabilidadesEstadosFila = Array(capacidade+1);
  let momentoAnterior = 0;
  let momentoAtual = 0;
  //reiniciar o escalonador
  fila.escalonador = [];
  fila.escalonador.push({
    momento: chegada,
    tipo: 'CHEGADA'});
  fila.condicaoFila = 0;
  numChegadas = 0;
  numAtendimentos = 0;

  /* Algoritmo da simulação */
  while(fila.escalonador.length !== 0 && numChegadas < numChegadasMax){
    console.log('ESCALONADOR', fila.escalonador);

    let next = fila.escalonador[0];
    fila.escalonador.splice(0, 1);
    /* Aqui começa o agendaChegada */
    if(next.tipo === 'CHEGADA'){
      //verificar quanto tempo a fila ficou com capacidade = 0, 1, 2...
      nextMomento = next.momento;
      momentoAtual = nextMomento - momentoAnterior;
      momentoAnterior = nextMomento;

      numChegadas++;
      if(numChegadas === numChegadasMax){
        break;
      }
      console.log('TENTANDO AGENDAR CHEGADA');
      agendarChegada(fila, capacidade, servidores, momentoAtual, nextMomento, minServico, maxServico, minChegada, maxChegada);



    /* Aqui começa o agendaSaida */
    } else {
      nextMomento = next.momento;
      momentoAtual = nextMomento - momentoAnterior;
      momentoAnterior = nextMomento;

      agendarSaida(fila, servidores, momentoAtual, nextMomento, minServico, maxServico);
    }
  }

  let tempoTotal = momentoAnterior;
  let tempoOcupada = momentoAnterior - fila.probabilidadesEstadosFila[0];
  console.log('PROBABILIDADE DE ESTADOS DA FILA - FINAL: ', fila.probabilidadesEstadosFila);

  return {
    numChegadas: numChegadas,
    numAtendimentos: numAtendimentos,
    tempoOcupada: tempoOcupada,
    tempoTotal: tempoTotal,
    probEstadosFila: fila.probabilidadesEstadosFila
  };
}

function geraAleatorio(){
  let numAleatorio = random.float(min = 0, max = 1);
  random.next();

  return numAleatorio;
}

function uniforme(min, max){
  let numAleatorio = geraAleatorio();
  return (max - min) * numAleatorio + min;
}

function agendarChegada(fila, capacidade, servidores, momentoAtual, nextMomento, minServico, maxServico, minChegada, maxChegada){
  if(fila.probabilidadesEstadosFila[fila.condicaoFila] === undefined){
    fila.probabilidadesEstadosFila[fila.condicaoFila] = momentoAtual;
  } else {
    fila.probabilidadesEstadosFila[fila.condicaoFila] = fila.probabilidadesEstadosFila[fila.condicaoFila] + momentoAtual;
  };

  if(fila.condicaoFila < capacidade){
    fila.condicaoFila++;
    if(fila.condicaoFila <= servidores){
      let agendaSaida = nextMomento + uniforme(minServico, maxServico);

      if(fila.escalonador.length === 0){
        fila.escalonador.push({
          momento: agendaSaida,
          tipo: 'SAIDA'
        });
      } else {
        for(let i = 0; i < fila.escalonador.length; i++){
          if(fila.escalonador.length === i+1 && fila.escalonador[i].momento < agendaSaida){
            fila.escalonador.push({
              momento: agendaSaida,
              tipo: 'SAIDA'
            });
            break;
          } else if(fila.escalonador[i].momento > agendaSaida){
            fila.escalonador.splice(i, 0, {momento: agendaSaida, tipo: 'SAIDA'});
            break;
          }
        }
      }
    };
  };

  let agendaChegada =  nextMomento + uniforme(minChegada, maxChegada);

  if(fila.escalonador.length === 0){
    fila.escalonador.push({
      momento: agendaChegada,
      tipo: 'CHEGADA'});
  } else {
    for(let i = 0; i < fila.escalonador.length; i++){
      if(fila.escalonador.length === i+1 && fila.escalonador[i].momento < agendaChegada){
        fila.escalonador.push({
          momento: agendaChegada,
          tipo: 'CHEGADA'});
        break;
      } else if(fila.escalonador[i].momento > agendaChegada){
        fila.escalonador.splice(i, 0, {momento: agendaChegada,tipo: 'CHEGADA'});
        break;
      }
    }
  }

  return true;
}

function agendarSaida(fila, servidores, momentoAtual, nextMomento, minServico, maxServico){
  if(fila.probabilidadesEstadosFila[fila.condicaoFila] === undefined){
    fila.probabilidadesEstadosFila[fila.condicaoFila] = momentoAtual;
  } else {
    fila.probabilidadesEstadosFila[fila.condicaoFila] = fila.probabilidadesEstadosFila[fila.condicaoFila] + momentoAtual;
  }

  numAtendimentos++;
  fila.condicaoFila--;
  if(fila.condicaoFila >= servidores){
    agendaSaida = nextMomento + uniforme(minServico, maxServico);

    if(fila.escalonador.length === 0){
      fila.escalonador.push({
        momento: agendaSaida,
        tipo: 'SAIDA'
        });
    } else {
      for(let i = 0; i < fila.escalonador.length; i++){
        if(fila.escalonador.length === i+1 && fila.escalonador[i].momento < agendaSaida){
          fila.escalonador.push({
            momento: agendaSaida,
            tipo: 'SAIDA'
          });
          break;
        } else if(fila.escalonador[i].momento > agendaSaida){
          fila.escalonador.splice(i, 0, {momento: agendaSaida, tipo: 'SAIDA'});
          break;
          }
      }
    }
  }
  return true;
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
    console.log('QUAL O VALOR DO probEstadosFila[i]? ', probEstadosFila[i]);
    if(probEstadosFila[i] === undefined) {
      console.log('ENTREI NO CASO DO UNDEFINED');
      x = 0;
    } else {
      x = (probEstadosFila[i] * 100)/tempoTotal;
    }
    probEstadosFilaTratado.push(x);
  }

  console.log('PROBABILIDADE ESTADO TRATADO', probEstadosFilaTratado);
  return probEstadosFilaTratado;
}
