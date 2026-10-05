import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.animesenpai.in'

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Request failed')
  }

  return res.json()
}

function HomePage() {
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/search?q=naruto&page=1')
        setAnime(data.results || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">ANIME SENPAI</div>
        <nav>
          <a href="/">Home</a>
          <a href="#popular">Popular</a>
          <a href="#recent">Recent</a>
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Watch Anime</p>
          <h1>Stream anime with the backend hidden behind a private API.</h1>
          <p>
            The website runs on animesenpai.in and fetches data only from api.animesenpai.in.
          </p>
        </div>
      </section>

      <section className="section">
        <h2>Featured Results</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid">
            {anime.map((item) => (
              <a key={item.slug} className="card" href={`/anime/${item.slug}`}>
                <div className="card-image">
                  {item.image ? <img src={item.image} alt={item.title} /> : null}
                </div>
                <div className="card-body">
                  <h3>{item.title}</h3>
                  <span>{item.type}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function AnimeDetailPage({ slug }) {
  const [anime, setAnime] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/anime/${slug}`)
        setAnime(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) return <p className="center">Loading anime...</p>
  if (!anime) return <p className="center">Anime not found</p>

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">ANIME SENPAI</div>
      </header>

      <section className="anime-hero">
        {anime.image ? <img src={anime.image} alt={anime.title} /> : null}
        <div>
          <h1>{anime.title}</h1>
          <p>{anime.description}</p>
        </div>
      </section>

      <section className="section">
        <h2>Episodes</h2>
        <div className="episode-list">
          {(anime.episodes || []).map((ep, index) => (
            <a key={`${ep.url}-${index}`} href={`/watch?ep=${encodeURIComponent(ep.url)}`} className="episode-item">
              {ep.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}

function WatchPage({ epUrl }) {
  const [episode, setEpisode] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/episode?ep_url=${encodeURIComponent(epUrl)}`)
        setEpisode(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (epUrl) load()
  }, [epUrl])

  if (!epUrl) return <p className="center">No episode selected</p>
  if (loading) return <p className="center">Loading player...</p>
  if (!episode || !episode.servers || episode.servers.length === 0) {
    return <p className="center">No playable source found.</p>
  }

  const embed = episode.servers[0].embed_url

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">ANIME SENPAI</div>
      </header>

      <section className="player-box">
        <iframe
          src={embed}
          title="Anime player"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>
    </main>
  )
}

function App() {
  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)

  if (path.startsWith('/anime/')) {
    const slug = path.replace('/anime/', '')
    return <AnimeDetailPage slug={slug} />
  }

  if (path.startsWith('/watch')) {
    const epUrl = params.get('ep')
    return <WatchPage epUrl={epUrl} />
  }

  return <HomePage />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
