import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Link2, Copy, Check, Trash2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { fileApi } from '../api/services'
import { getFileIcon, formatBytes, formatDate } from '../utils/files'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function Shared() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [shareUrls, setShareUrls] = useState({})
  const toast = useToast()

  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fileApi.getFiles(null)
      const all = Array.isArray(res.data) ? res.data : (res.data.files || [])
      setFiles(all)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleShare = async (file) => {
    try {
      const res = await fileApi.share(file.id, 7, 20)
      setShareUrls((prev) => ({ ...prev, [file.id]: res.data.share_url }))
      toast.success('Share link created')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-section">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard">
          <h2 className="page-title">Shared Files</h2>
          <p className="page-subtitle">Generate and copy shareable links for your files.</p>

          {loading && (
            <div className="state-loading">
              <Loader2 size={32} className="spin" />
              <p>Loading files...</p>
            </div>
          )}

          {!loading && files.length === 0 && (
            <div className="empty-state">
              <Link2 size={64} className="empty-icon" />
              <h3>No files to share yet</h3>
              <p>Upload files from My Drive to generate share links.</p>
              <Link to="/dashboard" className="btn btn-primary">Go to My Drive</Link>
            </div>
          )}

          {!loading && files.length > 0 && (
            <div className="shared-list">
              {files.map((f) => {
                const Icon = getFileIcon(f.mimetype || f.originalName)
                const url = shareUrls[f.id]
                return (
                  <div key={f.id} className="shared-item">
                    <div className="shared-item-icon">
                      <Icon size={24} />
                    </div>
                    <div className="shared-item-info">
                      <span className="card-name">{f.originalName}</span>
                      <span className="card-meta">
                        {formatBytes(f.size)} · {formatDate(f.createdAt || f.created_at)}
                      </span>
                    </div>
                    <div className="shared-item-actions">
                      {url ? (
                        <div className="share-link-inline">
                          <span className="share-link-text">{url}</span>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(url, f.id)}>
                            {copiedId === f.id ? <Check size={16} /> : <Copy size={16} />}
                            {copiedId === f.id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleShare(f)}>
                          <Link2 size={16} /> Create link
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
