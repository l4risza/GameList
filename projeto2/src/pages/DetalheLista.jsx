import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import './Listas.css'
import './DetalheLista.css'

export default function DetalheLista() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [lista, setLista] = useState(null)
  const [jogos, setJogos] = useState([])
  const [jogosExibidos, setJogosExibidos] = useState([])
  const [todosJogos, setTodosJogos] = useState([])
  const [busca, setBusca] = useState('')
  const [buscaAdicionar, setBuscaAdicionar] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [adicionando, setAdicionando] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => { fetchDados() }, [id])

  useEffect(() => {
    const termo = busca.toLowerCase()
    setJogosExibidos(
      jogos.filter(j =>
        j.titulo.toLowerCase().includes(termo) ||
        (j.genero || '').toLowerCase().includes(termo) ||
        (j.plataforma || '').toLowerCase().includes(termo)
      )
    )
  }, [busca, jogos])

  const fetchDados = async () => {
    setLoading(true)
    const [{ data: listaData }, { data: listaJogosData }, { data: todosData }] = await Promise.all([
      supabase.from('listas').select('*').eq('lista_id', id).eq('usuario_id', user.id).single(),
      supabase.from('lista_jogos').select('jogo_id, jogos(*)').eq('lista_id', id),
      supabase.from('jogos').select('*').order('titulo'),
    ])

    setLista(listaData)
    const jogosNaLista = (listaJogosData || []).map(lj => lj.jogos)
    setJogos(jogosNaLista)
    setJogosExibidos(jogosNaLista)
    setTodosJogos(todosData || [])
    setLoading(false)
  }

  const adicionarJogo = async (jogoId) => {
    setAdicionando(jogoId)
    setErro('')
    const { error } = await supabase.from('lista_jogos').insert({
      lista_id: Number(id),
      jogo_id: jogoId,
    })
    setAdicionando(null)
    if (error) {
      setErro(error.message.includes('duplicate') ? 'Esse jogo já está na lista.' : 'Erro ao adicionar jogo.')
    } else {
      fetchDados()
    }
  }

  const removerJogo = async (jogoId) => {
    if (!confirm('Remover este jogo da lista?')) return
    await supabase.from('lista_jogos').delete().eq('lista_id', id).eq('jogo_id', jogoId)
    fetchDados()
  }

  const notaLabel = (nota) => {
    if (!nota) return null
    if (nota >= 9) return { label: '⭐ Obra-prima', cor: '#f7d76a' }
    if (nota >= 7) return { label: '👍 Bom', cor: '#4ade80' }
    if (nota >= 5) return { label: '😐 Ok', cor: '#fb923c' }
    return { label: '👎 Fraco', cor: '#f87171' }
  }

  // Jogos disponíveis para adicionar (que ainda não estão na lista)
  const jogosNaListaIds = new Set(jogos.map(j => j.jogo_id))
  const jogosDisponiveis = todosJogos.filter(j =>
    !jogosNaListaIds.has(j.jogo_id) &&
    j.titulo.toLowerCase().includes(buscaAdicionar.toLowerCase())
  )

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <button className="btn-back" onClick={() => navigate('/listas')}>← Minhas Listas</button>
          <span className="header-logo">🎮 GameList</span>
        </div>
      </header>

      <main className="main">
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : !lista ? (
          <div className="empty-state">
            <span className="empty-icon">⚠️</span>
            <p>Lista não encontrada.</p>
          </div>
        ) : (
          <>
            <div className="page-top">
              <div>
                <h1 className="page-title">{lista.nome}</h1>
                {lista.descricao && <p className="page-desc">{lista.descricao}</p>}
              </div>
              <button className="btn-primary" onClick={() => { setModalAberto(true); setErro('') }}>
                + Adicionar jogo
              </button>
            </div>

            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por título, gênero ou plataforma..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
              {busca && <button className="search-clear" onClick={() => setBusca('')}>✕</button>}
            </div>

            {jogosExibidos.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">{busca ? '🔎' : '🎮'}</span>
                <p>{busca ? 'Nenhum jogo encontrado.' : 'Nenhum jogo nessa lista ainda.'}</p>
                {!busca && (
                  <button className="btn-primary" onClick={() => setModalAberto(true)}>
                    Adicionar primeiro jogo
                  </button>
                )}
              </div>
            ) : (
              <div className="jogos-lista">
                {jogosExibidos.map(jogo => {
                  const n = notaLabel(jogo.nota)
                  return (
                    <div key={jogo.jogo_id} className="jogo-card">
                      <div className="jogo-info">
                        <h3 className="jogo-titulo">{jogo.titulo}</h3>
                        <div className="jogo-tags">
                          {jogo.genero && <span className="tag tag-genero">{jogo.genero}</span>}
                          {jogo.plataforma && <span className="tag tag-plataforma">{jogo.plataforma}</span>}
                          {jogo.ano && <span className="tag tag-plataforma">{jogo.ano}</span>}
                        </div>
                        {jogo.descricao && <p className="jogo-desc">{jogo.descricao}</p>}
                      </div>
                      <div className="jogo-right">
                        {jogo.nota && (
                          <div className="jogo-nota" style={{ color: n?.cor }}>
                            <span className="nota-num">{jogo.nota}</span>
                            <span className="nota-label">{n?.label}</span>
                          </div>
                        )}
                        <button className="btn-delete" onClick={() => removerJogo(jogo.jogo_id)} title="Remover da lista">🗑</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal para adicionar jogos existentes */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Adicionar jogo à lista</h2>

            <div className="search-bar" style={{ marginBottom: '16px' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar jogo pelo título..."
                value={buscaAdicionar}
                onChange={e => setBuscaAdicionar(e.target.value)}
                autoFocus
              />
            </div>

            {erro && <p className="auth-error" style={{ marginBottom: '12px' }}>{erro}</p>}

            <div className="jogos-disponiveis">
              {jogosDisponiveis.length === 0 ? (
                <p className="sem-jogos">
                  {buscaAdicionar ? 'Nenhum jogo encontrado.' : 'Todos os jogos já estão na lista.'}
                </p>
              ) : (
                jogosDisponiveis.map(jogo => (
                  <div key={jogo.jogo_id} className="jogo-disponivel">
                    <div className="jogo-disp-info">
                      <span className="jogo-disp-titulo">{jogo.titulo}</span>
                      <div className="jogo-tags" style={{ marginTop: '4px' }}>
                        <span className="tag tag-genero">{jogo.genero}</span>
                        <span className="tag tag-plataforma">{jogo.plataforma}</span>
                        {jogo.ano && <span className="tag tag-plataforma">{jogo.ano}</span>}
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                      onClick={() => adicionarJogo(jogo.jogo_id)}
                      disabled={adicionando === jogo.jogo_id}
                    >
                      {adicionando === jogo.jogo_id ? '...' : '+ Add'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="btn-ghost" onClick={() => setModalAberto(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
