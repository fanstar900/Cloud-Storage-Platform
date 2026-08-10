import { useState } from 'react'
import { Copy, Check, Link2, X } from 'lucide-react'
import { fileApi } from '../api/services'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function ShareDialog({ file, onClose }) {
  const [expiresIn, setExpiresIn] = useState(7)
  const [maxDownloads, setMaxDownloads] = useState(20)
  const [shareUrl, setShareUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await fileApi.share(file.id, expiresIn, maxDownloads)
      setShareUrl(res.data.share_url)
      toast.success('Share link created')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Link2 size={20} />
            <h3>Share "{file.originalName}"</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!shareUrl ? (
          <div className="modal-body">
            <p className="modal-description">
              Create a public link that anyone can use to download this file.
            </p>
            <div className="form-row">
              <label>Expires in (days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
              />
            </div>
            <div className="form-row">
              <label>Max downloads</label>
              <input
                type="number"
                min="1"
                value={maxDownloads}
                onChange={(e) => setMaxDownloads(Number(e.target.value))}
              />
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create share link'}
            </button>
          </div>
        ) : (
          <div className="modal-body">
            <p className="modal-description">Your share link is ready:</p>
            <div className="share-link-box">
              <span className="share-link-url">{shareUrl}</span>
              <button className="btn btn-secondary" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button className="btn btn-ghost btn-full" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
