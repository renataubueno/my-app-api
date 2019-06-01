var random = require('random');
var seedrandom = require('seedrandom');

let numChegadasMax = 0;
let tempoMax = 0;
//criar as variaveis de retorno: numChegadas e numAtendimentos
let numChegadasGlobal = 0;
let numAtendimentosGlobal = 0;
let escalonadorGlobal = [];
let filasGlobal = [];
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
  filasGlobal = dados.objSimulacao;
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
    random.use(seedrandom(seed));

    for(let i = 0; i < fila.length; i++){
      fila[i].probabilidadesEstadosFila = Array(fila[i].capacidade+1);
    };

    /* Todas as filas com entradas externas */
    let temEntrada = fila.filter(item => item.chegadas.filter(obj => obj.origem === 'Entrada'));
    for(let i = 0; i < temEntrada.length; i++){
      for(let j = 0; j < temEntrada[i].chegadas.length; j++){
        if(temEntrada[i].chegadas[j].origem === 'Entrada'){
          let momentoCurrent = parseInt(temEntrada[i].chegadas[j].chegada);
          console.log('momento current: ', momentoCurrent);
          if(escalonadorGlobal.length === 0){
            console.log('ESCALONADOR GLOBAL VAZIO');
            escalonadorGlobal.push({
              fila: temEntrada[i],
              momento: momentoCurrent,
              tipo: 'CHEGADA'
            });
          } else {
            console.log('ESCALONADOR GLOBAL JÁ TEM CONTEÚDO');
            for(let k = 0; k < escalonadorGlobal.length; k++){
              if(escalonadorGlobal.length === k+1 && escalonadorGlobal[k].momento < momentoCurrent){
                escalonadorGlobal.push({
                  fila: temEntrada[i],
                  momento: momentoCurrent,
                  tipo: 'CHEGADA'
                });
                break;
              } else if(escalonadorGlobal[k].momento >= momentoCurrent){
                escalonadorGlobal.splice(k, 0, {fila: temEntrada[i], momento: momentoCurrent, tipo: 'CHEGADA'});
                break;
              };
            };
          }
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
    momentoAnterior = 0;
    momentoAtual = 0;
    escalonadorGlobal = [];
    random.use(seedrandom(seed));

    for(let i = 0; i < fila.length; i++){
      fila[i].probabilidadesEstadosFila = Array(fila[i].capacidade+1);
    };

    /* Todas as filas com entradas externas */
    let temEntrada = fila.filter(item => item.chegadas.filter(obj => obj.origem === 'Entrada'));
    for(let i = 0; i < temEntrada.length; i++){
      for(let j = 0; j < temEntrada[i].chegadas.length; j++){
        if(temEntrada[i].chegadas[j].origem === 'Entrada'){
          let momentoCurrent = parseInt(temEntrada[i].chegadas[j].chegada);
          console.log('momento current: ', momentoCurrent);
          if(escalonadorGlobal.length === 0){
            escalonadorGlobal.push({
              fila: temEntrada[i],
              momento: momentoCurrent,
              tipo: 'CHEGADA'
            });
          } else {
            for(let k = 0; k < escalonadorGlobal.length; k++){
              if(escalonadorGlobal.length === k+1 && escalonadorGlobal[k].momento < momentoCurrent){
                escalonadorGlobal.push({
                  fila: temEntrada[i],
                  momento: momentoCurrent,
                  tipo: 'CHEGADA'
                });
                break;
              } else if(escalonadorGlobal[k].momento >= momentoCurrent){
                escalonadorGlobal.splice(k, 0, {fila: temEntrada[i], momento: momentoCurrent, tipo: 'CHEGADA'});
                break;
              };
            };
          }
        };
      };
    };

    while(escalonadorGlobal.length !== 0 && momentoAnterior < tempoMax){
      let nextFila = escalonadorGlobal[0].fila;
      let resultadoSimulacao = tratamentoCondParadaTempo(nextFila, tempoMax, seed);
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

  let agendaChegada = 0;
  let agendaSaida = 0;
  let filaOrigem = {};
  let filaDestino = {};
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

  for(let i = 0; i < filasGlobal.length; i++){
    if(filasGlobal[i].probabilidadesEstadosFila[filasGlobal[i].condicaoFila] === undefined){
      filasGlobal[i].probabilidadesEstadosFila[filasGlobal[i].condicaoFila] = momentoAtual;
    } else {
      filasGlobal[i].probabilidadesEstadosFila[filasGlobal[i].condicaoFila] = filasGlobal[i].probabilidadesEstadosFila[filasGlobal[i].condicaoFila] + momentoAtual;
    };
  }

  if(next.tipo === 'CHEGADA'){
    next.fila.numChegadas++;
    numChegadasGlobal++;
    agendarChegada(fila, capacidade, servidores, nextMomento, minServico, maxServico, minChegada, maxChegada);
  } else if (next.tipo === 'FILA'){
    filaDestino = fila;
    for(let i = 0; i < filasGlobal.length; i++){
      if(filasGlobal[i].id === fila.chegadas[0].origem){
        filaOrigem = filasGlobal[i];
      }
    };
    agendarFila(filaOrigem, filaDestino, nextMomento);
  } else {
    agendarSaida(fila, servidores, nextMomento, minServico, maxServico);
  }

  let tempoTotal = momentoAnterior;
  let tempoOcupada = momentoAnterior - fila.probabilidadesEstadosFila[0];
  console.log('TEMPO TOTAL: ', tempoTotal);
  console.log('TEMPO OCUPADA: ', tempoOcupada);
  //console.log('PROBABILIDADE DE ESTADOS DA FILA - FINAL: ', fila.probabilidadesEstadosFila);

  fila.tempoOcupada = tempoOcupada;
  fila.tempoTotal = tempoTotal;

  return true;
}

function simulacaoChegada(fila, numChegadasMax, seed){
  console.log('NA SIMULACAO');

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

  return true;
}

function geraAleatorio(){
  let numAleatorio = random.float(min = 0, max = 1);
  console.log('NUM ALEATORIO DENTRO DO GERA ALEATORIO: ', numAleatorio );

  return numAleatorio;
}

function uniforme(min, max){
  let numAleatorio = geraAleatorio();
  return (max - min) * numAleatorio + min;
}

function agendarChegada(fila, capacidade, servidores, nextMomento, minServico, maxServico, minChegada, maxChegada){
  let paraSaida = false;
  let paraFila = false;
  let filaOrigem = {};
  let filaDestino = {};

  //flags para ver se essa fila sai para outra fila e/ou para fora do sistema
  //como estou fazendo filas em tandem, só tenho uma conexão, mas isso vai precisar ser adaptado depois
  if(fila.saidas[0].destino === 'Saída'){
    paraSaida = true;
  } else {
    paraFila = true;
  }

  if(fila.condicaoFila < capacidade){
    fila.condicaoFila++;
    if(fila.condicaoFila <= servidores){
      //aqui tenho que ver se agendo para outra fila ou se agendo uma saida
      //agendo fila
      if(paraFila === true){
        filaOrigem = fila;
        for(let i = 0; i < filasGlobal.length; i++){
          if(filasGlobal[i].id === fila.saidas[0].destino){
            filaDestino = filasGlobal[i];
          }
        };

        let agendaFila = nextMomento + uniforme(minServico, maxServico);

        if(escalonadorGlobal.length === 0){
          escalonadorGlobal.push({
            fila: filaDestino,
            momento: agendaFila,
            tipo: 'FILA'
          });
        } else {
          for(let i = 0; i < escalonadorGlobal.length; i++){
            if(escalonadorGlobal.length === i+1 && escalonadorGlobal[i].momento < agendaFila){
              escalonadorGlobal.push({
                fila: filaDestino,
                momento: agendaFila,
                tipo: 'FILA'
              });
              break;
            } else if(escalonadorGlobal[i].momento > agendaFila){
              escalonadorGlobal.splice(i, 0, {fila: filaDestino, momento: agendaFila, tipo: 'FILA'});
              break;
            }
          }
        }
      //agendaSaida
      } else {
        console.log('AGENDANDO SAIDA');
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
      }
    };
  };

  console.log('AGENDANDO CHEGADA');
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

function agendarFila(filaOrigem, filaDestino, nextMomento){
  let paraSaida = false;
  let paraFila = false;
  let novaFilaOrigem = {};
  let novaFilaDestino = {};

  if(filaDestino.saidas[0].destino === 'Saída'){
    paraSaida = true;
  } else {
    paraFila = true;
  }

  filaOrigem.numAtendimentos++;
  numAtendimentosGlobal++;
  filaOrigem.condicaoFila--;

  if(filaOrigem.condicaoFila >= filaOrigem.servidores){
    let agendaFila = nextMomento + uniforme(filaOrigem.minServico, filaOrigem.maxServico);

    if(escalonadorGlobal.length === 0){
      escalonadorGlobal.push({
        fila: filaDestino,
        momento: agendaFila,
        tipo: 'FILA'
      });
    } else {
      for(let i = 0; i < escalonadorGlobal.length; i++){
        if(escalonadorGlobal.length === i+1 && escalonadorGlobal[i].momento < agendaFila){
          escalonadorGlobal.push({
            fila: filaDestino,
            momento: agendaFila,
            tipo: 'FILA'
          });
          break;
        } else if(escalonadorGlobal[i].momento > agendaFila){
          escalonadorGlobal.splice(i, 0, {fila: filaDestino, momento: agendaFila, tipo: 'FILA'});
          break;
        }
      }
    }
  };

  if(filaDestino.condicaoFila < filaDestino.capacidade){
    filaDestino.condicaoFila++;
    filaDestino.numChegadas++;
    if(filaDestino.condicaoFila <= filaDestino.servidores){
      if(paraFila === true){
        novaFilaOrigem = filaDestino;
        for(let i = 0; i < filasGlobal.length; i++){
          if(filasGlobal[i].id === novaFilaOrigem.saidas[0].destino){
            novaFilaDestino = filasGlobal[i];
          }
        };

        let agendaFila = nextMomento + uniforme(novaFilaOrigem.minServico, novaFilaOrigem.maxServico);

        if(escalonadorGlobal.length === 0){
          escalonadorGlobal.push({
            fila: novaFilaDestino,
            momento: agendaFila,
            tipo: 'FILA'
          });
        } else {
          for(let i = 0; i < escalonadorGlobal.length; i++){
            if(escalonadorGlobal.length === i+1 && escalonadorGlobal[i].momento < agendaFila){
              escalonadorGlobal.push({
                fila: novaFilaDestino,
                momento: agendaFila,
                tipo: 'FILA'
              });
              break;
            } else if(escalonadorGlobal[i].momento > agendaFila){
              escalonadorGlobal.splice(i, 0, {fila: novaFilaDestino, momento: agendaFila, tipo: 'FILA'});
              break;
            }
          }
        }
      } else {
        console.log('AGENDANDO SAIDA');
        let agendaSaida = nextMomento + uniforme(filaDestino.minServico, filaDestino.maxServico);

        if(escalonadorGlobal.length === 0){
          escalonadorGlobal.push({
            fila: filaDestino,
            momento: agendaSaida,
            tipo: 'SAIDA'
          });
        } else {
          for(let i = 0; i < escalonadorGlobal.length; i++){
            if(escalonadorGlobal.length === i+1 && escalonadorGlobal[i].momento < agendaSaida){
              escalonadorGlobal.push({
                fila: filaDestino,
                momento: agendaSaida,
                tipo: 'SAIDA'
              });
              break;
            } else if(escalonadorGlobal[i].momento > agendaSaida){
              escalonadorGlobal.splice(i, 0, {fila: filaDestino, momento: agendaSaida, tipo: 'SAIDA'});
              break;
            }
          }
        }
      }
    };
  };

  console.log('ENTREI NO AGENDARFILA YAY: ', filaDestino);
  return true;
}

function agendarSaida(fila, servidores, nextMomento, minServico, maxServico){
  fila.numAtendimentos++;
  numAtendimentosGlobal++;
  fila.condicaoFila--;
  if(fila.condicaoFila >= servidores){
    console.log('AGENDANDO SAIDA');
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
    if(probEstadosFila[i] === undefined) {
      x = 0;
    } else {
      x = (probEstadosFila[i] * 100)/tempoTotal;
    }
    probEstadosFilaTratado.push(x);
  }

  console.log('PROBABILIDADE ESTADO TRATADO', probEstadosFilaTratado);
  return probEstadosFilaTratado;
}
