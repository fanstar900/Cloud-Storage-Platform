import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, Folder, FileX } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { getFileIcon, formatBytes, formatDate } from '../utils/files'
import { searchApi } from '../api/services'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [input, setInput] = useState(query)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const debounceRef = useRef(null)
  const toast = useToast()

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const res = await searchApi.search(q.trim())
      setResults(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setResults({ folders: [], files: [] })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults(null)
      return
    }
    debounceRef.current = setTimeout(() => runSearch(query), 350)
    return () => clearTimeout(debounceRef.current)
  }, [query, runSearch])

  useEffect(() => {
    setInput(query)
  }, [query])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSearchParams(input.trim() ? { q: input.trim() } : {})
  }

  const total = (results?.folders?.length || 0) + (results?.files?.length || 0)

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-section">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard">
          <h2 className="page-title">Search</h2>
          <form className="search-page-bar" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Search files and folders..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {loading && (
            <div className="state-loading">
              <Loader2 size={32} className="spin" />
              <p>Searching...</p>
            </div>
          )}

          {!loading && results && total === 0 && (
            <div className="empty-state">
              <FileX size={64} className="empty-icon" />
              <h3>No results found</h3>
              <p>Try a different search term.</p>
            </div>
          )}

          {!loading && !results && !query && (
            <div className="empty-state">
              <FileX size={64} className="empty-icon" />
              <h3>Search your drive</h3>
              <p>Find files and folders by name.</p>
            </div>
          )}

          {!loading && results && results.folders?.length > 0 && (
            <section className="content-section">
              <h4 className="section-label">Folders ({results.folders.length})</h4>
              <div className="card-grid">
                {results.folders.map((f) => (
                  <div
                    key={f.id}
                    className="card-item folder-card"
                    onClick={() => navigate(`/dashboard?folder=${f.id}`)}
                  >
                    <div className="card-icon folder-icon">
                      <Folder size={28} />
                    </div>
                    <div className="card-info">
                      <span className="card-name">{f.name}</span>
                      <span className="card-meta">Folder</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loading && results && results.files?.length > 0 && (
            <section className="content-section">
              <h4 className="section-label">Files ({results.files.length})</h4>
              <div className="card-grid">
                {results.files.map((f) => {
                  const Icon = getFileIcon(f.mimetype || f.originalName)
                  return (
                    <div key={f.id} className="card-item file-card">
                      <div className="card-icon file-icon">
                        <Icon size={28} />
                      </div>
                      <div className="card-info">
                        <span className="card-name">{f.originalName}</span>
                        <span className="card-meta">
                          {formatBytes(f.size)} · {formatDate(f.createdAt || f.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
