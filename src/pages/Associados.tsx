import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Associado, Grupo } from '../types';

const Associados: React.FC = () => {
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [gruposAssociado, setGruposAssociado] = useState<{ [key: number]: Grupo[] }>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalGrupos, setShowModalGrupos] = useState(false);
  const [associadoSelecionado, setAssociadoSelecionado] = useState<Associado | null>(null);
  const [editing, setEditing] = useState<Associado | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    apelido: '',
    posicao: ''
  });

  useEffect(() => {
    carregarAssociados();
  }, []);

  const carregarAssociados = async () => {
    try {
      const response = await api.get('/associados');
      const associadosData = response.data;
      setAssociados(associadosData);
      
      // Carregar grupos de cada associado
      const gruposPromises = associadosData.map(async (assoc: Associado) => {
        try {
          const gruposRes = await api.get(`/grupos/associado/${assoc.id}`);
          return { associadoId: assoc.id, grupos: gruposRes.data };
        } catch (error) {
          return { associadoId: assoc.id, grupos: [] };
        }
      });
      
      const gruposData = await Promise.all(gruposPromises);
      const gruposMap: { [key: number]: Grupo[] } = {};
      gruposData.forEach((item) => {
        if (item.associadoId) {
          gruposMap[item.associadoId] = item.grupos;
        }
      });
      setGruposAssociado(gruposMap);
    } catch (error) {
      console.error('Erro ao carregar associados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/associados/${editing.id}`, formData);
      } else {
        await api.post('/associados', formData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ nome: '', apelido: '', posicao: '' });
      carregarAssociados();
    } catch (error) {
      console.error('Erro ao salvar associado:', error);
      alert('Erro ao salvar associado');
    }
  };

  const handleEdit = (associado: Associado) => {
    setEditing(associado);
    setFormData({
      nome: associado.nome,
      apelido: associado.apelido,
      posicao: associado.posicao
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este associado?')) {
      return;
    }
    try {
      await api.delete(`/associados/${id}`);
      carregarAssociados();
    } catch (error) {
      console.error('Erro ao excluir associado:', error);
      alert('Erro ao excluir associado');
    }
  };

  const posicoes = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'];

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Associados</h1>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ nome: '', apelido: '', posicao: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Novo Associado
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apelido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupos</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {associados.map((associado) => {
              const grupos = gruposAssociado[associado.id!] || [];
              return (
                <tr key={associado.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{associado.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{associado.apelido}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{associado.posicao}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {grupos.length > 0 ? (
                        grupos.map((grupo) => (
                          <span
                            key={grupo.id}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {grupo.nome}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">Nenhum grupo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setAssociadoSelecionado(associado);
                        setShowModalGrupos(true);
                      }}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Grupos
                    </button>
                    <button
                      onClick={() => handleEdit(associado)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(associado.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editing ? 'Editar Associado' : 'Novo Associado'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apelido</label>
                <input
                  type="text"
                  required
                  value={formData.apelido}
                  onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posição</label>
                <select
                  required
                  value={formData.posicao}
                  onChange={(e) => setFormData({ ...formData, posicao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma posição</option>
                  {posicoes.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                    setFormData({ nome: '', apelido: '', posicao: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModalGrupos && associadoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Grupos de {associadoSelecionado.apelido}
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
              {gruposAssociado[associadoSelecionado.id!]?.length > 0 ? (
                gruposAssociado[associadoSelecionado.id!].map((grupo) => (
                  <div
                    key={grupo.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <div className="font-medium">{grupo.nome}</div>
                      {grupo.descricao && (
                        <div className="text-sm text-gray-500">{grupo.descricao}</div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await api.delete(`/grupos/${grupo.id}/associados/${associadoSelecionado.id}`);
                          carregarAssociados();
                        } catch (error) {
                          console.error('Erro ao remover do grupo:', error);
                          alert('Erro ao remover do grupo');
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Este associado não pertence a nenhum grupo
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowModalGrupos(false);
                  setAssociadoSelecionado(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Associados;

