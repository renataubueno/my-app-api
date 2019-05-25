var random = require('random');
var seedrandom = require('seedrandom');

let escalonador = [];
let probEstadosFila = [];
let numChegadasMax = 0;
let tempoMax = 0;
let condicaoFila = 0;
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

exports.simulacaoPOST = function (dados) {
  let resultado = '';
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
  if(dados.tipoParada === 'CHEGADAS'){
    let resultado = simulacaoSimplesChegada(fila, entrada, numChegadasMax, seed);

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
  } else {
    let resultado = simulacaoSimplesTempo(fila, entrada, tempoMax, seed);

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
}

function simulacaoSimplesTempo(fila, entrada, tempoMax, seed){
  console.log('NA SIMULACAO');

  random.use(seedrandom(seed));
  let numAleatorio = geraAleatorio();
  let agendaChegada = 0;
  let agendaSaida = 0;
  //tenho que pegar todas as infos que preciso dos objetos e salvar em objetos locais
  let minChegada = fila[0].minChegada;
  let maxChegada = fila[0].maxChegada;
  let minServico = fila[0].minServico;
  let maxServico = fila[0].maxServico;
  let capacidade = fila[0].capacidade;
  let servidores = fila[0].servidores;
  let chegada = entrada[0].chegada;
  //criar variável de controle pra quantidade de usuários na fila e que já tenham sido atendidos (agendada a saida)
  probEstadosFila = Array(capacidade+1);
  let momentoAnterior = 0;
  let momentoAtual = 0;
  //reiniciar o escalonador
  escalonador = [];
  escalonador.push({
    momento: chegada,
    tipo: 'CHEGADA'});
  condicaoFila = 0;
  numChegadas = 0;
  numAtendimentos = 0;

  /* Algoritmo da simulação */
  console.log('MOMENTO ANTERIOR: ', momentoAnterior);
  console.log('TEMPO MAX: ',  tempoMax);
  while(escalonador.length !== 0 && momentoAnterior < tempoMax){
    console.log('ESCALONADOR', escalonador);

    let next = escalonador[0];
    escalonador.splice(0, 1);
    /* Aqui começa o agendaChegada */
    if(next.tipo === 'CHEGADA'){
      //verificar quanto tempo a fila ficou com capacidade = 0, 1, 2...
      momentoAtual = next.momento - momentoAnterior;
      momentoAnterior = next.momento;


      if(probEstadosFila[condicaoFila] === undefined){
        probEstadosFila[condicaoFila] = momentoAtual;
      } else {
        probEstadosFila[condicaoFila] = probEstadosFila[condicaoFila] + momentoAtual;
      }

      numChegadas++;
      if(condicaoFila < capacidade){
        condicaoFila++;
        if(condicaoFila <= servidores){
          agendaSaida = next.momento + uniforme(minServico, maxServico);

          if(escalonador.length === 0){
            escalonador.push({
              momento: agendaSaida,
              tipo: 'SAIDA'
            });
          } else {
            for(let i = 0; i < escalonador.length; i++){
              if(escalonador.length === i+1 && escalonador[i].momento < agendaSaida){
                escalonador.push({
                  momento: agendaSaida,
                  tipo: 'SAIDA'
                });
                break;
              } else if(escalonador[i].momento > agendaSaida){
                escalonador.splice(i, 0, {momento: agendaSaida, tipo: 'SAIDA'});
                break;
              }
            }
          }
        };
      };

      agendaChegada =  next.momento + uniforme(minChegada, maxChegada);

      if(escalonador.length === 0){
        escalonador.push({
          momento: agendaChegada,
          tipo: 'CHEGADA'});
      } else {
        for(let i = 0; i < escalonador.length; i++){
          if(escalonador.length === i+1 && escalonador[i].momento < agendaChegada){
            escalonador.push({
              momento: agendaChegada,
              tipo: 'CHEGADA'});
            break;
          } else if(escalonador[i].momento > agendaChegada){
            escalonador.splice(i, 0, {momento: agendaChegada,tipo: 'CHEGADA'});
            break;
          }
        }
      }
    /* Aqui começa o agendaSaida */
    } else {
      momentoAtual = next.momento - momentoAnterior;
      momentoAnterior = next.momento;

      //agendaSaida(condicaoFila, servidores, momentoAtual);

      if(probEstadosFila[condicaoFila] === undefined){
        probEstadosFila[condicaoFila] = momentoAtual;
      } else {
        probEstadosFila[condicaoFila] = probEstadosFila[condicaoFila] + momentoAtual;
      }

      numAtendimentos++;
      condicaoFila--;
      if(condicaoFila >= servidores){
        agendaSaida = next.momento + uniforme(minServico, maxServico);

        if(escalonador.length === 0){
          escalonador.push({
            momento: agendaSaida,
            tipo: 'SAIDA'
          });
        } else {
          for(let i = 0; i < escalonador.length; i++){
            if(escalonador.length === i+1 && escalonador[i].momento < agendaSaida){
              escalonador.push({
                momento: agendaSaida,
                tipo: 'SAIDA'
              });
              break;
            } else if(escalonador[i].momento > agendaSaida){
              escalonador.splice(i, 0, {momento: agendaSaida, tipo: 'SAIDA'});
              break;
            }
          }
        }
      }
    }
  }

  let tempoTotal = momentoAnterior;
  let tempoOcupada = momentoAnterior - probEstadosFila[0];
  console.log('PROBABILIDADE DE ESTADOS DA FILA - FINAL: ', probEstadosFila);

  return {
    numChegadas: numChegadas,
    numAtendimentos: numAtendimentos,
    tempoOcupada: tempoOcupada,
    tempoTotal: tempoTotal,
    probEstadosFila: probEstadosFila
  };
}

function simulacaoSimplesChegada(fila, entrada, numChegadasMax, seed){
  console.log('NA SIMULACAO');

  random.use(seedrandom(seed));
  let numAleatorio = geraAleatorio();
  let agendaChegada = 0;
  let agendaSaida = 0;
  //tenho que pegar todas as infos que preciso dos objetos e salvar em objetos locais
  let minChegada = fila[0].minChegada;
  let maxChegada = fila[0].maxChegada;
  let minServico = fila[0].minServico;
  let maxServico = fila[0].maxServico;
  let capacidade = fila[0].capacidade;
  let servidores = fila[0].servidores;
  let chegada = entrada[0].chegada;
  //criar variável de controle pra quantidade de usuários na fila e que já tenham sido atendidos (agendada a saida)
  probEstadosFila = Array(capacidade+1);
  let momentoAnterior = 0;
  let momentoAtual = 0;
  //reiniciar o escalonador
  escalonador = [];
  escalonador.push({
    momento: chegada,
    tipo: 'CHEGADA'});
  condicaoFila = 0;
  numChegadas = 0;
  numAtendimentos = 0;

  /* Algoritmo da simulação */
  while(escalonador.length !== 0 && numChegadas < numChegadasMax){
    console.log('ESCALONADOR', escalonador);

    let next = escalonador[0];
    escalonador.splice(0, 1);
    /* Aqui começa o agendaChegada */
    if(next.tipo === 'CHEGADA'){
      //verificar quanto tempo a fila ficou com capacidade = 0, 1, 2...
      momentoAtual = next.momento - momentoAnterior;
      momentoAnterior = next.momento;

      if(probEstadosFila[condicaoFila] === undefined){
        probEstadosFila[condicaoFila] = momentoAtual;
      } else {
        probEstadosFila[condicaoFila] = probEstadosFila[condicaoFila] + momentoAtual;
      }

      numChegadas++;
      if(numChegadas === numChegadasMax){
        break;
      }
      if(condicaoFila < capacidade){
        condicaoFila++;
        if(condicaoFila <= servidores){
          agendaSaida = next.momento + uniforme(minServico, maxServico);

          if(escalonador.length === 0){
            escalonador.push({
              momento: agendaSaida,
              tipo: 'SAIDA'
            });
          } else {
            for(let i = 0; i < escalonador.length; i++){
              if(escalonador.length === i+1 && escalonador[i].momento < agendaSaida){
                escalonador.push({
                  momento: agendaSaida,
                  tipo: 'SAIDA'
                });
                break;
              } else if(escalonador[i].momento > agendaSaida){
                escalonador.splice(i, 0, {momento: agendaSaida, tipo: 'SAIDA'});
                break;
              }
            }
          }
        };
      };

      agendaChegada =  next.momento + uniforme(minChegada, maxChegada);

      if(escalonador.length === 0){
        escalonador.push({
          momento: agendaChegada,
          tipo: 'CHEGADA'});
      } else {
        for(let i = 0; i < escalonador.length; i++){
          if(escalonador.length === i+1 && escalonador[i].momento < agendaChegada){
            escalonador.push({
              momento: agendaChegada,
              tipo: 'CHEGADA'});
            break;
          } else if(escalonador[i].momento > agendaChegada){
            escalonador.splice(i, 0, {momento: agendaChegada,tipo: 'CHEGADA'});
            break;
          }
        }
      }
    /* Aqui começa o agendaSaida */
    } else {
      momentoAtual = next.momento - momentoAnterior;
      momentoAnterior = next.momento;

      //agendaSaida(condicaoFila, servidores, momentoAtual);

      if(probEstadosFila[condicaoFila] === undefined){
        probEstadosFila[condicaoFila] = momentoAtual;
      } else {
        probEstadosFila[condicaoFila] = probEstadosFila[condicaoFila] + momentoAtual;
      }

      numAtendimentos++;
      condicaoFila--;
      if(condicaoFila >= servidores){
        agendaSaida = next.momento + uniforme(minServico, maxServico);

        if(escalonador.length === 0){
          escalonador.push({
            momento: agendaSaida,
            tipo: 'SAIDA'
          });
        } else {
          for(let i = 0; i < escalonador.length; i++){
            if(escalonador.length === i+1 && escalonador[i].momento < agendaSaida){
              escalonador.push({
                momento: agendaSaida,
                tipo: 'SAIDA'
              });
              break;
            } else if(escalonador[i].momento > agendaSaida){
              escalonador.splice(i, 0, {momento: agendaSaida, tipo: 'SAIDA'});
              break;
            }
          }
        }
      }
    }
  }

  let tempoTotal = momentoAnterior;
  let tempoOcupada = momentoAnterior - probEstadosFila[0];
  console.log('PROBABILIDADE DE ESTADOS DA FILA - FINAL: ', probEstadosFila);

  return {
    numChegadas: numChegadas,
    numAtendimentos: numAtendimentos,
    tempoOcupada: tempoOcupada,
    tempoTotal: tempoTotal,
    probEstadosFila: probEstadosFila
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

function agendaChegada(condicaoFila, capacidade, servidores, tempoAtual){

}

function agendaSaida(condicaoFila, servidores, momentoAtual){
  console.log('AGENDASAIDA - condicaoFila', condicaoFila);
  console.log('AGENDASAIDA - servidores', servidores);
  console.log('AGENDASAIDA - momentoAtual', momentoAtual);
  return true;
/*if(probEstadosFila[condicaoFila] === undefined){
    momentoAtual = next.momento - momentoAnterior;
    momentoAnterior = next.momento;
    probEstadosFila[condicaoFila] = momentoAtual;
  } else {
    momentoAtual = next.momento - momentoAnterior;
    momentoAnterior = next.momento;
    probEstadosFila[condicaoFila] = probEstadosFila[condicaoFila] + momentoAtual;
  }

  numAtendimentos++;
  condicaoFila--;
  if(condicaoFila >= 1){
    agendaSaida = next.momento + uniforme(minServico, maxServico);

    if(escalonador.length === 0){
      escalonador.push({
        momento: agendaSaida,
        tipo: 'SAIDA'
      });
    } else {
      for(let i = 0; i < escalonador.length; i++){
        if(escalonador.length === i+1 && escalonador[i].momento < agendaSaida){
          escalonador.push({
            momento: agendaSaida,
            tipo: 'SAIDA'
          });
          break;
        } else if(escalonador[i].momento > agendaSaida){
          escalonador.splice(i, 0, {momento: agendaSaida, tipo: 'SAIDA'});
          break;
        }
      }
    }
  }*/
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
    x = (probEstadosFila[i] * 100)/tempoTotal;
    if(x == NaN){
      x = 0;
    }
    probEstadosFilaTratado.push(x);
  }

  console.log('PROBABILIDADE ESTADO TRATADO', probEstadosFilaTratado);
  return probEstadosFilaTratado;
}
