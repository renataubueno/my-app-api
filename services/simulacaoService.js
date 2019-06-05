var random = require('random');
var seedrandom = require('seedrandom');

let numChegadasMax = 0;
let tempoMax = 0;
let numChegadasGlobal = 0;
let numAtendimentosGlobal = 0;
let escalonadorGlobal = [];
let filasGlobal = [];
let momentoAnterior = 0;
let momentoAtual = 0;

exports.simulacaoGET = function () {
  return {
      id: 1,
      numChegadas: "A",
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

  //console.log('FILAS GLOBAL: ', filasGlobal);

  for(let i = 0; i < filasGlobal.length; i++){
    filasGlobal[i].saidas.sort(ordenarProbabilidades);
    filasGlobal[i].saidas.reverse();
    console.log('SAIDAS: ', filasGlobal[i].saidas);
  };

  if(dados.tipoParada === 'CHEGADAS'){
    numChegadasGlobal = 0;
    numAtendimentosGlobal = 0;
    momentoAnterior = 0;
    momentoAtual = 0;
    escalonadorGlobal = [];
    random.use(seedrandom(seed));

    /* O array de probabilidades de cada fila é sua capacidade + 1 */
    for(let i = 0; i < fila.length; i++){
      fila[i].probabilidadesEstadosFila = Array(fila[i].capacidade+1);
    };

    /* Todas as filas com entradas externas */
    let temEntrada = fila.filter(item => item.chegadas.filter(obj => obj.origem === 'Entrada'));
    for(let i = 0; i < temEntrada.length; i++){
      for(let j = 0; j < temEntrada[i].chegadas.length; j++){
        if(temEntrada[i].chegadas[j].origem === 'Entrada'){
          let momentoCurrent = parseInt(temEntrada[i].chegadas[j].chegada);
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
      //console.log('probabilidadesEstadosFila LOGO NO INICIO! ', nextFila.probabilidadesEstadosFila);
      let resultadoSimulacao = tratamentoCondParadaChegadas(nextFila, numChegadasMax, seed);
      //console.log('RESULTADO DA SIMULAÇÃO: ', resultadoSimulacao);
      escalonadorGlobal.sort(ordenarMomentos);
      let jaExiste = filaRetorno.filter(item => item.id === resultadoSimulacao.id);
      //console.log('JA EXISTE! ', jaExiste);
      if(jaExiste.length > 0){
        for(let i = 0; i < filaRetorno.length; i++){
          if(filaRetorno[i].id === nextFila.id){
            filaRetorno.splice(i, 1);
            filaRetorno.push(resultadoSimulacao);
            break;
          }
        }
      } else {
        filaRetorno.push(resultadoSimulacao);
      }
    }

    calculaProbabilidadesEstadosFila(filaRetorno);

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
      //console.log('RESULTADO DA SIMULAÇÃO: ', resultadoSimulacao);
      escalonadorGlobal.sort(ordenarMomentos);
      let jaExiste = filaRetorno.filter(item => item.id === resultadoSimulacao.id);
      //console.log('JA EXISTE! ', jaExiste);
      if(jaExiste.length > 0){
        for(let i = 0; i < filaRetorno.length; i++){
          if(filaRetorno[i].id === nextFila.id){
            filaRetorno.splice(i, 1);
            filaRetorno.push(resultadoSimulacao);
            break;
          }
        }
      } else {
        filaRetorno.push(resultadoSimulacao);
      }
    }

    calculaProbabilidadesEstadosFila(filaRetorno);

    return filaRetorno;
  }
}

function tratamentoCondParadaChegadas(fila, numChegadasMax, seed){
  let resultado = simulacaoChegada(fila, numChegadasMax, seed);

  let numChegadas = fila.numChegadas;
  let numAtendimentos = fila.numAtendimentos;
  let tempoOcupada = fila.tempoOcupada;
  let tempoTotal = momentoAnterior;
  let probEstadosFila = fila.probabilidadesEstadosFila;

  let taxaChegada = calculaTaxaChegada(numChegadas, tempoTotal);
  let vazao = calculaVazao(tempoOcupada, tempoTotal);
  let utilizacao = calculaUtilizacao(numAtendimentos, tempoTotal);
  let tempoMedioServico = calculaTempoMedioServico(numAtendimentos, tempoOcupada);
  if(numAtendimentos === 0 || tempoOcupada === 0){
    tempoMedioServico = 0
  };

  return {
      id: fila.id, //id da fila
      numChegadas: numChegadas,
      numAtendimentos: numAtendimentos,
      tempoOcupada: tempoOcupada,
      taxaChegada: taxaChegada,
      vazao: vazao,
      utilizacao: utilizacao,
      tempoMedioServico: tempoMedioServico,
      probabilidadesEstadosFila: probEstadosFila
  };
}

function tratamentoCondParadaTempo(fila, tempoMax, seed){
  let resultado = simulacaoTempo(fila, tempoMax, seed);

  /* Variáveis de cada fila, independem da chegada global, ou de outras filas */
  let numChegadas = fila.numChegadas;
  let numAtendimentos = fila.numAtendimentos;
  let tempoOcupada = fila.tempoOcupada;
  /* São variáveis que vão ter que ser computadas no final como um todo */
  /* O tempo total é o tempo total do sistema, não de cada fila */
  /* Prob estados tem que ser calculada em percentual no final da execução apenas */
  let tempoTotal = momentoAnterior;
  let probEstadosFila = fila.probabilidadesEstadosFila;

  let taxaChegada = calculaTaxaChegada(numChegadas, tempoTotal);
  let vazao = calculaVazao(tempoOcupada, tempoTotal);
  let utilizacao = calculaUtilizacao(numAtendimentos, tempoTotal);
  let tempoMedioServico = calculaTempoMedioServico(numAtendimentos, tempoOcupada);
  if(numAtendimentos === 0 || tempoOcupada === 0){
    tempoMedioServico = 0;
  };

  return {
    id: fila.id, //id da fila
    numChegadas: numChegadas,
    numAtendimentos: numAtendimentos,
    tempoOcupada: tempoOcupada,
    taxaChegada: taxaChegada,
    vazao: vazao,
    utilizacao: utilizacao,
    tempoMedioServico: tempoMedioServico,
    probabilidadesEstadosFila: probEstadosFila
  };
}

function simulacaoTempo(fila, tempoMax, seed){
  //console.log('SIMULAÇÃO PELO TEMPO!');

  let agendaChegada = 0;
  let agendaSaida = 0;
  let filaOrigem = {};
  let filaDestino = {};

  //console.log('ESCALONADOR', escalonadorGlobal);

  /* Evento com o qual vou trabalhar */
  let next = escalonadorGlobal[0];
  escalonadorGlobal.splice(0, 1);

  nextMomento = next.momento;
  momentoAtual = nextMomento - momentoAnterior;
  momentoAnterior = nextMomento;
  //console.log('id: ', next.fila.id);
  //console.log('tipo: ', next.tipo);
  //console.log('agendadoPor: ', next.agendadoPor);
  //console.log('MOMENTO ATUAL: ', momentoAtual);
  //console.log('momentoAnterior: ', momentoAnterior);

  calcularProbabilidades();

  if(next.tipo === 'CHEGADA'){
    agendarChegada(fila, nextMomento);
  } else if (next.tipo === 'FILA'){
    filaDestino = fila;
    for(let i = 0; i < filasGlobal.length; i++){
      if(filasGlobal[i].id === next.agendadoPor){
        filaOrigem = filasGlobal[i];
      }
    };
    agendarFila(filaOrigem, filaDestino, nextMomento);
  } else {
    agendarSaida(fila, nextMomento);
  }

  //let tempoTotal = momentoAnterior;
  let tempoOcupada = momentoAnterior - fila.probabilidadesEstadosFila[0];
  //console.log('FILA! ', fila.id);
  //console.log('CONDIÇÃO DA FILA', fila.condicaoFila);

  fila.tempoOcupada = tempoOcupada;
  //fila.tempoTotal = tempoTotal;

  return true;
}

function simulacaoChegada(fila, numChegadasMax, seed){
  //console.log('SIMULAÇÃO PELA CHEGADA!');

  let agendaChegada = 0;
  let agendaSaida = 0;
  let filaOrigem = {};
  let filaDestino = {};

  //console.log('ESCALONADOR', escalonadorGlobal);

  /* Evento com o qual vou trabalhar */
  let next = escalonadorGlobal[0];
  escalonadorGlobal.splice(0, 1);

  nextMomento = next.momento;
  momentoAtual = nextMomento - momentoAnterior;
  momentoAnterior = nextMomento;
  //console.log('id: ', next.fila.id);
  //console.log('tipo: ', next.tipo);
  //console.log('agendadoPor: ', next.agendadoPor);
  //console.log('MOMENTO ATUAL: ', momentoAtual);
  //console.log('momentoAnterior: ', momentoAnterior);

  calcularProbabilidades();

  if(next.tipo === 'CHEGADA'){
    agendarChegada(fila, nextMomento);
  } else if (next.tipo === 'FILA'){
    filaDestino = fila;
    for(let i = 0; i < filasGlobal.length; i++){
      if(filasGlobal[i].id === next.agendadoPor){
        filaOrigem = filasGlobal[i];
      }
    };
    agendarFila(filaOrigem, filaDestino, nextMomento);
  } else {
    agendarSaida(fila, nextMomento);
  }

  //let tempoTotal = momentoAnterior;
  let tempoOcupada = momentoAnterior - fila.probabilidadesEstadosFila[0];
  //console.log('FILA! ', fila.id);
  //console.log('CONDIÇÃO DA FILA', fila.condicaoFila);

  fila.tempoOcupada = tempoOcupada;
  //fila.tempoTotal = tempoTotal;

  return true;
}

function agendarChegada(fila, nextMomento){
  console.log('VAMOS AGENDAR UMA CHEGADA!');
  let saiu = false;
  let filaDestino = {};

  fila.numChegadas++;
  numChegadasGlobal++;

  console.log('QUAL A CONDIÇÃO DA FILA? ', fila.condicaoFila);
  if(fila.condicaoFila < fila.capacidade){
    fila.condicaoFila++;
    if(fila.condicaoFila <= fila.servidores){
      for(let i = 0; i < fila.saidas.length; i++){
        //caso seja a última saída da lista de saídas, vai ser essa que vai ser agendada
        if(saiu === false && fila.saidas.length === i + 1){
          //verifico se sou uma saída ou outra fila
          if(fila.saidas[i].destino === 'Saída'){
            let agendaSaida = nextMomento + uniforme(fila.minServico, fila.maxServico);
            console.log('ESTOU NA FILA 1 E VOU AGENDAR PARA UMA SAIDA, SENDO QUE SOU A ULTIMA DA SUA LISTA DE SAIDAS: ');

            escalonadorGlobal.push({
              fila: fila,
              momento: agendaSaida,
              tipo: 'SAIDA',
              agendadoPor: fila.id
            });
          } else {
            for(let j = 0; j < filasGlobal.length; j++){
              if(filasGlobal[j].id === fila.saidas[i].destino){
                filaDestino = filasGlobal[j];
              }
            };

            console.log('ESTOU NA FILA 1 E VOU AGENDAR PARA UMA FILA, SENDO QUE SOU A ULTIMA DA SUA LISTA DE SAIDAS: ', filaDestino.id);
            let agendaFila = nextMomento + uniforme(fila.minServico, fila.maxServico);

            escalonadorGlobal.push({
              fila: filaDestino,
              momento: agendaFila,
              tipo: 'FILA',
              agendadoPor: fila.id
            });
          };
          saiu = true;
        }
        //caso ainda tenham mais saídas na lista de saídas da fila
        let numAleatorio = geraAleatorio();
        if(numAleatorio < 0.7){
          console.log('NUM ALEATORIO MAIOR QUE O.7', numAleatorio);
        }
        if(saiu === false && numAleatorio < (fila.saidas[i].porcentagem)/100){
          //verifico se sou uma saída ou outra fila
          if(fila.saidas[i].destino === 'Saída'){
            console.log('ESTOU NA FILA 1 E VOU AGENDAR PARA UMA SAIDA, SENDO QUE NÃO SOU A ULTIMA DA SUA LISTA DE SAIDAS: ');
            let agendaSaida = nextMomento + uniforme(fila.minServico, fila.maxServico);

            escalonadorGlobal.push({
              fila: fila,
              momento: agendaSaida,
              tipo: 'SAIDA',
              agendadoPor: fila.id
            });
          } else {
            for(let j = 0; j < filasGlobal.length; j++){
              if(filasGlobal[j].id === fila.saidas[i].destino){
                filaDestino = filasGlobal[j];
              }
            };

            console.log('ESTOU NA FILA 1 E VOU AGENDAR PARA UMA FILA, SENDO QUE NÃO SOU A ULTIMA DA SUA LISTA DE SAIDAS: ', filaDestino.id);
            let agendaFila = nextMomento + uniforme(fila.minServico, fila.maxServico);

            escalonadorGlobal.push({
              fila: filaDestino,
              momento: agendaFila,
              tipo: 'FILA',
              agendadoPor: fila.id
            });
          };
          saiu = true;
        };
      };
    };
  };

  console.log('DEVO AGENDAR UMA NOVA CHEGADA AQUI');
  let agendaChegada =  nextMomento + uniforme(fila.minChegada, fila.maxChegada);

  escalonadorGlobal.push({
    fila: fila,
    momento: agendaChegada,
    tipo: 'CHEGADA',
    agendadoPor: fila.id
  });

  return true;
}

function agendarFila(filaOrigem, filaDestino, nextMomento){
  console.log('VAMOS AGENDAR UMA FILA!');
  let saiuFilaOrigem = false;
  let saiuFilaDestino = false;
  let novaFilaDestino = {};

  numAtendimentosGlobal++;
  filaOrigem.numAtendimentos++;
  filaOrigem.condicaoFila--;
  //console.log('CONDIÇÃO DA FILA DE ORIGEM NO AGENDARFILA APÓS O DECREMENTO: ', filaOrigem);
  /*if(filaOrigem.condicaoFila < 0){
    filaOrigem.condicaoFila = 0;
  }*/

  if(filaOrigem.condicaoFila >= filaOrigem.servidores){
    console.log('RANDOM PARA AGENDAR OU FILA OU SAIDA');
    for(let i = 0; i < filaOrigem.saidas.length; i++){
      //caso seja a última saída da lista de saídas, vai ser essa que vai ser agendada
      if(saiuFilaOrigem === false && filaOrigem.saidas.length === i + 1){
        //verifico se sou uma saída ou outra fila
        if(filaOrigem.saidas[i].destino === 'Saída'){
          let agendaSaida = nextMomento + uniforme(filaOrigem.minServico, filaOrigem.maxServico);

          escalonadorGlobal.push({
            fila: filaOrigem,
            momento: agendaSaida,
            tipo: 'SAIDA',
            agendadoPor: filaOrigem.id
          });
        } else {
          let agendaFila = nextMomento + uniforme(filaOrigem.minServico, filaOrigem.maxServico);

          escalonadorGlobal.push({
            fila: filaDestino,
            momento: agendaFila,
            tipo: 'FILA',
            agendadoPor: filaOrigem.id
          });
        };
        saiuFilaOrigem = true;
      }
      //caso ainda tenham mais saídas na lista de saídas da fila
      let numAleatorio = geraAleatorio();
      if(saiuFilaOrigem === false && numAleatorio < (filaOrigem.saidas[i].porcentagem)/100){
        //verifico se sou uma saída ou outra fila
        if(filaOrigem.saidas[i].destino === 'Saída'){
          let agendaSaida = nextMomento + uniforme(filaOrigem.minServico, filaOrigem.maxServico);

          escalonadorGlobal.push({
            fila: filaOrigem,
            momento: agendaSaida,
            tipo: 'SAIDA',
            agendadoPor: filaOrigem.id
          });
        } else {
          let agendaFila = nextMomento + uniforme(filaOrigem.minServico, filaOrigem.maxServico);

          escalonadorGlobal.push({
            fila: filaDestino,
            momento: agendaFila,
            tipo: 'FILA',
            agendadoPor: filaOrigem.id
          });
        };
        saiuFilaOrigem = true;
      };
    };
  }

  filaDestino.numChegadas++;
  filaDestino.condicaoFila++;

  if(filaDestino.condicaoFila > filaDestino.capacidade){
    filaDestino.condicaoFila = filaDestino.capacidade;
  };

  //console.log('CONDIÇÃO DA FILA DE DESTINO NO AGENDARFILA APÓS O INCREMENTO: ', filaDestino);

  if(filaDestino.condicaoFila <= filaDestino.servidores){
    for(let i = 0; i < filaDestino.saidas.length; i++){
      //caso seja a última saída da lista de saídas, vai ser essa que vai ser agendada
      if(saiuFilaDestino === false && filaDestino.saidas.length === i + 1){
        //verifico se sou uma saída ou outra fila
        if(filaDestino.saidas[i].destino === 'Saída'){
          let agendaSaida = nextMomento + uniforme(filaDestino.minServico, filaDestino.maxServico);

          escalonadorGlobal.push({
            fila: filaDestino,
            momento: agendaSaida,
            tipo: 'SAIDA',
            agendadoPor: filaDestino.id
          });
        } else {
          for(let j = 0; j < filasGlobal.length; j++){
            if(filasGlobal[j].id === filaDestino.saidas[i].destino){
              novaFilaDestino = filasGlobal[j];
            }
          };

          let agendaFila = nextMomento + uniforme(filaDestino.minServico, filaDestino.maxServico);

          escalonadorGlobal.push({
            fila: novaFilaDestino,
            momento: agendaFila,
            tipo: 'FILA',
            agendadoPor: filaDestino.id
          });
        };
        saiuFilaDestino = true;
      }
      //caso ainda tenham mais saídas na lista de saídas da fila
      let numAleatorio = geraAleatorio();
      if(saiuFilaDestino === false && numAleatorio < (filaDestino.saidas[i].porcentagem)/100){
        //verifico se sou uma saída ou outra fila
        if(filaDestino.saidas[i].destino === 'Saída'){
          let agendaSaida = nextMomento + uniforme(filaDestino.minServico, filaDestino.maxServico);

          escalonadorGlobal.push({
            fila: filaDestino,
            momento: agendaSaida,
            tipo: 'SAIDA',
            agendadoPor: filaDestino.id
          });
        } else {
          for(let j = 0; j < filasGlobal.length; j++){
            if(filasGlobal[j].id === filaDestino.saidas[i].destino){
              novaFilaDestino = filasGlobal[j];
            }
          };

          let agendaFila = nextMomento + uniforme(filaDestino.minServico, filaDestino.maxServico);

          escalonadorGlobal.push({
            fila: novaFilaDestino,
            momento: agendaFila,
            tipo: 'FILA',
            agendadoPor: filaDestino.id
          });
        };
        saiuFilaDestino = true;
      };
    };
  }

  return true;
}

function agendarSaida(fila, nextMomento){
  console.log('VAMOS AGENDAR UMA SAÍDA!');
  let saiu = false;

  fila.numAtendimentos++;
  numAtendimentosGlobal++;

  fila.condicaoFila--;
  console.log('CONDIÇÃO DA FILA NA SAÍDA APÓS O DECREMENTO! ', fila.condicaoFila);
  /*if(fila.condicaoFila < 0){
    fila.condicaoFila = 0;
  }*/

  if(fila.condicaoFila >= fila.servidores){
    for(let i = 0; i < fila.saidas.length; i++){
      //caso seja a última saída da lista de saídas, vai ser essa que vai ser agendada
      if(saiu === false && fila.saidas.length === i + 1){
        //verifico se sou uma saída ou outra fila
        if(fila.saidas[i].destino === 'Saída'){
          let agendaSaida = nextMomento + uniforme(fila.minServico, fila.maxServico);

          escalonadorGlobal.push({
            fila: fila,
            momento: agendaSaida,
            tipo: 'SAIDA',
            agendadoPor: fila.id
          });
        } else {
          for(let j = 0; j < filasGlobal.length; j++){
            if(filasGlobal[j].id === fila.saidas[i].destino){
              filaDestino = filasGlobal[j];
            }
          };

          let agendaFila = nextMomento + uniforme(fila.minServico, fila.maxServico);

          escalonadorGlobal.push({
            fila: filaDestino,
            momento: agendaFila,
            tipo: 'FILA',
            agendadoPor: fila.id
          });
        };
        saiu = true;
      }
      //caso ainda tenham mais saídas na lista de saídas da fila
      let numAleatorio = geraAleatorio();
      if(saiu === false && numAleatorio < (fila.saidas[i].porcentagem)/100){
        //verifico se sou uma saída ou outra fila
        if(fila.saidas[i].destino === 'Saída'){
          let agendaSaida = nextMomento + uniforme(fila.minServico, fila.maxServico);

          escalonadorGlobal.push({
            fila: fila,
            momento: agendaSaida,
            tipo: 'SAIDA',
            agendadoPor: fila.id
          });
        } else {
          for(let j = 0; j < filasGlobal.length; j++){
            if(filasGlobal[j].id === fila.saidas[i].destino){
              filaDestino = filasGlobal[j];
            }
          };

          let agendaFila = nextMomento + uniforme(fila.minServico, fila.maxServico);

          escalonadorGlobal.push({
            fila: filaDestino,
            momento: agendaFila,
            tipo: 'FILA',
            agendadoPor: fila.id
          });
        };
        saiu = true;
      };
    };
  }

  return true;
}

function geraAleatorio(){
  let numAleatorio = random.float(min = 0, max = 1);

  return numAleatorio;
}

function uniforme(min, max){
  let numAleatorio = geraAleatorio();
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

function calculaProbabilidadesEstadosFila(filaRetorno){
  console.log('O QUE RECEBI PARA TRATAR: ', filaRetorno);
  let probEstadosFilaTratado = [];
  let x = 0;

  for(let i = 0; i < filaRetorno.length; i++){
    for(let j = 0; j < filaRetorno[i].probabilidadesEstadosFila.length; j++){
      if(filaRetorno[i].probabilidadesEstadosFila[j] === undefined){
        x = 0;
      } else {
        x = (filaRetorno[i].probabilidadesEstadosFila[j] * 100)/momentoAnterior;
      }
      probEstadosFilaTratado.push(x);
    }
    filaRetorno[i].probabilidadesEstadosFila = probEstadosFilaTratado;
    probEstadosFilaTratado = [];
  };

  //console.log('O QUE TRATEI: ', filaRetorno);
  return true;
}

function calcularProbabilidades(){
  let controle = 0;

  for(let i = 0; i < filasGlobal.length; i++){
    /*if(filasGlobal[i].condicaoFila > filasGlobal[i].capacidade){
      controle = filasGlobal[i].capacidade;
    } else {

    }*/
    controle = filasGlobal[i].condicaoFila;
    if(filasGlobal[i].probabilidadesEstadosFila[controle] === undefined){
      //console.log('filasGlobal[i].condicaoFila', filasGlobal[i]);
      //console.log('filasGlobal[i].condicaoFila', filasGlobal[i].condicaoFila);
      filasGlobal[i].probabilidadesEstadosFila[controle] = momentoAtual;
    } else {
      filasGlobal[i].probabilidadesEstadosFila[controle] = filasGlobal[i].probabilidadesEstadosFila[controle] + momentoAtual;
      //console.log('filasGlobal[i].condicaoFila', filasGlobal[i]);
      //console.log('filasGlobal[i].condicaoFila', filasGlobal[i].condicaoFila);
    };
  }

  //console.log('APÓS CÁLCULO DAS PROBABILIDADES: ', filasGlobal);
}

function ordenarProbabilidades(a, b){
  return a.porcentagem - b.porcentagem;
}

function ordenarMomentos(a, b){
  return a.momento - b.momento;
}
