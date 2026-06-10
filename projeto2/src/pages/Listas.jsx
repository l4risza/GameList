import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import './Listas.css'

export default function Listas() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [listas, setListas] = useState([])
  const [filtradas, setFiltradas] = useState([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [novaLista, setNovaLista] = useState({ nome: '', descricao: '' })
  const [criando, setCriando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { fetchListas() }, [])

  useEffect(() => {
    const termo = busca.toLowerCase()
    setFiltradas(
      listas.filter(l =>
        l.nome.toLowerCase().includes(termo) ||
        (l.descricao || '').toLowerCase().includes(termo)
      )
    )
  }, [busca, listas])

  const fetchListas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('listas')
      .select('*, lista_jogos(count)')
      .eq('usuario_id', user.id)
      .order('data_criacao', { ascending: false })

    if (!error) {
      setListas(data)
      setFiltradas(data)
    }
    setLoading(false)
  }

  const criarLista = async (e) => {
    e.preventDefault()
    if (!novaLista.nome.trim()) return
    setCriando(true)
    setErro('')

    const { error } = await supabase.from('listas').insert({
      nome: novaLista.nome.trim(),
      descricao: novaLista.descricao.trim() || null,
      usuario_id: user.id,
    })

    setCriando(false)
    if (error) {
      setErro('Erro ao criar lista: ' + error.message)
    } else {
      setNovaLista({ nome: '', descricao: '' })
      setModalAberto(false)
      fetchListas()
    }
  }

  const deletarLista = async (id) => {
    if (!confirm('Tem certeza que deseja excluir essa lista?')) return
    await supabase.from('listas').delete().eq('lista_id', id)
    fetchListas()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <span className="header-logo">🎮 GameList</span>
          <div className="header-right">
            <span className="header-email">{user.email}</span>
            <button className="btn-ghost" onClick={handleSignOut}>Sair</button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="page-top">
          <div>
            <h1 className="page-title">Minhas Listas</h1>
            <p className="page-desc">Organize seus jogos em listas personalizadas</p>
          </div>
          <button className="btn-primary" onClick={() => setModalAberto(true)}>
            + Nova lista
          </button>
        </div>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          {busca && <button className="search-clear" onClick={() => setBusca('')}>✕</button>}
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Carregando listas...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{busca ? '🔎' : '📋'}</span>
            <p>{busca ? 'Nenhuma lista encontrada.' : 'Você ainda não criou nenhuma lista.'}</p>
            {!busca && (
              <button className="btn-primary" onClick={() => setModalAberto(true)}>
                Criar primeira lista
              </button>
            )}
          </div>
        ) : (
          <div className="listas-grid">
            {filtradas.map(lista => (
              <div key={lista.lista_id} className="lista-card" onClick={() => navigate(`/listas/${lista.lista_id}`)}>
                <div className="lista-card-top">
                  <h2 className="lista-nome">{lista.nome}</h2>
                  <button
                    className="btn-delete"
                    onClick={e => { e.stopPropagation(); deletarLista(lista.lista_id) }}
                    title="Excluir lista"
                  >🗑</button>
                </div>
                {lista.descricao && <p className="lista-desc">{lista.descricao}</p>}
                <div className="lista-meta">
                  <span className="lista-count">🎮 {lista.lista_jogos?.[0]?.count ?? 0} jogo(s)</span>
                  <span className="lista-data">{new Date(lista.data_criacao).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Nova lista</h2>
            <form onSubmit={criarLista} className="modal-form">
              <div className="field">
                <label>Nome da lista *</label>
                <input
                  type="text"
                  placeholder="Ex: RPGs que quero jogar"
                  value={novaLista.nome}
                  onChange={e => setNovaLista(p => ({ ...p, nome: e.target.value }))}
                  autoFocus
                  required
                />
              </div>
              <div className="field">
                <label>Descrição (opcional)</label>
                <input
                  type="text"
                  placeholder="Uma descrição curta..."
                  value={novaLista.descricao}
                  onChange={e => setNovaLista(p => ({ ...p, descricao: e.target.value }))}
                />
              </div>
              {erro && <p className="auth-error">{erro}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={criando}>
                  {criando ? 'Criando...' : 'Criar lista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
