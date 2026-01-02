import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Rodada, Grupo, Partida, EstatisticaPartida, TimePartida, Associado } from "../types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

const Calendario: React.FC = () => {
  const [rodadas, setRodadas] = useState<Rodada[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [dataAtual, setDataAtual] = useState(new Date());
  const [filtroPeriodicidade, setFiltroPeriodicidade] = useState<
    "semanal" | "quinzenal" | "mensal" | "todos"
  >("todos");
  const [loading, setLoading] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [rodadasDiaSelecionado, setRodadasDiaSelecionado] = useState<Rodada[]>([]);
  const [partidasDia, setPartidasDia] = useState<Partida[]>([]);
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [estatisticasPartidas, setEstatisticasPartidas] = useState<{[partidaId: number]: EstatisticaPartida[]}>({});
  const [timesPartidas, setTimesPartidas] = useState<{[partidaId: number]: TimePartida[]}>({});
  const [loadingSumula, setLoadingSumula] = useState(false);

  useEffect(() => {
    carregarGrupos();
    carregarAssociados();
  }, []);

  useEffect(() => {
    if (grupos.length > 0) {
      carregarRodadas();
    }
  }, [dataAtual, filtroPeriodicidade, grupos]);

  const carregarGrupos = async () => {
    try {
      const response = await api.get("/grupos");
      setGrupos(response.data);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
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

  const carregarRodadas = async () => {
    try {
      const inicio = startOfMonth(dataAtual).toISOString().split("T")[0];
      const fim = endOfMonth(dataAtual).toISOString().split("T")[0];

      const params: any = { inicio, fim };
      
      // Se houver filtro de periodicidade, buscar grupos com essa periodicidade primeiro
      if (filtroPeriodicidade !== "todos") {
        const gruposFiltrados = grupos.filter(g => g.periodicidade === filtroPeriodicidade);
        if (gruposFiltrados.length > 0) {
          // Buscar rodadas de cada grupo filtrado
          const rodadasPromises = gruposFiltrados.map(grupo =>
            api.get("/rodadas", { params: { grupo_id: grupo.id, inicio, fim } })
          );
          const responses = await Promise.all(rodadasPromises);
          const todasRodadas = responses.flatMap(r => r.data);
          setRodadas(todasRodadas);
          setLoading(false);
          return;
        }
      }

      const response = await api.get("/rodadas", { params });
      setRodadas(response.data);
    } catch (error) {
      console.error("Erro ao carregar rodadas:", error);
    } finally {
      setLoading(false);
    }
  };

  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(dataAtual),
    end: endOfMonth(dataAtual),
  });

  const primeiroDiaSemana = startOfMonth(dataAtual).getDay();
  const diasVazios = Array(primeiroDiaSemana).fill(null);

  const rodadasDoDia = (dia: Date) => {
    return rodadas.filter((rodada) => isSameDay(new Date(rodada.data), dia));
  };

  const carregarSumulaDia = async (dia: Date) => {
    const rodadasDia = rodadasDoDia(dia);
    setDiaSelecionado(dia);
    setRodadasDiaSelecionado(rodadasDia);
    setLoadingSumula(true);

    try {
      // Carregar todas as partidas das rodadas do dia
      const partidasPromises = rodadasDia.map(rodada =>
        api.get(`/rodadas/${rodada.id}/partidas`).catch(() => ({ data: [] }))
      );

      const partidasResponses = await Promise.all(partidasPromises);
      const todasPartidas = partidasResponses.flatMap(response => response.data || []);

      setPartidasDia(todasPartidas);

      // Carregar estatísticas e times de cada partida
      const estatisticasMap: {[partidaId: number]: EstatisticaPartida[]} = {};
      const timesMap: {[partidaId: number]: TimePartida[]} = {};

      for (const partida of todasPartidas) {
        try {
          const [statsRes, timesRes] = await Promise.all([
            api.get(`/rodadas/partidas/${partida.id}/estatisticas`),
            api.get(`/rodadas/partidas/${partida.id}/times`)
          ]);
          estatisticasMap[partida.id] = statsRes.data || [];
          timesMap[partida.id] = timesRes.data || [];
        } catch (error) {
          console.error(`Erro ao carregar dados da partida ${partida.id}:`, error);
          estatisticasMap[partida.id] = [];
          timesMap[partida.id] = [];
        }
      }

      setEstatisticasPartidas(estatisticasMap);
      setTimesPartidas(timesMap);
    } catch (error) {
      console.error("Erro ao carregar súmula do dia:", error);
    } finally {
      setLoadingSumula(false);
    }
  };

  const mesAnterior = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1));
  };

  const mesProximo = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1));
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Calendário</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filtroPeriodicidade}
            onChange={(e) => setFiltroPeriodicidade(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="todos">Todos</option>
            <option value="semanal">Semanal</option>
            <option value="quinzenal">Quinzenal</option>
            <option value="mensal">Mensal</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={mesAnterior}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Anterior
          </button>
          <h2 className="text-2xl font-semibold">
            {format(dataAtual, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <button
            onClick={mesProximo}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Próximo →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div
              key={dia}
              className="text-center font-semibold text-gray-600 py-2"
            >
              {dia}
            </div>
          ))}

          {diasVazios.map((_, index) => (
            <div key={`empty-${index}`} className="h-24"></div>
          ))}

          {diasDoMes.map((dia) => {
            const rodadasDia = rodadasDoDia(dia);
            const hoje = isSameDay(dia, new Date());
            const diaSelecionadoAtual = diaSelecionado && isSameDay(dia, diaSelecionado);
            return (
              <div
                key={dia.toISOString()}
                onClick={() => rodadasDia.length > 0 && carregarSumulaDia(dia)}
                className={`h-24 border border-gray-200 p-2 rounded cursor-pointer transition ${
                  hoje ? "bg-blue-50 border-blue-300" : ""
                } ${
                  diaSelecionadoAtual ? "ring-2 ring-blue-500 bg-blue-100" : ""
                } ${
                  rodadasDia.length > 0 ? "hover:bg-gray-50 hover:border-gray-300" : ""
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    hoje ? "text-blue-600" : diaSelecionadoAtual ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {format(dia, "d")}
                </div>
                <div className="mt-1 space-y-1">
                  {rodadasDia.map((rodada) => {
                    const grupo = grupos.find((g) => g.id === rodada.grupo_id);
                    return (
                      <div
                        key={rodada.id}
                        className={`text-xs px-1 py-0.5 rounded ${
                          grupo?.periodicidade === "semanal"
                            ? "bg-green-100 text-green-800"
                            : grupo?.periodicidade === "quinzenal"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                        title={grupo?.nome || "Rodada"}
                      >
                        {grupo?.nome || "Rodada"}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Súmulas do dia selecionado */}
      {diaSelecionado && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              📋 Súmulas - {format(diaSelecionado, "dd/MM/yyyy", { locale: ptBR })}
            </h2>
            <button
              onClick={() => {
                setDiaSelecionado(null);
                setRodadasDiaSelecionado([]);
                setPartidasDia([]);
                setEstatisticasPartidas({});
                setTimesPartidas({});
              }}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loadingSumula ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Carregando súmulas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Rodadas do dia */}
              {rodadasDiaSelecionado.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">🏆 Rodadas</h3>
                  <div className="space-y-3">
                    {rodadasDiaSelecionado.map((rodada) => {
                      const grupo = grupos.find((g: Grupo) => g.id === rodada.grupo_id);
                      return (
                        <div key={rodada.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{grupo?.nome || 'Grupo'}</h4>
                              <p className="text-sm text-gray-600">
                                {rodada.formato_tipo === 'tempo' && `⏱️ ${rodada.formato_valor}min`}
                                {rodada.formato_tipo === 'gols' && `⚽ ${rodada.formato_valor} gols`}
                                {rodada.formato_tipo === 'tempos' && `⏱️ ${rodada.formato_valor}min × ${rodada.quantidade_tempos} tempos`}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              rodada.tipo_divisao === 'sorteio' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {rodada.tipo_divisao === 'sorteio' ? '🎲 Sorteio' : '👥 Manual'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Partidas do dia */}
              {partidasDia.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">⚽ Confrontos</h3>
                  <div className="space-y-4">
                    {partidasDia.map((partida) => {
                      const timesPartidaAtual = partida.id ? (timesPartidas[partida.id] || []) : [];
                      const estatisticasAtual = partida.id ? (estatisticasPartidas[partida.id] || []) : [];

                      // Calcular placar
                      const golsTimeA = estatisticasAtual
                        .filter((e: EstatisticaPartida) => timesPartidaAtual.find((t: TimePartida) => t.associado_id === e.associado_id)?.time === 'A')
                        .reduce((total, e) => total + (e.gols || 0), 0);

                      const golsTimeB = estatisticasAtual
                        .filter((e: EstatisticaPartida) => timesPartidaAtual.find((t: TimePartida) => t.associado_id === e.associado_id)?.time === 'B')
                        .reduce((total, e) => total + (e.gols || 0), 0);

                      const rodada = rodadasDiaSelecionado.find((r: Rodada) => r.id === partida.rodada_id);
                      const grupo = grupos.find((g: Grupo) => g.id === rodada?.grupo_id);

                      return (
                        <div key={partida.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h4 className="font-semibold text-lg">Confronto #{partida.numero}</h4>
                              <p className="text-sm text-gray-600">{grupo?.nome}</p>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600">{golsTimeA} x {golsTimeB}</div>
                              <div className="text-xs text-gray-500">PLACAR</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Time A */}
                            <div className="bg-white/50 p-4 rounded-lg">
                              <h5 className="font-medium text-center mb-3 text-blue-700">🏆 Time A</h5>
                              <div className="space-y-1">
                                {timesPartidaAtual
                                  .filter(t => t.time === 'A')
                                  .map((t) => {
                                    const assoc = associados.find((a: Associado) => a.id === t.associado_id);
                                    const stats = estatisticasAtual.find((e: EstatisticaPartida) => e.associado_id === t.associado_id);
                                    return (
                                      <div key={t.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center">
                                          {t.is_goleiro && <span className="mr-1">🥅</span>}
                                          <span>{assoc?.apelido}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                          <span>⚽ {stats?.gols || 0}</span>
                                          <span>🎯 {stats?.assistencias || 0}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>

                            {/* Time B */}
                            <div className="bg-white/50 p-4 rounded-lg">
                              <h5 className="font-medium text-center mb-3 text-red-700">🏆 Time B</h5>
                              <div className="space-y-1">
                                {timesPartidaAtual
                                  .filter(t => t.time === 'B')
                                  .map((t) => {
                                    const assoc = associados.find((a: Associado) => a.id === t.associado_id);
                                    const stats = estatisticasAtual.find((e: EstatisticaPartida) => e.associado_id === t.associado_id);
                                    return (
                                      <div key={t.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center">
                                          {t.is_goleiro && <span className="mr-1">🥅</span>}
                                          <span>{assoc?.apelido}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                          <span>⚽ {stats?.gols || 0}</span>
                                          <span>🎯 {stats?.assistencias || 0}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>

                          {/* Cartões da partida */}
                          {estatisticasAtual.some((e: EstatisticaPartida) => (e.cartao_amarelo || 0) + (e.cartao_azul || 0) + (e.cartao_vermelho || 0) + (e.cartao_azul_vermelho || 0) > 0) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h6 className="text-sm font-medium mb-2 text-center">🟡 Cartões</h6>
                              <div className="flex justify-center space-x-4">
                                {['A', 'B'].map((time: string) => (
                                  <div key={time} className="text-center">
                                    <div className="text-xs text-gray-600 mb-1">Time {time}</div>
                                    <div className="flex space-x-1">
                                      {estatisticasAtual
                                        .filter((e: EstatisticaPartida) => timesPartidaAtual.find((t: TimePartida) => t.associado_id === e.associado_id)?.time === time)
                                        .map((e: EstatisticaPartida) => {
                                          const totalCartoes = (e.cartao_amarelo || 0) + (e.cartao_azul || 0) + (e.cartao_vermelho || 0) + (e.cartao_azul_vermelho || 0);
                                          if (totalCartoes === 0) return null;
                                          return (
                                            <div key={e.id} className="flex space-x-1">
                                              {Array.from({length: e.cartao_amarelo || 0}, (_, i) => (
                                                <span key={`yellow-${i}`} className="text-lg">🟡</span>
                                              ))}
                                              {Array.from({length: e.cartao_azul || 0}, (_, i) => (
                                                <span key={`blue-${i}`} className="text-lg">🔵</span>
                                              ))}
                                              {Array.from({length: e.cartao_vermelho || 0}, (_, i) => (
                                                <span key={`red-${i}`} className="text-lg">🔴</span>
                                              ))}
                                              {Array.from({length: e.cartao_azul_vermelho || 0}, (_, i) => (
                                                <span key={`blue-red-${i}`} className="text-lg">🔵🔴</span>
                                              ))}
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {rodadasDiaSelecionado.length === 0 && partidasDia.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📅</div>
                  <p>Nenhuma rodada ou partida encontrada para este dia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Legenda</h2>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm">Semanal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-sm">Quinzenal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
            <span className="text-sm">Mensal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendario;
