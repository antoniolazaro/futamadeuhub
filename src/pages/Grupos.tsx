import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Grupo, GrupoCompleto, Associado, AssociadoGrupo } from '../types';

const Grupos: React.FC = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalAssociados, setShowModalAssociados] = useState(false);
  const [showModalResponsaveis, setShowModalResponsaveis] = useState(false);
  const [showModalImportacao, setShowModalImportacao] = useState(false);
  const [importando, setImportando] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState<any>(null);
  const [editing, setEditing] = useState<Grupo | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    local: '',
    dia_semana: 0,
    horario_inicio: '08:00',
    horario_fim: '10:00',
    periodicidade: 'semanal' as 'semanal' | 'quinzenal' | 'mensal',
    quantidade_jogadores_linha: 6,
    quantidade_minima_jogadores: 12,
    quantidade_maxima_jogadores: 24,
  });

  useEffect(() => {
    carregarGrupos();
    carregarAssociados();
  }, []);

  const carregarGrupos = async () => {
    try {
      const response = await api.get('/grupos');
      setGrupos(response.data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarAssociados = async () => {
    try {
      const response = await api.get('/associados');
      setAssociados(response.data);
    } catch (error) {
      console.error('Erro ao carregar associados:', error);
    }
  };

  const carregarDetalhesGrupo = async (grupo: Grupo) => {
    try {
      const response = await api.get(`/grupos/${grupo.id}`);
      setGrupoSelecionado(response.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes do grupo:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/grupos/${editing.id}`, formData);
      } else {
        await api.post('/grupos', formData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({
        nome: '',
        descricao: '',
        local: '',
        dia_semana: 0,
        horario_inicio: '08:00',
        horario_fim: '10:00',
        periodicidade: 'semanal',
        quantidade_jogadores_linha: 6,
        quantidade_minima_jogadores: 12,
        quantidade_maxima_jogadores: 24,
      });
      carregarGrupos();
      if (grupoSelecionado && editing) {
        carregarDetalhesGrupo(editing);
      }
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      alert('Erro ao salvar grupo');
    }
  };

  const handleEdit = (grupo: Grupo) => {
    setEditing(grupo);
    setFormData({
      nome: grupo.nome,
      descricao: grupo.descricao || '',
      local: grupo.local || '',
      dia_semana: grupo.dia_semana || 0,
      horario_inicio: grupo.horario_inicio || '08:00',
      horario_fim: grupo.horario_fim || '10:00',
      periodicidade: grupo.periodicidade || 'semanal',
      quantidade_jogadores_linha: grupo.quantidade_jogadores_linha || 6,
      quantidade_minima_jogadores: grupo.quantidade_minima_jogadores || 12,
      quantidade_maxima_jogadores: grupo.quantidade_maxima_jogadores || 24,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este grupo?')) {
      return;
    }
    try {
      await api.delete(`/grupos/${id}`);
      carregarGrupos();
      if (grupoSelecionado?.id === id) {
        setGrupoSelecionado(null);
      }
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      alert('Erro ao excluir grupo');
    }
  };

  const handleAdicionarAssociado = async (associadoId: number) => {
    if (!grupoSelecionado) return;
    try {
      await api.post(`/grupos/${grupoSelecionado.id}/associados`, {
        associado_id: associadoId
      });
      carregarDetalhesGrupo(grupoSelecionado);
    } catch (error) {
      console.error('Erro ao adicionar associado:', error);
      alert('Erro ao adicionar associado');
    }
  };

  const handleRemoverAssociado = async (associadoId: number) => {
    if (!grupoSelecionado) return;
    try {
      await api.delete(`/grupos/${grupoSelecionado.id}/associados/${associadoId}`);
      carregarDetalhesGrupo(grupoSelecionado);
    } catch (error) {
      console.error('Erro ao remover associado:', error);
      alert('Erro ao remover associado');
    }
  };

  const handleAdicionarResponsavel = async (associadoId: number) => {
    if (!grupoSelecionado) return;
    try {
      await api.post(`/grupos/${grupoSelecionado.id}/responsaveis`, {
        associado_id: associadoId
      });
      carregarDetalhesGrupo(grupoSelecionado);
    } catch (error) {
      console.error('Erro ao adicionar responsável:', error);
      alert('Erro ao adicionar responsável');
    }
  };

  const handleRemoverResponsavel = async (associadoId: number) => {
    if (!grupoSelecionado) return;
    try {
      await api.delete(`/grupos/${grupoSelecionado.id}/responsaveis/${associadoId}`);
      carregarDetalhesGrupo(grupoSelecionado);
    } catch (error) {
      console.error('Erro ao remover responsável:', error);
      alert('Erro ao remover responsável');
    }
  };

  const handleImportarArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!grupoSelecionado || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setImportando(true);
    setResultadoImportacao(null);

    try {
      const response = await api.post(
        `/importacao/grupo/${grupoSelecionado.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResultadoImportacao(response.data.resultado);
      
      // Recarregar detalhes do grupo
      await carregarDetalhesGrupo(grupoSelecionado);
      
      // Limpar input
      e.target.value = '';
    } catch (error: any) {
      console.error('Erro ao importar arquivo:', error);
      alert(error.response?.data?.error || 'Erro ao importar arquivo');
    } finally {
      setImportando(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const associadosNoGrupo = grupoSelecionado?.associados?.map(a => a.associado_id) || [];
  const responsaveisNoGrupo = grupoSelecionado?.responsaveis?.map(r => r.associado_id) || [];
  const associadosDisponiveis = associados.filter(a => !associadosNoGrupo.includes(a.id!));
  const responsaveisDisponiveis = associados.filter(a => !responsaveisNoGrupo.includes(a.id!));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Grupos</h1>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({
              nome: '',
              descricao: '',
              local: '',
              dia_semana: 0,
              horario_inicio: '08:00',
              horario_fim: '10:00',
              periodicidade: 'semanal',
              quantidade_jogadores_linha: 6,
              quantidade_minima_jogadores: 12,
              quantidade_maxima_jogadores: 24,
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Novo Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Grupos</h2>
          <div className="space-y-2">
            {grupos.map((grupo) => (
              <div
                key={grupo.id}
                onClick={() => carregarDetalhesGrupo(grupo)}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  grupoSelecionado?.id === grupo.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{grupo.nome}</div>
                    {grupo.descricao && (
                      <div className="text-sm text-gray-500 mt-1">{grupo.descricao}</div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(grupo);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(grupo.id!);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {grupoSelecionado && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{grupoSelecionado.nome}</h2>
                {grupoSelecionado.descricao && (
                  <p className="text-gray-600 mt-1">{grupoSelecionado.descricao}</p>
                )}
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  {grupoSelecionado.local && (
                    <div><span className="font-medium">Local:</span> {grupoSelecionado.local}</div>
                  )}
                  <div>
                    <span className="font-medium">Dia:</span> {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][grupoSelecionado.dia_semana || 0]}
                    {' '}({grupoSelecionado.horario_inicio} - {grupoSelecionado.horario_fim})
                  </div>
                  <div>
                    <span className="font-medium">Periodicidade:</span> {grupoSelecionado.periodicidade === 'semanal' ? 'Semanal' : grupoSelecionado.periodicidade === 'quinzenal' ? 'Quinzenal' : 'Mensal'}
                  </div>
                  <div>
                    <span className="font-medium">Jogadores:</span> {grupoSelecionado.quantidade_jogadores_linha} por time (mín: {grupoSelecionado.quantidade_minima_jogadores}, máx: {grupoSelecionado.quantidade_maxima_jogadores})
                  </div>
                </div>
              </div>
              <Link
                to={`/grupos/${grupoSelecionado.id}/ranking`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Ver Ranking
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Responsáveis</h3>
                  <button
                    onClick={() => setShowModalResponsaveis(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {grupoSelecionado.responsaveis && grupoSelecionado.responsaveis.length > 0 ? (
                    grupoSelecionado.responsaveis.map((resp) => (
                      <div
                        key={resp.id}
                        className="flex items-center justify-between p-2 bg-yellow-50 rounded"
                      >
                        <div className="text-sm">
                          {resp.associado ? (
                            <>
                              <div className="font-medium">{resp.associado.apelido}</div>
                              <div className="text-xs text-gray-500">
                                {resp.associado.nome} - {resp.associado.posicao}
                              </div>
                            </>
                          ) : (
                            <span>ID: {resp.associado_id}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoverResponsavel(resp.associado_id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum responsável cadastrado</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Associados</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowModalImportacao(true)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      📥 Importar
                    </button>
                    <button
                      onClick={() => setShowModalAssociados(true)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {grupoSelecionado.associados && grupoSelecionado.associados.length > 0 ? (
                    grupoSelecionado.associados.map((assoc) => (
                      <div
                        key={assoc.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="text-sm">
                          {assoc.associado ? (
                            <>
                              <div className="font-medium">{assoc.associado.apelido}</div>
                              <div className="text-xs text-gray-500">
                                {assoc.associado.nome} - {assoc.associado.posicao}
                              </div>
                            </>
                          ) : (
                            <span>ID: {assoc.associado_id}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoverAssociado(assoc.associado_id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum associado no grupo</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editing ? 'Editar Grupo' : 'Novo Grupo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <input
                  type="text"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Campo do Bairro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana *</label>
                <select
                  required
                  value={formData.dia_semana}
                  onChange={(e) => setFormData({ ...formData, dia_semana: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Domingo</option>
                  <option value={1}>Segunda-feira</option>
                  <option value={2}>Terça-feira</option>
                  <option value={3}>Quarta-feira</option>
                  <option value={4}>Quinta-feira</option>
                  <option value={5}>Sexta-feira</option>
                  <option value={6}>Sábado</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Início *</label>
                  <input
                    type="time"
                    required
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Fim *</label>
                  <input
                    type="time"
                    required
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodicidade</label>
                <select
                  value={formData.periodicidade}
                  onChange={(e) => setFormData({ ...formData, periodicidade: e.target.value as 'semanal' | 'quinzenal' | 'mensal' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="semanal">Semanal</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Jogadores de Linha por Time</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantidade_jogadores_linha}
                  onChange={(e) => setFormData({ ...formData, quantidade_jogadores_linha: parseInt(e.target.value) || 6 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 6 (para campo de 6)"
                />
                <p className="text-xs text-gray-500 mt-1">Quantidade de jogadores de linha por time (ex: 6 para campo de 6)</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Mínima de Jogadores</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantidade_minima_jogadores}
                    onChange={(e) => setFormData({ ...formData, quantidade_minima_jogadores: parseInt(e.target.value) || 12 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 12"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo para formar times</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Máxima de Jogadores</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantidade_maxima_jogadores}
                    onChange={(e) => setFormData({ ...formData, quantidade_maxima_jogadores: parseInt(e.target.value) || 24 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 24"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo de jogadores</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                    setFormData({
                      nome: '',
                      descricao: '',
                      local: '',
                      dia_semana: 0,
                      horario_inicio: '08:00',
                      horario_fim: '10:00',
                      periodicidade: 'semanal',
                      quantidade_jogadores_linha: 6,
                      quantidade_minima_jogadores: 12,
                      quantidade_maxima_jogadores: 24,
                    });
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

      {showModalAssociados && grupoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Adicionar Associado</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {associadosDisponiveis.length > 0 ? (
                associadosDisponiveis.map((assoc) => (
                  <div
                    key={assoc.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{assoc.apelido}</div>
                      <div className="text-sm text-gray-500">{assoc.nome} - {assoc.posicao}</div>
                    </div>
                    <button
                      onClick={() => {
                        handleAdicionarAssociado(assoc.id!);
                        setShowModalAssociados(false);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Adicionar
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Todos os associados já estão no grupo
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowModalAssociados(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalResponsaveis && grupoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Adicionar Responsável</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {responsaveisDisponiveis.length > 0 ? (
                responsaveisDisponiveis.map((assoc) => (
                  <div
                    key={assoc.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{assoc.apelido}</div>
                      <div className="text-sm text-gray-500">{assoc.nome} - {assoc.posicao}</div>
                    </div>
                    <button
                      onClick={() => {
                        handleAdicionarResponsavel(assoc.id!);
                        setShowModalResponsaveis(false);
                      }}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                    >
                      Adicionar
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Todos os associados já são responsáveis
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowModalResponsaveis(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalImportacao && grupoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Importar Associados</h2>
            <p className="text-sm text-gray-600 mb-4">
              Selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv) com as colunas:
              <strong> nome, apelido, posição</strong>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              O arquivo pode ter cabeçalho ou não. Associados já existentes serão vinculados ao grupo.
              Associados duplicados no arquivo serão ignorados.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportarArquivo}
                disabled={importando}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {importando && (
              <div className="mb-4 text-center text-blue-600">
                Importando...
              </div>
            )}

            {resultadoImportacao && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Resultado da Importação</h3>
                <div className="space-y-1 text-sm">
                  <div className="text-green-600">
                    ✓ {resultadoImportacao.sucesso} associado(s) importado(s) com sucesso
                  </div>
                  {resultadoImportacao.duplicados && resultadoImportacao.duplicados.length > 0 && (
                    <div className="text-yellow-600">
                      ⚠ {resultadoImportacao.duplicados.length} associado(s) já estava(m) no grupo
                    </div>
                  )}
                  {resultadoImportacao.erros && resultadoImportacao.erros.length > 0 && (
                    <div className="text-red-600">
                      ✗ {resultadoImportacao.erros.length} erro(s):
                      <ul className="list-disc list-inside mt-1">
                        {resultadoImportacao.erros.map((erro: any, index: number) => (
                          <li key={index}>
                            Linha {erro.linha} ({erro.apelido}): {erro.erro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowModalImportacao(false);
                  setResultadoImportacao(null);
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

export default Grupos;


