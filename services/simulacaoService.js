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

  console.log('FILAS GLOBAL: ', filasGlobal);

  for(let i = 0; i < filasGlobal.length; i++){
    filasGlobal[i].saidas.sort(ordenarProbabilidades);
    filasGlobal[i].saidas.reverse();
    console.log('APÓS O SORT', filasGlobal[i].saidas);
  };

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
            escalonadorGlobal.push({
              fila: temEntrada[i],
              momento: momentoCurrent,
              tipo: 'CHEGADA',
              agendadoPor: temEntrada[i].id
            });
          } else {
            for(let k = 0; k < escalonadorGlobal.length; k++){
              if(escalonadorGlobal.length === k+1 && escalonadorGlobal[k].momento < momentoCurrent){
                escalonadorGlobal.push({
                  fila: temEntrada[i],
                  momento: momentoCurrent,
                  tipo: 'CHEGADA',
                  agendadoPor: temEntrada[i].id
                });
                break;
              } else if(escalonadorGlobal[k].momento >= momentoCurrent){
                escalonadorGlobal.splice(k, 0, {fila: temEntrada[i], momento: momentoCurrent, tipo: 'CHEGADA', agendadoPor: temEntrada[i].id});
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
              tipo: 'CHEGADA',
              agendadoPor: temEntrada[i].id
            });
          } else {
            for(let k = 0; k < escalonadorGlobal.length; k++){
              if(escalonadorGlobal.length === k+1 && escalonadorGlobal[k].momento < momentoCurrent){
                escalonadorGlobal.push({
                  fila: temEntrada[i],
                  momento: momentoCurrent,
                  tipo: 'CHEGADA',
                  agendadoPor: temEntrada[i].id
                });
                break;
              } else if(escalonadorGlobal[k].momento >= momentoCurrent){
                escalonadorGlobal.splice(k, 0, {fila: temEntrada[i], momento: momentoCurrent, tipo: 'CHEGADA', agendadoPor: temEntrada[i].id});
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
      if(filasGlobal[i].id === next.agendadoPor){
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
  };

  if(next.tipo === 'CHEGADA'){
    next.fila.numChegadas++;
    numChegadasGlobal++;
    console.log('TENTANDO AGENDAR CHEGADA');
    agendarChegada(fila, capacidade, servidores, nextMomento, minServico, maxServico, minChegada, maxChegada);
  } else if (next.tipo === 'FILA'){
    filaDestino = fila;
    for(let i = 0; i < filasGlobal.length; i++){
      if(filasGlobal[i].id === next.agendadoPor){
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
  let saiu = false;
  let filaOrigem = {};
  let filaDestino = {};

  if(fila.condicaoFila < capacidade){
    fila.condicaoFila++;
    if(fila.condicaoFila <= servidores){
      //verificar todas as saídas existentes da fila atual
      for(let i = 0; i < fila.saidas.length; i++){
        //caso seja a última saída da lista de saídas, vai ser essa que vai ser agendada
        if(saiu === false && fila.saidas.length === i+1){
          console.log('ENTREI NO CASO DE QUE SOU O ÚLTIMO ELEMENTO DAS SAÍDAS');
          //caso essa última saída tenha como destino a Saída, chama o agendaSaida
          if(fila.saidas[i].destino === 'Saída'){
            console.log('AGENDANDO SAIDA');
            let agendaSaida = nextMomento + uniforme(minServico, maxServico);

            if(escalonadorGlobal.length === 0){
              escalonadorGlobal.push({
                fila: fila,
                momento: agendaSaida,
                tipo: 'SAIDA',
                agendadoPor: fila.id
              });
            } else {
              for(let j = 0; j < escalonadorGlobal.length; j++){
                if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaSaida){
                  escalonadorGlobal.push({
                    fila: fila,
                    momento: agendaSaida,
                    tipo: 'SAIDA',
                    agendadoPor: fila.id
                  });
                  break;
                } else if(escalonadorGlobal[j].momento > agendaSaida){
                  escalonadorGlobal.splice(j, 0, {fila: fila, momento: agendaSaida, tipo: 'SAIDA', agendadoPor: fila.id});
                  break;
                }
              }
            }
          //caso essa última saída tenha como destino outra fila, chama o agendaFila
          } else {
            filaOrigem = fila;
            for(let j = 0; j < filasGlobal.length; j++){
              if(filasGlobal[j].id === fila.saidas[i].destino){
                filaDestino = filasGlobal[j];
              }
            };

            let agendaFila = nextMomento + uniforme(minServico, maxServico);

            if(escalonadorGlobal.length === 0){
              escalonadorGlobal.push({
                fila: filaDestino,
                momento: agendaFila,
                tipo: 'FILA',
                agendadoPor: fila.id
              });
            } else {
              for(let j = 0; j < escalonadorGlobal.length; j++){
                if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaFila){
                  escalonadorGlobal.push({
                    fila: filaDestino,
                    momento: agendaFila,
                    tipo: 'FILA',
                    agendadoPor: fila.id
                  });
                  break;
                } else if(escalonadorGlobal[j].momento > agendaFila){
                  escalonadorGlobal.splice(j, 0, {fila: filaDestino, momento: agendaFila, tipo: 'FILA', agendadoPor: fila.id});
                  break;
                }
              }
            }
          }
          saiu = true;
        }
        let numAleatorio = geraAleatorio();
        if(saiu === false && numAleatorio < (fila.saidas[i].porcentagem)/100){
          console.log('ENTREI NO CASO DE QUE NÃO SOU O ÚLTIMO ELEMENTO DAS SAÍDAS! NUMALEATORIO GERADO: ', numAleatorio);
          //caso essa saída tenha como destino a Saída, chama o agendaSaida
          if(fila.saidas[i].destino === 'Saída'){
            console.log('AGENDANDO SAIDA');
            let agendaSaida = nextMomento + uniforme(minServico, maxServico);

            if(escalonadorGlobal.length === 0){
              escalonadorGlobal.push({
                fila: fila,
                momento: agendaSaida,
                tipo: 'SAIDA',
                agendadoPor: fila.id
              });
            } else {
              for(let j = 0; j < escalonadorGlobal.length; j++){
                if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaSaida){
                  escalonadorGlobal.push({
                    fila: fila,
                    momento: agendaSaida,
                    tipo: 'SAIDA',
                    agendadoPor: fila.id
                  });
                  break;
                } else if(escalonadorGlobal[j].momento > agendaSaida){
                  escalonadorGlobal.splice(j, 0, {fila: fila, momento: agendaSaida, tipo: 'SAIDA', agendadoPor: fila.id});
                  break;
                }
              }
            }
          //caso essa saída tenha como destino outra fila, chama o agendaFila
          } else {
            filaOrigem = fila;
            for(let j = 0; j < filasGlobal.length; j++){
              if(filasGlobal[j].id === fila.saidas[i].destino){
                filaDestino = filasGlobal[j];
              }
            };

            let agendaFila = nextMomento + uniforme(minServico, maxServico);

            if(escalonadorGlobal.length === 0){
              escalonadorGlobal.push({
                fila: filaDestino,
                momento: agendaFila,
                tipo: 'FILA',
                agendadoPor: fila.id
              });
            } else {
              for(let j = 0; j < escalonadorGlobal.length; j++){
                if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaFila){
                  escalonadorGlobal.push({
                    fila: filaDestino,
                    momento: agendaFila,
                    tipo: 'FILA',
                    agendadoPor: fila.id
                  });
                  break;
                } else if(escalonadorGlobal[j].momento > agendaFila){
                  escalonadorGlobal.splice(j, 0, {fila: filaDestino, momento: agendaFila, tipo: 'FILA', agendadoPor: fila.id});
                  break;
                }
              }
            }
          }
          saiu = true;
        }
      };
    };
  };

  console.log('AGENDANDO CHEGADA');
  let agendaChegada =  nextMomento + uniforme(minChegada, maxChegada);

  if(escalonadorGlobal.length === 0){
    escalonadorGlobal.push({
      fila: fila,
      momento: agendaChegada,
      tipo: 'CHEGADA',
      agendadoPor: fila.id
    });
  } else {
    for(let i = 0; i < escalonadorGlobal.length; i++){
      if(escalonadorGlobal.length === i+1 && escalonadorGlobal[i].momento < agendaChegada){
        escalonadorGlobal.push({
          fila: fila,
          momento: agendaChegada,
          tipo: 'CHEGADA',
          agendadoPor: fila.id
        });
        break;
      } else if(escalonadorGlobal[i].momento > agendaChegada){
        escalonadorGlobal.splice(i, 0, {fila: fila, momento: agendaChegada, tipo: 'CHEGADA', agendadoPor: fila.id});
        break;
      }
    }
  }

  return true;
}

function agendarFila(filaOrigem, filaDestino, nextMomento){
  let saiu = false;
  let novaFilaOrigem = {};
  let novaFilaDestino = {};

  console.log('AGENDAR FILA - filaOrigem: ', filaOrigem);
  console.log('AGENDAR FILA - filaDestino: ', filaDestino);

  filaOrigem.numAtendimentos++;
  numAtendimentosGlobal++;
  filaOrigem.condicaoFila--;

  if(filaOrigem.condicaoFila >= filaOrigem.servidores){
    for(let i = 0; i < filaOrigem.saidas.length; i++){
      if(saiu === false && filaOrigem.saidas.length === i+1){
        if(filaOrigem.saidas[i].destino === 'Saída'){
          console.log('AGENDANDO SAIDA');
          let agendaSaida = nextMomento + uniforme(filaOrigem.minServico, filaOrigem.maxServico);

          if(escalonadorGlobal.length === 0){
            escalonadorGlobal.push({
              fila: filaOrigem,
              momento: agendaSaida,
              tipo: 'SAIDA',
              agendadoPor: filaDestino.id
            });
          } else {
            for(let j = 0; j < escalonadorGlobal.length; j++){
              if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaSaida){
                escalonadorGlobal.push({
                  fila: filaOrigem,
                  momento: agendaSaida,
                  tipo: 'SAIDA',
                  agendadoPor: filaDestino.id
                });
                break;
              } else if(escalonadorGlobal[j].momento > agendaSaida){
                escalonadorGlobal.splice(j, 0, {fila: filaOrigem, momento: agendaSaida, tipo: 'SAIDA', agendadoPor: filaDestino.id});
                break;
              }
            }
          }
        } else {
          console.log('AGENDAR FILA - primeiro caso - ultima saida - filaOrigem: ', filaOrigem);
          console.log('AGENDAR FILA - primeiro caso - ultima saida - filaDestino: ', filaDestino);
          let agendaFila = nextMomento + uniforme(filaOrigem.minServico, filaOrigem.maxServico);

          if(escalonadorGlobal.length === 0){
            escalonadorGlobal.push({
              fila: filaDestino,
              momento: agendaFila,
              tipo: 'FILA',
              agendadoPor: filaDestino.id
            });
          } else {
            for(let j = 0; j < escalonadorGlobal.length; j++){
              if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaFila){
                escalonadorGlobal.push({
                  fila: filaDestino,
                  momento: agendaFila,
                  tipo: 'FILA',
                  agendadoPor: filaDestino.id
                });
                break;
              } else if(escalonadorGlobal[j].momento > agendaFila){
                escalonadorGlobal.splice(j, 0, {fila: filaDestino, momento: agendaFila, tipo: 'FILA', agendadoPor: filaDestino.id});
                break;
              }
            }
          }
        };
        saiu = true;
      }
      let numAleatorio = geraAleatorio();
      if(saiu === false && numAleatorio < (filaOrigem.saidas[i].porcentagem/100)){
        if(filaOrigem.saidas[i].destino === 'Saída'){
          console.log('AGENDANDO SAIDA');
          let agendaSaida = nextMomento + uniforme(filaOrigem.minServico, filaOrigem.maxServico);

          if(escalonadorGlobal.length === 0){
            escalonadorGlobal.push({
              fila: filaOrigem,
              momento: agendaSaida,
              tipo: 'SAIDA',
              agendadoPor: filaDestino.id
            });
          } else {
            for(let j = 0; j < escalonadorGlobal.length; j++){
              if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaSaida){
                escalonadorGlobal.push({
                  fila: filaOrigem,
                  momento: agendaSaida,
                  tipo: 'SAIDA',
                  agendadoPor: filaDestino.id
                });
                break;
              } else if(escalonadorGlobal[j].momento > agendaSaida){
                escalonadorGlobal.splice(j, 0, {fila: filaOrigem, momento: agendaSaida, tipo: 'SAIDA', agendadoPor: filaDestino.id});
                break;
              }
            }
          }
        } else {
          console.log('AGENDAR FILA - primeiro caso - não é a ultima saida - filaOrigem: ', filaOrigem);
          console.log('AGENDAR FILA - primeiro caso - não é a ultima saída - filaDestino: ', filaDestino);
          let agendaFila = nextMomento + uniforme(filaOrigem.minServico, filaOrigem.maxServico);

          if(escalonadorGlobal.length === 0){
            escalonadorGlobal.push({
              fila: filaDestino,
              momento: agendaFila,
              tipo: 'FILA',
              agendadoPor: filaDestino.id
            });
          } else {
            for(let j = 0; j < escalonadorGlobal.length; j++){
              if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaFila){
                escalonadorGlobal.push({
                  fila: filaDestino,
                  momento: agendaFila,
                  tipo: 'FILA',
                  agendadoPor: filaDestino.id
                });
                break;
              } else if(escalonadorGlobal[j].momento > agendaFila){
                escalonadorGlobal.splice(j, 0, {fila: filaDestino, momento: agendaFila, tipo: 'FILA', agendadoPor: filaDestino.id});
                break;
              }
            }
          }
        };
        saiu = true;
      }
    }
  };

  if(filaDestino.condicaoFila < filaDestino.capacidade){
    filaDestino.condicaoFila++;
    filaDestino.numChegadas++;
    if(filaDestino.condicaoFila <= filaDestino.servidores){
      for(let i = 0; i < filaDestino.saidas.length; i++){
        if(saiu === false && filaDestino.saidas.length === i+1){
          console.log('ENTREI PARA AGENDAR O DESTINO DA FILA 1 E SOU A ULTIMA SAIDA');
          if(filaDestino.saidas[i].destino === 'Saída'){
            console.log('AGENDANDO SAIDA');
            let agendaSaida = nextMomento + uniforme(filaDestino.minServico, filaDestino.maxServico);

            if(escalonadorGlobal.length === 0){
              escalonadorGlobal.push({
                fila: filaDestino,
                momento: agendaSaida,
                tipo: 'SAIDA',
                agendadoPor: filaDestino.id
              });
            } else {
              for(let j = 0; j < escalonadorGlobal.length; j++){
                if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaSaida){
                  escalonadorGlobal.push({
                    fila: filaDestino,
                    momento: agendaSaida,
                    tipo: 'SAIDA',
                    agendadoPor: filaDestino.id
                  });
                  break;
                } else if(escalonadorGlobal[j].momento > agendaSaida){
                  escalonadorGlobal.splice(j, 0, {fila: filaDestino, momento: agendaSaida, tipo: 'SAIDA', agendadoPor: filaDestino.id});
                  break;
                }
              }
            }
          } else {
            for(let i = 0; i < filasGlobal.length; i++){
              if(filasGlobal[i].id === filaDestino.saidas[i].destino){
                novaFilaDestino = filasGlobal[i];
              }
            };

            console.log('AGENDAR FILA - segundo caso - ultima saida - filaOrigem: ', filaOrigem);
            console.log('AGENDAR FILA - segundo caso - ultima saida - filaDestino: ', filaDestino);
            console.log('AGENDAR FILA - segundo caso - ultima saida - novaFilaDestino: ', novaFilaDestino);

            let agendaFila = nextMomento + uniforme(filaDestino.minServico, filaDestino.maxServico);

            if(escalonadorGlobal.length === 0){
              escalonadorGlobal.push({
                fila: novaFilaDestino,
                momento: agendaFila,
                tipo: 'FILA',
                agendadoPor: filaDestino.id
              });
            } else {
              for(let j = 0; j < escalonadorGlobal.length; j++){
                if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaFila){
                  escalonadorGlobal.push({
                    fila: novaFilaDestino,
                    momento: agendaFila,
                    tipo: 'FILA',
                    agendadoPor: filaDestino.id
                  });
                  break;
                } else if(escalonadorGlobal[j].momento > agendaFila){
                  escalonadorGlobal.splice(j, 0, {fila: novaFilaDestino, momento: agendaFila, tipo: 'FILA', agendadoPor: filaDestino.id});
                  break;
                }
              }
            }
          };
          saiu = true;
        }
        let numAleatorio = geraAleatorio();
        if(saiu === false && numAleatorio < (filaDestino.saidas[i].porcentagem/100)){
          if(filaDestino.saidas[i].destino === 'Saída'){
            console.log('ENTREI PARA AGENDAR O DESTINO DA FILA 1 E NÃO SOU A ULTIMA SAIDA', numAleatorio);
            let agendaSaida = nextMomento + uniforme(filaDestino.minServico, filaDestino.maxServico);

            if(escalonadorGlobal.length === 0){
              escalonadorGlobal.push({
                fila: filaDestino,
                momento: agendaSaida,
                tipo: 'SAIDA',
                agendadoPor: filaDestino.id
              });
            } else {
              for(let j = 0; j < escalonadorGlobal.length; j++){
                if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaSaida){
                  escalonadorGlobal.push({
                    fila: filaDestino,
                    momento: agendaSaida,
                    tipo: 'SAIDA',
                    agendadoPor: filaDestino.id
                  });
                  break;
                } else if(escalonadorGlobal[j].momento > agendaSaida){
                  escalonadorGlobal.splice(j, 0, {fila: filaDestino, momento: agendaSaida, tipo: 'SAIDA', agendadoPor: filaDestino.id});
                  break;
                }
              }
            }
          } else {
            for(let j = 0; j < filasGlobal.length; j++){
              if(filasGlobal[j].id === filaDestino.saidas[i].destino){
                novaFilaDestino = filasGlobal[j];
              }
            };

            console.log('AGENDAR FILA - segundo caso - nao é ultima saida - filaOrigem: ', filaOrigem);
            console.log('AGENDAR FILA - segundo caso - nao é ultima saida - filaDestino: ', filaDestino);
            console.log('AGENDAR FILA - segundo caso - nao é ultima saida - novaFilaDestino: ', novaFilaDestino);

            let agendaFila = nextMomento + uniforme(filaDestino.minServico, filaDestino.maxServico);

            if(escalonadorGlobal.length === 0){
              escalonadorGlobal.push({
                fila: novaFilaDestino,
                momento: agendaFila,
                tipo: 'FILA',
                agendadoPor: filaDestino.id
              });
            } else {
              for(let j = 0; j < escalonadorGlobal.length; j++){
                if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaFila){
                  escalonadorGlobal.push({
                    fila: novaFilaDestino,
                    momento: agendaFila,
                    tipo: 'FILA',
                    agendadoPor: filaDestino.id
                  });
                  break;
                } else if(escalonadorGlobal[j].momento > agendaFila){
                  escalonadorGlobal.splice(j, 0, {fila: novaFilaDestino, momento: agendaFila, tipo: 'FILA', agendadoPor: filaDestino.id});
                  break;
                }
              }
            }
          };
          saiu = true;
        }
      }
    };
  };

  return true;
}

function agendarSaida(fila, servidores, nextMomento, minServico, maxServico){
  let saiu = false;

  fila.numAtendimentos++;
  numAtendimentosGlobal++;
  fila.condicaoFila--;
  if(fila.condicaoFila >= servidores){
    //verificar todas as saídas existentes da fila atual
    for(let i = 0; i < fila.saidas.length; i++){
      //caso seja a última saída da lista de saídas, vai ser essa que vai ser agendada
      if(saiu === false && fila.saidas.length === i+1){
        console.log('ENTREI NO CASO DE QUE SOU O ÚLTIMO ELEMENTO DAS SAÍDAS');
        //caso essa última saída tenha como destino a Saída, chama o agendaSaida
        if(fila.saidas[i].destino === 'Saída'){
          console.log('AGENDANDO SAIDA');
          let agendaSaida = nextMomento + uniforme(minServico, maxServico);

          if(escalonadorGlobal.length === 0){
            escalonadorGlobal.push({
              fila: fila,
              momento: agendaSaida,
              tipo: 'SAIDA',
              agendadoPor: fila.id
            });
          } else {
            for(let j = 0; j < escalonadorGlobal.length; j++){
              if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaSaida){
                escalonadorGlobal.push({
                  fila: fila,
                  momento: agendaSaida,
                  tipo: 'SAIDA',
                  agendadoPor: fila.id
                });
                break;
              } else if(escalonadorGlobal[j].momento > agendaSaida){
                escalonadorGlobal.splice(j, 0, {fila: fila, momento: agendaSaida, tipo: 'SAIDA', agendadoPor: fila.id});
                break;
              }
            }
          }
        //caso essa última saída tenha como destino outra fila, chama o agendaFila
        } else {
          filaOrigem = fila;
          for(let j = 0; j < filasGlobal.length; j++){
            if(filasGlobal[j].id === fila.saidas[i].destino){
              filaDestino = filasGlobal[j];
            }
          };

          let agendaFila = nextMomento + uniforme(minServico, maxServico);

          if(escalonadorGlobal.length === 0){
            escalonadorGlobal.push({
              fila: filaDestino,
              momento: agendaFila,
              tipo: 'FILA',
              agendadoPor: fila.id
            });
          } else {
            for(let j = 0; j < escalonadorGlobal.length; j++){
              if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaFila){
                escalonadorGlobal.push({
                  fila: filaDestino,
                  momento: agendaFila,
                  tipo: 'FILA',
                  agendadoPor: fila.id
                });
                break;
              } else if(escalonadorGlobal[j].momento > agendaFila){
                escalonadorGlobal.splice(j, 0, {fila: filaDestino, momento: agendaFila, tipo: 'FILA', agendadoPor: fila.id});
                break;
              }
            }
          }
        }
        saiu = true;
      }
      let numAleatorio = geraAleatorio();
      if(saiu === false && numAleatorio < (fila.saidas[i].porcentagem)/100){
        console.log('ENTREI NO CASO DE QUE NÃO SOU O ÚLTIMO ELEMENTO DAS SAÍDAS! NUMALEATORIO GERADO: ', numAleatorio);
        //caso essa saída tenha como destino a Saída, chama o agendaSaida
        if(fila.saidas[i].destino === 'Saída'){
          console.log('AGENDANDO SAIDA');
          let agendaSaida = nextMomento + uniforme(minServico, maxServico);

          if(escalonadorGlobal.length === 0){
            escalonadorGlobal.push({
              fila: fila,
              momento: agendaSaida,
              tipo: 'SAIDA',
              agendadoPor: fila.id
            });
          } else {
            for(let j = 0; j < escalonadorGlobal.length; j++){
              if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaSaida){
                escalonadorGlobal.push({
                  fila: fila,
                  momento: agendaSaida,
                  tipo: 'SAIDA',
                  agendadoPor: fila.id
                });
                break;
              } else if(escalonadorGlobal[j].momento > agendaSaida){
                escalonadorGlobal.splice(j, 0, {fila: fila, momento: agendaSaida, tipo: 'SAIDA', agendadoPor: fila.id});
                break;
              }
            }
          }
        //caso essa saída tenha como destino outra fila, chama o agendaFila
        } else {
          filaOrigem = fila;
          for(let j = 0; j < filasGlobal.length; j++){
            if(filasGlobal[j].id === fila.saidas[i].destino){
              filaDestino = filasGlobal[j];
            }
          };

          let agendaFila = nextMomento + uniforme(minServico, maxServico);

          if(escalonadorGlobal.length === 0){
            escalonadorGlobal.push({
              fila: filaDestino,
              momento: agendaFila,
              tipo: 'FILA',
              agendadoPor: fila.id
            });
          } else {
            for(let j = 0; j < escalonadorGlobal.length; j++){
              if(escalonadorGlobal.length === j+1 && escalonadorGlobal[j].momento < agendaFila){
                escalonadorGlobal.push({
                  fila: filaDestino,
                  momento: agendaFila,
                  tipo: 'FILA',
                  agendadoPor: fila.id
                });
                break;
              } else if(escalonadorGlobal[j].momento > agendaFila){
                escalonadorGlobal.splice(j, 0, {fila: filaDestino, momento: agendaFila, tipo: 'FILA', agendadoPor: fila.id});
                break;
              }
            }
          }
        }
        saiu = true;
      }
    };
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

function ordenarProbabilidades(a, b){
  return a.porcentagem - b.porcentagem;
}
