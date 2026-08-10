import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Download, Trash2, Share2, Loader2 } from 'lucide-react'
import { getFileIcon, formatBytes, formatDate } from '../utils/files'

export default function FileCard({ file, onDownload, onDelete, onShare }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const Icon = getFileIcon(file.mimetype || file.originalName)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="card-item file-card">
      <div className="card-icon file-icon">
        <Icon size={28} />
      </div>
      <div className="card-info">
        <span className="card-name">{file.originalName}</span>
        <span className="card-meta">
          {formatBytes(file.size)} · {formatDate(file.createdAt || file.created_at)}
        </span>
      </div>
      <div className="card-actions" ref={menuRef}>
        <button
          className="card-menu-btn"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
        >
          <MoreVertical size={18} />
        </button>
        {menuOpen && (
          <div className="action-menu">
            <button
              className="action-menu-item"
              onClick={() => { setMenuOpen(false); onDownload(file) }}
            >
              <Download size={16} /> Download
            </button>
            <button
              className="action-menu-item"
              onClick={() => { setMenuOpen(false); onShare(file) }}
            >
              <Share2 size={16} /> Share
            </button>
            <button
              className="action-menu-item danger"
              onClick={() => { setMenuOpen(false); onDelete(file) }}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
