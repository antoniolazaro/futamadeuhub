import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AssociadoEstatisticas, Associado } from '../types';

const Estatisticas: React.FC = () => {
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [estatisticas, setEstatisticas] = useState<AssociadoEstatisticas[]>([]);
  const [periodo, setPeriodo] = useState<'todos' | 'semanal' | 'mensal' | 'anual'>('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, [periodo]);

  const carregarEstatisticas = async () => {
    try {
      const response = await api.get('/associados');
      const associadosData = response.data;
      setAssociados(associadosData);

      const hoje = new Date();
      let inicio: string | undefined;
      let fim: string | undefined;

      if (periodo === 'semanal') {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        inicio = inicioSemana.toISOString().split('T')[0];
        fim = hoje.toISOString().split('T')[0];
      } else if (periodo === 'mensal') {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        fim = hoje.toISOString().split('T')[0];
      } else if (periodo === 'anual') {
        inicio = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
        fim = hoje.toISOString().split('T')[0];
      }

      const params = inicio && fim ? { inicio, fim } : {};

      const estatisticasPromises = associadosData.map((associado: Associado) =>
        api.get(`/associados/${associado.id}/estatisticas`, { params })
      );

      const estatisticasResponses = await Promise.all(estatisticasPromises);
      const estatisticasData = estatisticasResponses.map((res: any) => res.data);

      estatisticasData.sort((a: AssociadoEstatisticas, b: AssociadoEstatisticas) =>
        b.total_pontos - a.total_pontos
      );

      setEstatisticas(estatisticasData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Estatísticas</h1>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="todos">Todos os Períodos</option>
          <option value="semanal">Semanal</option>
          <option value="mensal">Mensal</option>
          <option value="anual">Anual</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jogos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gols</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assistências</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vitórias</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Derrotas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Média Gols</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Vitória</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequência</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estatisticas.map((associado, index) => (
                <tr key={associado.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}º
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {associado.apelido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {associado.total_pontos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {associado.total_jogos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {associado.total_gols}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {associado.total_assistencias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {associado.total_vitorias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {associado.total_empates}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {associado.total_derrotas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {associado.media_gols.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {associado.percentual_vitoria.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {associado.frequencia.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {estatisticas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma estatística disponível para o período selecionado.
        </div>
      )}
    </div>
  );
};

export default Estatisticas;





