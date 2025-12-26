import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Rodada,
  Associado,
  Confirmacao,
  Presenca,
  TimeRodada,
  ResultadoRodada,
  EstatisticaRodada,
  Eleicao,
  Grupo,
  Partida,
  TimePartida,
  EstatisticaPartida,
} from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const Jogos: React.FC = () => {
  const [rodadas, setRodadas] = useState<Rodada[]>([]);
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo | null>(null);
  const [rodadaSelecionada, setRodadaSelecionada] = useState<Rodada | null>(null);
  const [confirmacoes, setConfirmacoes] = useState<Confirmacao[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [times, setTimes] = useState<TimeRodada[]>([]);
  const [resultado, setResultado] = useState<ResultadoRodada[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticaRodada[]>([]);
  const [eleicoes, setEleicoes] = useState<Eleicao[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [partidaSelecionada, setPartidaSelecionada] = useState<Partida | null>(null);
  const [timesPartida, setTimesPartida] = useState<TimePartida[]>([]);
  const [estatisticasPartida, setEstatisticasPartida] = useState<EstatisticaPartida[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModalRodada, setShowModalRodada] = useState(false);
  const [showModalDivisaoManual, setShowModalDivisaoManual] = useState(false);
  const [showModalConfronto, setShowModalConfronto] = useState(false);
  const [showModalSumula, setShowModalSumula] = useState(false);
  const [abaSumula, setAbaSumula] = useState<'estatisticas' | 'cartoes' | 'resumo'>('estatisticas');
  const [divisaoManual, setDivisaoManual] = useState<{ associado_id: number; time: string; is_goleiro?: boolean }[]>([]);
  const [novoConfronto, setNovoConfronto] = useState({ timeA: '', timeB: '' });
  const [formDataRodada, setFormDataRodada] = useState({
    data: "",
    tipo_divisao: "sorteio" as "sorteio" | "manual",
    formato_tipo: "tempo" as "tempo" | "gols" | "tempos",
    formato_valor: 10,
    quantidade_tempos: 2,
  });

  useEffect(() => {
    carregarAssociados();
    carregarGrupos();
  }, []);

  const carregarGrupos = async () => {
    try {
      const response = await api.get("/grupos");
      setGrupos(response.data);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarAssociados = async () => {
    try {
      const response = await api.get("/associados");
      setAssociados(response.data);
    } catch (error) {
      console.error("Erro ao carregar associados:", error);
    }
  };

  const carregarRodadas = async (grupoId: number) => {
    try {
      const response = await api.get("/rodadas", {
        params: { grupo_id: grupoId },
      });
      setRodadas(response.data);
      // Recarregar o grupo selecionado para ter dados atualizados
      const grupoAtualizado = await api.get(`/grupos/${grupoId}`);
      setGrupoSelecionado(grupoAtualizado.data);
    } catch (error) {
      console.error("Erro ao carregar rodadas:", error);
    }
  };

  const carregarDetalhesRodada = async (rodada: Rodada) => {
    setRodadaSelecionada(rodada);
    try {
      const [confRes, presRes, timesRes, statsRes, eleicoesRes, resultadoRes, grupoRes, partidasRes] =
        await Promise.all([
          api.get(`/rodadas/${rodada.id}/confirmacoes`),
          api.get(`/rodadas/${rodada.id}/presencas`),
          api.get(`/rodadas/${rodada.id}/times`),
          api.get(`/rodadas/${rodada.id}/estatisticas`),
          api.get(`/rodadas/${rodada.id}/eleicoes`),
          api
            .get(`/rodadas/${rodada.id}/resultados`)
            .catch(() => ({ data: [] })),
          api.get(`/grupos/${rodada.grupo_id}`).catch(() => null),
          api.get(`/rodadas/${rodada.id}/partidas`).catch(() => ({ data: [] })),
        ]);

      setConfirmacoes(confRes.data);
      setPresencas(presRes.data);
      setTimes(timesRes.data);
      setEstatisticas(statsRes.data);
      setEleicoes(eleicoesRes.data);
      setResultado(resultadoRes.data);
      setPartidas(partidasRes.data || []);
      if (grupoRes?.data) {
        setGrupoSelecionado(grupoRes.data);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes da rodada:", error);
    }
  };

  const carregarDetalhesPartida = async (partida: Partida) => {
    setPartidaSelecionada(partida);
    try {
      const [timesRes, statsRes] = await Promise.all([
        api.get(`/rodadas/partidas/${partida.id}/times`),
        api.get(`/rodadas/partidas/${partida.id}/estatisticas`),
      ]);
      setTimesPartida(timesRes.data || []);
      setEstatisticasPartida(statsRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar detalhes da partida:", error);
    }
  };

  const handleCriarConfronto = async () => {
    if (!rodadaSelecionada || !novoConfronto.timeA || !novoConfronto.timeB) {
      alert('Selecione dois times diferentes');
      return;
    }
    if (novoConfronto.timeA === novoConfronto.timeB) {
      alert('Os times devem ser diferentes');
      return;
    }
    try {
      const partidaRes = await api.post(`/rodadas/${rodadaSelecionada.id}/partidas`);
      const partida = partidaRes.data;
      
      // Criar times da partida baseado nos times da rodada
      const timesRodadaA = times.filter(t => t.time === novoConfronto.timeA);
      const timesRodadaB = times.filter(t => t.time === novoConfronto.timeB);
      
      const timesPartidaData = [
        ...timesRodadaA.map(t => ({ associado_id: t.associado_id, time: 'A', is_goleiro: t.is_goleiro || false })),
        ...timesRodadaB.map(t => ({ associado_id: t.associado_id, time: 'B', is_goleiro: t.is_goleiro || false })),
      ];

      // Criar times da partida
      await api.post(`/rodadas/partidas/${partida.id}/dividir-times`, {
        divisao: timesPartidaData,
      });

      setNovoConfronto({ timeA: '', timeB: '' });
      setShowModalConfronto(false);
      carregarDetalhesRodada(rodadaSelecionada);
    } catch (error: any) {
      console.error("Erro ao criar confronto:", error);
      alert(error.response?.data?.error || "Erro ao criar confronto");
    }
  };

  const handleSalvarEstatisticaPartida = async (
    associadoId: number,
    campo: 'gols' | 'assistencias' | 'cartao_amarelo' | 'cartao_azul' | 'cartao_vermelho' | 'cartao_azul_vermelho',
    valor: number
  ) => {
    if (!partidaSelecionada) return;
    try {
      const estatisticaAtual = estatisticasPartida.find(e => e.associado_id === associadoId);
      await api.post(`/rodadas/partidas/${partidaSelecionada.id}/estatisticas`, {
        associado_id: associadoId,
        gols: campo === 'gols' ? valor : (estatisticaAtual?.gols || 0),
        assistencias: campo === 'assistencias' ? valor : (estatisticaAtual?.assistencias || 0),
        cartao_amarelo: campo === 'cartao_amarelo' ? valor : (estatisticaAtual?.cartao_amarelo || 0),
        cartao_azul: campo === 'cartao_azul' ? valor : (estatisticaAtual?.cartao_azul || 0),
        cartao_vermelho: campo === 'cartao_vermelho' ? valor : (estatisticaAtual?.cartao_vermelho || 0),
        cartao_azul_vermelho: campo === 'cartao_azul_vermelho' ? valor : (estatisticaAtual?.cartao_azul_vermelho || 0),
      });
      carregarDetalhesPartida(partidaSelecionada);
    } catch (error) {
      console.error("Erro ao salvar estatística:", error);
    }
  };

  const handleCriarRodada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoSelecionado?.id) return;
    try {
      await api.post("/rodadas", {
        grupo_id: grupoSelecionado.id,
        ...formDataRodada,
      });
      setShowModalRodada(false);
      setFormDataRodada({
        data: "",
        tipo_divisao: "sorteio",
        formato_tipo: "tempo",
        formato_valor: 10,
        quantidade_tempos: 2,
      });
      carregarRodadas(grupoSelecionado.id);
    } catch (error: any) {
      console.error("Erro ao criar rodada:", error);
      alert(error.response?.data?.error || "Erro ao criar rodada");
    }
  };

  const handleConfirmar = async (associadoId: number, confirmado: boolean) => {
    if (!rodadaSelecionada) return;
    try {
      await api.post(`/rodadas/${rodadaSelecionada.id}/confirmar`, {
        associado_id: associadoId,
        confirmado,
      });
      carregarDetalhesRodada(rodadaSelecionada);
    } catch (error) {
      console.error("Erro ao confirmar:", error);
    }
  };

  const handleCheckin = async (associadoId: number, presente: boolean) => {
    if (!rodadaSelecionada) return;
    try {
      await api.post(`/rodadas/${rodadaSelecionada.id}/checkin`, {
        associado_id: associadoId,
        presente,
      });
      carregarDetalhesRodada(rodadaSelecionada);
    } catch (error) {
      console.error("Erro ao fazer check-in:", error);
    }
  };

  const handleSortearTimes = async () => {
    if (!rodadaSelecionada) return;
    try {
      await api.post(`/rodadas/${rodadaSelecionada.id}/sortear-times`);
      carregarDetalhesRodada(rodadaSelecionada);
    } catch (error: any) {
      console.error("Erro ao sortear times:", error);
      alert(error.response?.data?.error || "Erro ao sortear times");
    }
  };

  const handleAbrirDivisaoManual = () => {
    if (!rodadaSelecionada) return;
    // Inicializar divisão manual com jogadores presentes
    const presentes = presencas.filter(p => p.presente);
    const divisaoInicial = presentes.map(p => ({
      associado_id: p.associado_id,
      time: '',
      is_goleiro: false,
    }));
    setDivisaoManual(divisaoInicial);
    setShowModalDivisaoManual(true);
  };

  const handleSalvarDivisaoManual = async () => {
    if (!rodadaSelecionada) return;
    try {
      // Validar que todos os jogadores têm time atribuído
      const jogadoresSemTime = divisaoManual.filter(d => !d.time);
      if (jogadoresSemTime.length > 0) {
        alert('Todos os jogadores devem ter um time atribuído');
        return;
      }

      await api.post(`/rodadas/${rodadaSelecionada.id}/dividir-times`, {
        divisao: divisaoManual,
      });
      setShowModalDivisaoManual(false);
      carregarDetalhesRodada(rodadaSelecionada);
    } catch (error: any) {
      console.error("Erro ao salvar divisão manual:", error);
      alert(error.response?.data?.error || "Erro ao salvar divisão manual");
    }
  };

  const calcularQuantidadeMaximaTimes = () => {
    if (!grupoSelecionado || !rodadaSelecionada) return 2;
    const quantidadeJogadoresLinha = grupoSelecionado.quantidade_jogadores_linha || 6;
    const totalJogadores = presencas.filter(p => p.presente).length;
    return Math.floor(totalJogadores / quantidadeJogadoresLinha) || 2;
  };

  const getTimesDisponiveis = () => {
    const quantidadeMaxima = calcularQuantidadeMaximaTimes();
    const times = [];
    for (let i = 0; i < quantidadeMaxima; i++) {
      times.push(String.fromCharCode(65 + i)); // A, B, C, D...
    }
    return times;
  };

  const handleSalvarResultado = async (timeNome: string, gols: number) => {
    if (!rodadaSelecionada) return;
    try {
      await api.post(`/rodadas/${rodadaSelecionada.id}/resultado`, {
        time_nome: timeNome,
        gols,
      });
      carregarDetalhesRodada(rodadaSelecionada);
    } catch (error) {
      console.error("Erro ao salvar resultado:", error);
    }
  };

  const handleVotarEleicao = async (
    tipo: "craque" | "abacaxi" | "melhor_goleiro",
    associadoId: number
  ) => {
    if (!rodadaSelecionada) return;
    try {
      await api.post(`/rodadas/${rodadaSelecionada.id}/eleicao`, {
        tipo,
        associado_id: associadoId,
      });
      carregarDetalhesRodada(rodadaSelecionada);
    } catch (error) {
      console.error("Erro ao votar:", error);
    }
  };

  const handleFinalizarPartida = async () => {
    if (!partidaSelecionada) return;
    try {
      await api.post(`/rodadas/partidas/${partidaSelecionada.id}/finalizar`);
      alert('Partida finalizada com sucesso!');
      setShowModalSumula(false);
      setPartidaSelecionada(null);
      if (rodadaSelecionada) {
        carregarDetalhesRodada(rodadaSelecionada);
      }
    } catch (error: any) {
      console.error('Erro ao finalizar partida:', error);
      alert(error.response?.data?.error || 'Erro ao finalizar partida');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Rodadas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Grupos</h2>
          <div className="space-y-2">
            {grupos.map((grupo) => (
              <div
                key={grupo.id}
                onClick={() => {
                  setGrupoSelecionado(grupo);
                  carregarRodadas(grupo.id!);
                }}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  grupoSelecionado?.id === grupo.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold">{grupo.nome}</div>
                <div className="text-sm text-gray-500">
                  {diasSemana[grupo.dia_semana]} - {grupo.horario_inicio} às {grupo.horario_fim}
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {grupo.periodicidade} • {grupo.quantidade_jogadores_linha} jogadores
                </div>
              </div>
            ))}
          </div>
        </div>

        {grupoSelecionado && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{grupoSelecionado.nome}</h2>
            <p className="text-gray-600 mb-4">
              {diasSemana[grupoSelecionado.dia_semana]} - {grupoSelecionado.horario_inicio} às {grupoSelecionado.horario_fim} - {grupoSelecionado.periodicidade}
            </p>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Rodadas</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {rodadas.map((rodada) => (
                  <div
                    key={rodada.id}
                    onClick={() => carregarDetalhesRodada(rodada)}
                    className={`p-2 border rounded cursor-pointer ${
                      rodadaSelecionada?.id === rodada.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    {format(new Date(rodada.data), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFormDataRodada({
                      ...formDataRodada,
                      data: new Date().toISOString().split("T")[0],
                      formato_valor: formDataRodada.formato_tipo === "tempos" ? 45 : formDataRodada.formato_valor,
                    });
                    setShowModalRodada(true);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                >
                  + Nova Rodada
                </button>
              </div>
            </div>
          </div>
        )}

        {rodadaSelecionada && (
          <div className="bg-white rounded-lg shadow-md p-6 col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              Rodada de{" "}
              {format(new Date(rodadaSelecionada.data), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Confirmações</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {associados.map((assoc) => {
                    const confirmacao = confirmacoes.find(
                      (c) => c.associado_id === assoc.id
                    );
                    const estaConfirmado = confirmacao?.confirmado || false;
                    return (
                      <div
                        key={assoc.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <span className="truncate">{assoc.apelido}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">({assoc.posicao})</span>
                        </div>
                        <button
                          onClick={() =>
                            handleConfirmar(assoc.id!, !estaConfirmado)
                          }
                          className={`px-2 py-1 rounded text-xs flex-shrink-0 ml-2 ${
                            estaConfirmado
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {estaConfirmado ? "✓" : "✗"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Check-in</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {associados
                    .filter((assoc) =>
                      confirmacoes.find(
                        (c) => c.associado_id === assoc.id && c.confirmado
                      )
                    )
                    .map((assoc) => {
                      const presenca = presencas.find(
                        (p) => p.associado_id === assoc.id
                      );
                      const estaPresente = presenca?.presente || false;
                      return (
                        <div
                          key={assoc.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <span className="truncate">{assoc.apelido}</span>
                            <span className="text-xs text-gray-500 flex-shrink-0">({assoc.posicao})</span>
                          </div>
                          <button
                            onClick={() =>
                              handleCheckin(assoc.id!, !estaPresente)
                            }
                            className={`px-2 py-1 rounded text-xs flex-shrink-0 ml-2 ${
                              estaPresente
                                ? "bg-blue-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {estaPresente ? "✓" : "✗"}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSortearTimes}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Sortear Times
                </button>
                <button
                  onClick={handleAbrirDivisaoManual}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Dividir Times Manualmente
                </button>
              </div>

              {times.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Times</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from(new Set(times.map((t) => t.time))).map((timeNome) => (
                      <div key={timeNome}>
                        <h4 className="font-medium mb-2">Time {timeNome}</h4>
                        {times
                          .filter((t) => t.time === timeNome)
                          .sort((a, b) => {
                            // Goleiros primeiro
                            if (a.is_goleiro && !b.is_goleiro) return -1;
                            if (!a.is_goleiro && b.is_goleiro) return 1;
                            return 0;
                          })
                          .map((t) => {
                            const assoc = associados.find(
                              (a) => a.id === t.associado_id
                            );
                            return (
                              <div 
                                key={t.id} 
                                className={`text-sm ${t.is_goleiro ? 'font-bold text-blue-600' : ''}`}
                              >
                                {t.is_goleiro ? '🥅 ' : ''}
                                {assoc?.apelido}
                                <span className="text-xs text-gray-500 ml-1">({assoc?.posicao})</span>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {times.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Confrontos</h3>
                    <button
                      onClick={() => setShowModalConfronto(true)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      + Novo Confronto
                    </button>
                  </div>
                  {partidas.length > 0 ? (
                    <div className="space-y-3">
                      {partidas.map((partida) => (
                        <div key={partida.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Confronto #{partida.numero}</span>
                            <button
                              onClick={async () => {
                                await carregarDetalhesPartida(partida);
                                setAbaSumula('estatisticas');
                                setShowModalSumula(true);
                              }}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Ver Súmula
                            </button>
                          </div>
                          <div className="text-sm text-gray-600">
                            {partida.inicio_em && `Início: ${format(new Date(partida.inicio_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum confronto criado ainda</p>
                  )}
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Eleições</h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Craque da Rodada
                    </h4>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleVotarEleicao(
                            "craque",
                            parseInt(e.target.value)
                          );
                        }
                      }}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Selecione</option>
                      {associados.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.apelido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Abacaxi da Rodada
                    </h4>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleVotarEleicao(
                            "abacaxi",
                            parseInt(e.target.value)
                          );
                        }
                      }}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Selecione</option>
                      {associados.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.apelido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Melhor Goleiro</h4>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleVotarEleicao(
                            "melhor_goleiro",
                            parseInt(e.target.value)
                          );
                        }
                      }}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Selecione</option>
                      {associados
                        .filter((a) => a.posicao === "Goleiro")
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.apelido}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModalRodada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Nova Rodada</h2>
            <form onSubmit={handleCriarRodada} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formDataRodada.data}
                  onChange={(e) =>
                    setFormDataRodada({ ...formDataRodada, data: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Divisão
                </label>
                <select
                  required
                  value={formDataRodada.tipo_divisao}
                  onChange={(e) =>
                    setFormDataRodada({
                      ...formDataRodada,
                      tipo_divisao: e.target.value as "sorteio" | "manual",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sorteio">Sorteio</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato do Jogo
                </label>
                <select
                  required
                  value={formDataRodada.formato_tipo}
                    onChange={(e) => {
                      const novoFormato = e.target.value as "tempo" | "gols" | "tempos";
                      setFormDataRodada({
                        ...formDataRodada,
                        formato_tipo: novoFormato,
                        formato_valor: novoFormato === "tempos" ? 45 : novoFormato === "tempo" ? 10 : 2,
                        quantidade_tempos: novoFormato === "tempos" ? 2 : formDataRodada.quantidade_tempos,
                      });
                    }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tempo">Tempo (minutos)</option>
                  <option value="gols">Gols</option>
                  <option value="tempos">Tempos (45min cada lado)</option>
                </select>
              </div>
              {formDataRodada.formato_tipo === "tempo" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minutos
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="120"
                    value={formDataRodada.formato_valor}
                    onChange={(e) =>
                      setFormDataRodada({
                        ...formDataRodada,
                        formato_valor: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {formDataRodada.formato_tipo === "gols" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade de Gols
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="20"
                    value={formDataRodada.formato_valor}
                    onChange={(e) =>
                      setFormDataRodada({
                        ...formDataRodada,
                        formato_valor: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {formDataRodada.formato_tipo === "tempos" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minutos por Tempo
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="45"
                      value={formDataRodada.formato_valor || 45}
                      onChange={(e) =>
                        setFormDataRodada({
                          ...formDataRodada,
                          formato_valor: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Total: {(formDataRodada.formato_valor || 45) * (formDataRodada.quantidade_tempos || 2)} minutos (padrão: 90min)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade de Tempos
                    </label>
                    <input
                      type="number"
                      required
                      min="2"
                      max="4"
                      value={formDataRodada.quantidade_tempos || 2}
                      onChange={(e) =>
                        setFormDataRodada({
                          ...formDataRodada,
                          quantidade_tempos: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModalRodada(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModalDivisaoManual && rodadaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Divisão Manual de Times</h2>
            <p className="text-sm text-gray-600 mb-4">
              Quantidade máxima de times: {calcularQuantidadeMaximaTimes()} (baseado em {presencas.filter(p => p.presente).length} jogadores / {grupoSelecionado?.quantidade_jogadores_linha || 6} por time)
            </p>
            <div className="space-y-4">
              {divisaoManual.map((item, index) => {
                const assoc = associados.find(a => a.id === item.associado_id);
                const isGoleiro = assoc?.posicao?.toLowerCase() === 'goleiro';
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">
                        {isGoleiro ? '🥅 ' : ''}
                        {assoc?.apelido}
                        <span className="text-sm text-gray-500 ml-2">({assoc?.posicao})</span>
                      </div>
                      <div className="text-sm text-gray-500">{assoc?.nome}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm">Time:</label>
                      <select
                        value={item.time}
                        onChange={(e) => {
                          const novaDivisao = [...divisaoManual];
                          novaDivisao[index].time = e.target.value;
                          setDivisaoManual(novaDivisao);
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione...</option>
                        {getTimesDisponiveis().map(time => (
                          <option key={time} value={time}>Time {time}</option>
                        ))}
                      </select>
                      {isGoleiro && (
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={item.is_goleiro || false}
                            onChange={(e) => {
                              const novaDivisao = [...divisaoManual];
                              novaDivisao[index].is_goleiro = e.target.checked;
                              setDivisaoManual(novaDivisao);
                            }}
                            className="rounded"
                          />
                          <span>Goleiro</span>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModalDivisaoManual(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarDivisaoManual}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvar Divisão
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalConfronto && rodadaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Novo Confronto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time A
                </label>
                <select
                  value={novoConfronto.timeA}
                  onChange={(e) => setNovoConfronto({ ...novoConfronto, timeA: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {Array.from(new Set(times.map((t) => t.time))).map((timeNome) => (
                    <option key={timeNome} value={timeNome}>
                      Time {timeNome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time B
                </label>
                <select
                  value={novoConfronto.timeB}
                  onChange={(e) => setNovoConfronto({ ...novoConfronto, timeB: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {Array.from(new Set(times.map((t) => t.time))).map((timeNome) => (
                    <option key={timeNome} value={timeNome}>
                      Time {timeNome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModalConfronto(false);
                    setNovoConfronto({ timeA: '', timeB: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCriarConfronto}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Criar Confronto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModalSumula && partidaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-4 mx-4 max-h-[95vh] overflow-hidden">
            {/* Header com placar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Súmula - Confronto #{partidaSelecionada.numero}</h2>
                <button
                  onClick={() => {
                    setShowModalSumula(false);
                    setPartidaSelecionada(null);
                  }}
                  className="text-white hover:text-blue-200 transition p-2 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Placar do jogo */}
              <div className="mt-4 flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-8 py-4">
                  <div className="text-center">
                    <div className="text-sm text-blue-200 mb-1">PLACAR</div>
                    <div className="text-4xl font-bold">0 x 0</div>
                    <div className="text-sm text-blue-200 mt-1">Em andamento</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo com abas */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
              {/* Abas */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setAbaSumula('estatisticas')}
                    className={`py-2 px-1 text-sm font-medium transition ${
                      abaSumula === 'estatisticas'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📊 Estatísticas
                  </button>
                  <button
                    onClick={() => setAbaSumula('cartoes')}
                    className={`py-2 px-1 text-sm font-medium transition ${
                      abaSumula === 'cartoes'
                        ? 'border-b-2 border-yellow-500 text-yellow-600'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🟡 Cartões
                  </button>
                  <button
                    onClick={() => setAbaSumula('resumo')}
                    className={`py-2 px-1 text-sm font-medium transition ${
                      abaSumula === 'resumo'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📋 Resumo
                  </button>
                </nav>
              </div>

              {/* Conteúdo das abas */}
              {abaSumula === 'estatisticas' && (
                <div className="space-y-8">
                  {/* Time A */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-center bg-blue-50 py-2 rounded-lg">
                      🏆 Time A
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jogador</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">⚽</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🎯</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🟡</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🔵</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🔴</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🔵🔴</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {timesPartida
                            .filter(t => t.time === 'A')
                            .map((t) => {
                              const assoc = associados.find(a => a.id === t.associado_id);
                              const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                              const isGoleiro = t.is_goleiro || assoc?.posicao?.toLowerCase() === 'goleiro';
                              return (
                                <tr key={t.id} className="hover:bg-blue-50 transition">
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {isGoleiro && <span className="text-lg mr-2">🥅</span>}
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">{assoc?.apelido}</div>
                                        <div className="text-xs text-gray-500">{assoc?.posicao}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.gols || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'gols', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.assistencias || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'assistencias', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.cartao_amarelo || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'cartao_amarelo', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.cartao_azul || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'cartao_azul', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.cartao_vermelho || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'cartao_vermelho', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.cartao_azul_vermelho || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'cartao_azul_vermelho', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Separador VS */}
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                      VS
                    </div>
                  </div>

                  {/* Time B */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-center bg-red-50 py-2 rounded-lg">
                      🏆 Time B
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jogador</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">⚽</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🎯</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🟡</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🔵</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🔴</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🔵🔴</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {timesPartida
                            .filter(t => t.time === 'B')
                            .map((t) => {
                              const assoc = associados.find(a => a.id === t.associado_id);
                              const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                              const isGoleiro = t.is_goleiro || assoc?.posicao?.toLowerCase() === 'goleiro';
                              return (
                                <tr key={t.id} className="hover:bg-red-50 transition">
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {isGoleiro && <span className="text-lg mr-2">🥅</span>}
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">{assoc?.apelido}</div>
                                        <div className="text-xs text-gray-500">{assoc?.posicao}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.gols || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'gols', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.assistencias || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'assistencias', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.cartao_amarelo || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'cartao_amarelo', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.cartao_azul || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'cartao_azul', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.cartao_vermelho || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'cartao_vermelho', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={stats?.cartao_azul_vermelho || 0}
                                      className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      onBlur={(e) => handleSalvarEstatisticaPartida(t.associado_id, 'cartao_azul_vermelho', parseInt(e.target.value) || 0)}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {abaSumula === 'cartoes' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-center">🟡 Cartões da Partida</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time A Cartões */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3 text-center">Time A</h4>
                      <div className="space-y-2">
                        {timesPartida
                          .filter(t => t.time === 'A')
                          .map((t) => {
                            const assoc = associados.find(a => a.id === t.associado_id);
                            const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                            const totalCartoes = (stats?.cartao_amarelo || 0) + (stats?.cartao_azul || 0) + (stats?.cartao_vermelho || 0) + (stats?.cartao_azul_vermelho || 0);
                            if (totalCartoes === 0) return null;
                            return (
                              <div key={t.id} className="flex items-center justify-between bg-white p-2 rounded">
                                <span className="text-sm font-medium">{assoc?.apelido}</span>
                                <div className="flex space-x-1">
                                  {Array.from({length: stats?.cartao_amarelo || 0}, (_, i) => (
                                    <span key={`yellow-${i}`} className="text-lg">🟡</span>
                                  ))}
                                  {Array.from({length: stats?.cartao_azul || 0}, (_, i) => (
                                    <span key={`blue-${i}`} className="text-lg">🔵</span>
                                  ))}
                                  {Array.from({length: stats?.cartao_vermelho || 0}, (_, i) => (
                                    <span key={`red-${i}`} className="text-lg">🔴</span>
                                  ))}
                                  {Array.from({length: stats?.cartao_azul_vermelho || 0}, (_, i) => (
                                    <span key={`blue-red-${i}`} className="text-lg">🔵🔴</span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        {timesPartida.filter(t => t.time === 'A').every(t => {
                          const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                          return ((stats?.cartao_amarelo || 0) + (stats?.cartao_azul || 0) + (stats?.cartao_vermelho || 0) + (stats?.cartao_azul_vermelho || 0)) === 0;
                        }) && (
                          <p className="text-center text-gray-500 text-sm py-4">Nenhum cartão para o Time A</p>
                        )}
                      </div>
                    </div>

                    {/* Time B Cartões */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3 text-center">Time B</h4>
                      <div className="space-y-2">
                        {timesPartida
                          .filter(t => t.time === 'B')
                          .map((t) => {
                            const assoc = associados.find(a => a.id === t.associado_id);
                            const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                            const totalCartoes = (stats?.cartao_amarelo || 0) + (stats?.cartao_azul || 0) + (stats?.cartao_vermelho || 0) + (stats?.cartao_azul_vermelho || 0);
                            if (totalCartoes === 0) return null;
                            return (
                              <div key={t.id} className="flex items-center justify-between bg-white p-2 rounded">
                                <span className="text-sm font-medium">{assoc?.apelido}</span>
                                <div className="flex space-x-1">
                                  {Array.from({length: stats?.cartao_amarelo || 0}, (_, i) => (
                                    <span key={`yellow-${i}`} className="text-lg">🟡</span>
                                  ))}
                                  {Array.from({length: stats?.cartao_azul || 0}, (_, i) => (
                                    <span key={`blue-${i}`} className="text-lg">🔵</span>
                                  ))}
                                  {Array.from({length: stats?.cartao_vermelho || 0}, (_, i) => (
                                    <span key={`red-${i}`} className="text-lg">🔴</span>
                                  ))}
                                  {Array.from({length: stats?.cartao_azul_vermelho || 0}, (_, i) => (
                                    <span key={`blue-red-${i}`} className="text-lg">🔵🔴</span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        {timesPartida.filter(t => t.time === 'B').every(t => {
                          const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                          return ((stats?.cartao_amarelo || 0) + (stats?.cartao_azul || 0) + (stats?.cartao_vermelho || 0) + (stats?.cartao_azul_vermelho || 0)) === 0;
                        }) && (
                          <p className="text-center text-gray-500 text-sm py-4">Nenhum cartão para o Time B</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {abaSumula === 'resumo' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-center">📋 Resumo da Partida</h3>

                  {/* Estatísticas Gerais */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {timesPartida.filter(t => t.time === 'A').reduce((total, t) => {
                          const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                          return total + (stats?.gols || 0);
                        }, 0)}
                      </div>
                      <div className="text-sm">Gols Time A</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">VS</div>
                      <div className="text-sm">Confronto</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {timesPartida.filter(t => t.time === 'B').reduce((total, t) => {
                          const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                          return total + (stats?.gols || 0);
                        }, 0)}
                      </div>
                      <div className="text-sm">Gols Time B</div>
                    </div>
                  </div>

                  {/* Maiores Pontuadores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold mb-3">🏆 Artilheiros</h4>
                      <div className="space-y-2">
                        {[...timesPartida]
                          .sort((a, b) => {
                            const statsA = estatisticasPartida.find(e => e.associado_id === a.associado_id);
                            const statsB = estatisticasPartida.find(e => e.associado_id === b.associado_id);
                            return (statsB?.gols || 0) - (statsA?.gols || 0);
                          })
                          .filter(t => {
                            const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                            return (stats?.gols || 0) > 0;
                          })
                          .slice(0, 3)
                          .map((t, index) => {
                            const assoc = associados.find(a => a.id === t.associado_id);
                            const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                            return (
                              <div key={t.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{['🥇', '🥈', '🥉'][index]}</span>
                                  <span className="font-medium">{assoc?.apelido}</span>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Time {t.time}</span>
                                </div>
                                <span className="font-bold text-lg">{stats?.gols || 0} ⚽</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold mb-3">🎯 Assistências</h4>
                      <div className="space-y-2">
                        {[...timesPartida]
                          .sort((a, b) => {
                            const statsA = estatisticasPartida.find(e => e.associado_id === a.associado_id);
                            const statsB = estatisticasPartida.find(e => e.associado_id === b.associado_id);
                            return (statsB?.assistencias || 0) - (statsA?.assistencias || 0);
                          })
                          .filter(t => {
                            const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                            return (stats?.assistencias || 0) > 0;
                          })
                          .slice(0, 3)
                          .map((t, index) => {
                            const assoc = associados.find(a => a.id === t.associado_id);
                            const stats = estatisticasPartida.find(e => e.associado_id === t.associado_id);
                            return (
                              <div key={t.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{['🥇', '🥈', '🥉'][index]}</span>
                                  <span className="font-medium">{assoc?.apelido}</span>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Time {t.time}</span>
                                </div>
                                <span className="font-bold text-lg">{stats?.assistencias || 0} 🎯</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Informações da Partida */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">📊 Informações Gerais</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {timesPartida.filter(t => t.time === 'A').length}
                        </div>
                        <div className="text-sm text-gray-600">Jogadores Time A</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {timesPartida.filter(t => t.time === 'B').length}
                        </div>
                        <div className="text-sm text-gray-600">Jogadores Time B</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {estatisticasPartida.reduce((total, stats) => total + (stats.cartao_amarelo || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Cartões Amarelos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {estatisticasPartida.reduce((total, stats) => total + (stats.cartao_vermelho || 0) + (stats.cartao_azul_vermelho || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Cartões Vermelhos</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer com ações */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleFinalizarPartida}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    ✅ Finalizar Partida
                  </button>
                  <button
                    onClick={() => {
                      setShowModalSumula(false);
                      setPartidaSelecionada(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jogos;
