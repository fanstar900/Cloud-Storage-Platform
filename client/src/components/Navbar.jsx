import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Menu, Search, X, Folder, FileText, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { searchApi } from '../api/services'
import { getFileIcon, formatBytes } from '../utils/files'

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults(null)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchApi.search(query.trim())
        setResults(res.data)
      } catch {
        setResults({ folders: [], files: [] })
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleSearchFocus = () => {
    if (results) setShowResults(true)
  }

  const openResult = (type, id) => {
    setShowResults(false)
    if (type === 'folder') {
      navigate(`/dashboard?folder=${id}`)
    } else {
      navigate(`/dashboard?file=${id}`)
    }
  }

  const hasResults =
    results && (results.folders?.length > 0 || results.files?.length > 0)

  return (
    <header className="navbar">
      <button className="menu-btn" onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <div className="search-container" ref={containerRef}>
        <Search size={18} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search your files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleSearchFocus}
        />
        {searching && <Loader2 size={16} className="spin search-spinner" />}
        {query && !searching && (
          <button className="search-clear" onClick={() => { setQuery(''); setResults(null) }}>
            <X size={16} />
          </button>
        )}

        {showResults && query.trim() && (
          <div className="search-dropdown">
            {searching && (
              <div className="search-dropdown-loading">
                <Loader2 size={20} className="spin" /> Searching...
              </div>
            )}
            {!searching && !hasResults && (
              <div className="search-dropdown-empty">
                No results found for "{query}"
              </div>
            )}
            {!searching && hasResults && (
              <>
                {results.folders?.length > 0 && (
                  <div className="search-group">
                    <span className="search-group-label">Folders</span>
                    {results.folders.map((f) => (
                      <button
                        key={f.id}
                        className="search-item"
                        onClick={() => openResult('folder', f.id)}
                      >
                        <Folder size={18} className="search-item-icon folder" />
                        <span className="search-item-name">{f.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results.files?.length > 0 && (
                  <div className="search-group">
                    <span className="search-group-label">Files</span>
                    {results.files.map((f) => {
                      const Icon = getFileIcon(f.mimetype || f.name)
                      return (
                        <button
                          key={f.id}
                          className="search-item"
                          onClick={() => openResult('file', f.id)}
                        >
                          <Icon size={18} className="search-item-icon file" />
                          <span className="search-item-name">{f.name}</span>
                          {f.size != null && (
                            <span className="search-item-size">{formatBytes(f.size)}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="avatar">{getInitials(user?.name || user?.email || 'U')}</div>
          <span className="navbar-user-name">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  )
}

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.split(/[\s@]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
