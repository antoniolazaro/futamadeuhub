import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AssociadoEstatisticas } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [ranking, setRanking] = useState<AssociadoEstatisticas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarRanking();
  }, []);

  const carregarRanking = async () => {
    try {
      const response = await api.get('/associados');
      const associados = response.data;
      
      const estatisticasPromises = associados.map((associado: any) =>
        api.get(`/associados/${associado.id}/estatisticas`)
      );
      
      const estatisticasResponses = await Promise.all(estatisticasPromises);
      const estatisticas = estatisticasResponses.map((res: any) => res.data);
      
      estatisticas.sort((a: AssociadoEstatisticas, b: AssociadoEstatisticas) => 
        b.total_pontos - a.total_pontos
      );
      
      setRanking(estatisticas);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🏆 Bem-vindo ao PeladaHub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sua plataforma completa para gestão de jogos de futebol amador.
          Organize times, acompanhe estatísticas e gerencie seus grupos de pelada.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 card-hover">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🏆</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ranking Geral</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jogos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gols</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vitórias</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequência</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ranking.map((associado, index) => (
                <tr key={associado.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}º
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {associado.apelido}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {associado.grupos && associado.grupos.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {associado.grupos.map((grupo) => (
                          <span
                            key={grupo.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {grupo.nome}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
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
                    {associado.total_vitorias}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/associados" className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100 group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition">Associados</h3>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">Gerencie jogadores e associados dos seus grupos</p>
        </Link>

        <Link to="/jogos" className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100 group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
              <span className="text-2xl">⚽</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition">Jogos</h3>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">Organize e acompanhe suas partidas</p>
        </Link>

        <Link to="/calendario" className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100 group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition">Calendário</h3>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">Visualize e planeje seus jogos</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;





