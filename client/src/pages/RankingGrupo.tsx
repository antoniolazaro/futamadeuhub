import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { RankingGrupo, Grupo } from "../types";

const RankingGrupoComponent: React.FC = () => {
  const { grupoId } = useParams<{ grupoId: string }>();
  const [ranking, setRanking] = useState<RankingGrupo[]>([]);
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"todos" | "mes" | "ano">("todos");

  const carregarGrupo = useCallback(async () => {
    if (!grupoId) return;
    try {
      const response = await api.get(`/grupos/${grupoId}`);
      setGrupo(response.data);
    } catch (error) {
      console.error("Erro ao carregar grupo:", error);
    }
  }, [grupoId]);

  const carregarRanking = useCallback(async () => {
    if (!grupoId) return;
    try {
      setLoading(true);
      const params: any = {};

      if (periodo === "mes") {
        const hoje = new Date();
        params.inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        params.fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];
      } else if (periodo === "ano") {
        const hoje = new Date();
        params.inicio = new Date(hoje.getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0];
        params.fim = new Date(hoje.getFullYear(), 11, 31)
          .toISOString()
          .split("T")[0];
      }

      const response = await api.get(`/ranking/grupos/${grupoId}`, { params });
      setRanking(response.data);
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
    } finally {
      setLoading(false);
    }
  }, [grupoId, periodo]);

  useEffect(() => {
    if (grupoId) {
      carregarGrupo();
      carregarRanking();
    }
  }, [grupoId, periodo, carregarGrupo, carregarRanking]);

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Ranking - {grupo?.nome}
          </h1>
          <p className="text-gray-600 mt-1">{grupo?.descricao}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriodo("todos")}
            className={`px-4 py-2 rounded-lg ${
              periodo === "todos"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setPeriodo("mes")}
            className={`px-4 py-2 rounded-lg ${
              periodo === "mes"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setPeriodo("ano")}
            className={`px-4 py-2 rounded-lg ${
              periodo === "ano"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Este Ano
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jogador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pontos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jogos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  V
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  D
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gols
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assist.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Média Gols
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aproveit.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequência
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ranking.map((item, index) => (
                <tr
                  key={item.associado_id}
                  className={`hover:bg-gray-50 ${
                    index < 3 ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : ""}{" "}
                    {index + 1}º
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.apelido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.posicao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {item.pontos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.jogos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {item.vitorias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {item.empates}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {item.derrotas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.gols}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.assistencias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.media_gols.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.aproveitamento.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.frequencia.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {ranking.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma rodada registrada ainda.
        </div>
      )}
    </div>
  );
};

export default RankingGrupoComponent;
