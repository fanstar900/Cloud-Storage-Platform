import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Cloud, Download, Loader2, AlertCircle, FileText } from 'lucide-react'
import { shareApi } from '../api/services'
import { getFileIcon, formatBytes, formatDate } from '../utils/files'
import { getErrorMessage } from '../utils/errors'

export default function SharedFile() {
  const { token } = useParams()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await shareApi.getShared(token)
        setFile(res.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await shareApi.download(token)
      const url = window.URL.createObjectURL(res.data)
      const a = window.document.createElement('a')
      a.href = url
      a.download = file?.name || 'download'
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDownloading(false)
    }
  }

  const Icon = file ? getFileIcon(file.mimetype || file.originalName) : FileText

  return (
    <div className="shared-page">
      <div className="shared-card">
        <div className="shared-brand">
          <Cloud size={36} />
          <span>CloudDrive</span>
        </div>

        {loading && (
          <div className="state-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading shared file...</p>
          </div>
        )}

        {!loading && error && (
          <div className="shared-error">
            <AlertCircle size={48} />
            <h2>Link unavailable</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && file && (
          <>
            <div className="shared-file-info">
              <div className="shared-file-icon">
                <Icon size={48} />
              </div>
              <h2>{file.originalName}</h2>
              <p className="shared-file-meta">
                {formatBytes(file.size)} · {formatDate(file.createdAt || file.created_at)}
              </p>
            </div>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <><Loader2 size={20} className="spin" /> Preparing...</>
              ) : (
                <><Download size={20} /> Download file</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
