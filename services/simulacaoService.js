var random = require('random');
var seedrandom = require('seedrandom');

let numChegadasMax = 0;
let tempoMax = 0;
//criar as variaveis de retorno: numChegadas e numAtendimentos
let numChegadasGlobal = 0;
let numAtendimentosGlobal = 0;
let escalonadorGlobal = [];
let momentoAnterior = 0;
let momentoAtual = 0;

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
    numChegadasGlobal = 0;
    numAtendimentosGlobal = 0;
    momentoAnterior = 0;
    momentoAtual = 0;
    escalonadorGlobal = [];

    for(let i = 0; i < fila.length; i++){
      fila[i].probabilidadesEstadosFila = Array(fila[i].capacidade+1);
    };
    fila

    /* Todas as filas com entradas externas */
    let temEntrada = fila.filter(item => item.chegadas.filter(obj => obj.origem === 'Entrada'));
    for(let i = 0; i < temEntrada.length; i++){
      for(let j = 0; j < temEntrada[i].chegadas.length; j++){
        if(temEntrada[i].chegadas[j].origem === 'Entrada'){
          escalonadorGlobal.push({
            fila: temEntrada[i],
            momento: parseInt(temEntrada[i].chegadas[j].chegada),
            tipo: 'CHEGADA'
          });
        };
      };
    };

    while(escalonadorGlobal.length !== 0 && numChegadasGlobal < numChegadasMax){
      let nextFila = escalonadorGlobal[0].fila;
      console.log('probabilidadesEstadosFila LOGO NO INICIO! ', nextFila.probabilidadesEstadosFila);
      let resultadoSimulacao = tratamentoCondParadaChegadas(nextFila, numChegadasMax, seed);
      //if(resultadoSimulacao.id === nextFila.id)
      let jaExiste = filaRetorno.filter(item => item.id === resultadoSimulacao.id);
      if(jaExiste.length > 0){
        for(let i = 0; i < filaRetorno.length; i++){
          if(filaRetorno[0].id === nextFila.id){
            filaRetorno.splice(i, 1);
            filaRetorno.push(resultadoSimulacao);
            break;
          }
        }
      } else {
        filaRetorno.push(resultadoSimulacao);
      }
    }

    return filaRetorno;
  } else {
    numChegadasGlobal = 0;
    numAtendimentosGlobal = 0;
    escalonadorGlobal = [];

    /* Todas as filas com entradas externas */
    let temEntrada = fila.filter(item => item.chegadas.filter(obj => obj.origem === 'Entrada'));
    for(let i = 0; i < temEntrada.length; i++){
      for(let j = 0; j < temEntrada[i].chegadas.length; j++){
        if(temEntrada[i].chegadas[j].origem === 'Entrada'){
          escalonadorGlobal.push({
            idFila: temEntrada[i].id,
            momento: parseInt(temEntrada[i].chegadas[j].chegada),
            tipo: 'CHEGADA'
          });
        };
      };
    };

    fila.forEach(item => {
      filaRetorno.push(tratamentoCondParadaTempo(item, tempoMax, seed));
    });
    return filaRetorno;
  }
}

function tratamentoCondParadaChegadas(fila, numChegadasMax, seed){
  let resultado = simulacaoChegada(fila, numChegadasMax, seed);

  let numChegadas = fila.numChegadas;
  let numAtendimentos = fila.numAtendimentos;
  let tempoOcupada = fila.tempoOcupada;
  let tempoTotal = fila.tempoTotal;
  let probEstadosFila = fila.probabilidadesEstadosFila;

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
  let resultado = simulacaoTempo(fila, tempoMax, seed);
  console.log('RESULTADO: ', true);

  let numChegadas = fila.numChegadas;
  let numAtendimentos = fila.numAtendimentos;
  let tempoOcupada = fila.tempoOcupada;
  let tempoTotal = fila.tempoTotal;
  let probEstadosFila = fila.probabilidadesEstadosFila;

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

function simulacaoTempo(fila, tempoMax, seed){
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

  /* Algoritmo da simulação */
  while(escalonadorGlobal.length !== 0 && momentoAnterior < tempoMax){
    console.log('ESCALONADOR', escalonadorGlobal);
    let next = escalonadorGlobal[0];
    escalonadorGlobal.splice(0, 1);
    /* Aqui começa o agendaChegada */
    if(next.tipo === 'CHEGADA'){
      //verificar quanto tempo a fila ficou com capacidade = 0, 1, 2...
      nextMomento = next.momento;
      momentoAtual = nextMomento - momentoAnterior;
      momentoAnterior = nextMomento;

      fila.numChegadas++;
      numChegadasGlobal++;

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

  fila.tempoOcupada = tempoOcupada;
  fila.tempoTotal = tempoTotal;

  return true;
}

function simulacaoChegada(fila, numChegadasMax, seed){
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

  console.log('ESCALONADOR', escalonadorGlobal);

  let next = escalonadorGlobal[0];
  escalonadorGlobal.splice(0, 1);

  nextMomento = next.momento;
  momentoAtual = nextMomento - momentoAnterior;
  momentoAnterior = nextMomento;
  console.log('MOMENTO ATUAL LOGO NO INICIO: ', momentoAtual);
  console.log('MOMENTO ANTERIOR LOGO NO INICIO: ', momentoAnterior);

  if(next.tipo === 'CHEGADA'){
    next.fila.numChegadas++;
    numChegadasGlobal++;
    console.log('TENTANDO AGENDAR CHEGADA');
    agendarChegada(fila, capacidade, servidores, momentoAtual, nextMomento, minServico, maxServico, minChegada, maxChegada);
  } else {
    agendarSaida(fila, servidores, momentoAtual, nextMomento, minServico, maxServico);
  }

  let tempoTotal = momentoAnterior;
  let tempoOcupada = momentoAnterior - fila.probabilidadesEstadosFila[0];
  console.log('TEMPO TOTAL: ', tempoTotal);
  console.log('TEMPO OCUPADA: ', tempoOcupada);
  console.log('PROBABILIDADE DE ESTADOS DA FILA - FINAL: ', fila.probabilidadesEstadosFila);

  fila.tempoOcupada = tempoOcupada;
  fila.tempoTotal = tempoTotal;
  /* Algoritmo da simulação
  while(escalonadorGlobal.length !== 0 && numChegadasGlobal < numChegadasMax){
    console.log('ESCALONADOR', escalonadorGlobal);

    let next = escalonadorGlobal[0];
    escalonadorGlobal.splice(0, 1);
    /* Aqui começa o agendaChegada
    if(next.tipo === 'CHEGADA'){
      //verificar quanto tempo a fila ficou com capacidade = 0, 1, 2...
      nextMomento = next.momento;
      momentoAtual = nextMomento - momentoAnterior;
      momentoAnterior = nextMomento;

      fila.numChegadas++;
      numChegadasGlobal++;
      if(numChegadasGlobal === numChegadasMax){
        break;
      }
      console.log('TENTANDO AGENDAR CHEGADA');
      agendarChegada(fila, capacidade, servidores, momentoAtual, nextMomento, minServico, maxServico, minChegada, maxChegada);
    /* Aqui começa o agendaSaida
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

  fila.tempoOcupada = tempoOcupada;
  fila.tempoTotal = tempoTotal;
  */

  return true;
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

      if(escalonadorGlobal.length === 0){
        escalonadorGlobal.push({
          fila: fila,
          momento: agendaSaida,
          tipo: 'SAIDA'
        });
      } else {
        for(let i = 0; i < escalonadorGlobal.length; i++){
          if(escalonadorGlobal.length === i+1 && escalonadorGlobal[i].momento < agendaSaida){
            escalonadorGlobal.push({
              fila: fila,
              momento: agendaSaida,
              tipo: 'SAIDA'
            });
            break;
          } else if(escalonadorGlobal[i].momento > agendaSaida){
            escalonadorGlobal.splice(i, 0, {fila: fila, momento: agendaSaida, tipo: 'SAIDA'});
            break;
          }
        }
      }
    };
  };

  let agendaChegada =  nextMomento + uniforme(minChegada, maxChegada);

  if(escalonadorGlobal.length === 0){
    escalonadorGlobal.push({
      fila: fila,
      momento: agendaChegada,
      tipo: 'CHEGADA'});
  } else {
    for(let i = 0; i < escalonadorGlobal.length; i++){
      if(escalonadorGlobal.length === i+1 && escalonadorGlobal[i].momento < agendaChegada){
        escalonadorGlobal.push({
          fila: fila,
          momento: agendaChegada,
          tipo: 'CHEGADA'});
        break;
      } else if(escalonadorGlobal[i].momento > agendaChegada){
        escalonadorGlobal.splice(i, 0, {fila: fila, momento: agendaChegada, tipo: 'CHEGADA'});
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

  fila.numAtendimentos++;
  numAtendimentosGlobal++;
  fila.condicaoFila--;
  if(fila.condicaoFila >= servidores){
    agendaSaida = nextMomento + uniforme(minServico, maxServico);

    if(escalonadorGlobal.length === 0){
      escalonadorGlobal.push({
        fila: fila,
        momento: agendaSaida,
        tipo: 'SAIDA'
        });
    } else {
      for(let i = 0; i < escalonadorGlobal.length; i++){
        if(escalonadorGlobal.length === i+1 && escalonadorGlobal[i].momento < agendaSaida){
          escalonadorGlobal.push({
            fila: fila,
            momento: agendaSaida,
            tipo: 'SAIDA'
          });
          break;
        } else if(escalonadorGlobal[i].momento > agendaSaida){
          escalonadorGlobal.splice(i, 0, {fila: fila, momento: agendaSaida, tipo: 'SAIDA'});
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
