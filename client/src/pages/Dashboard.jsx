import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FolderPlus, Loader2, FolderOpen, FileX, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Breadcrumbs from '../components/Breadcrumbs'
import FolderCard from '../components/FolderCard'
import FileCard from '../components/FileCard'
import UploadButton from '../components/UploadButton'
import ShareDialog from '../components/ShareDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import { folderApi, fileApi } from '../api/services'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const folderId = searchParams.get('folder') || null

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [breadcrumbPath, setBreadcrumbPath] = useState([])
  const [loadingFolders, setLoadingFolders] = useState(true)
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [showShare, setShowShare] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)
  const toast = useToast()

  const loadContent = useCallback(async () => {
    setLoadingFolders(true)
    setLoadingFiles(true)
    try {
      const folderRes = folderId
        ? await folderApi.getById(folderId)
        : await folderApi.getRoot()

        const folderData = folderRes.data.contents || folderRes.data

        const children =
            folderData.children ||
            folderData.folders ||
            folderData.childFolders ||
            []

        setFolders(Array.isArray(children) ? children : [])

        const currentFolder = folderData.folder || folderData

        if (folderId && currentFolder) {
            setBreadcrumbPath(folderData.breadcrumbPath || [])
        } else {
            setBreadcrumbPath([])
        }

    } catch (err) {
      toast.error(getErrorMessage(err))
      setFolders([])
    } finally {
      setLoadingFolders(false)
    }
    try {
      const fileRes = await fileApi.getFiles(folderId)
      setFiles(Array.isArray(fileRes.data) ? fileRes.data : (fileRes.data.files || []))
    } catch (err) {
      toast.error(getErrorMessage(err))
      setFiles([])
    } finally {
      setLoadingFiles(false)
    }
  }, [folderId])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  const navigateToFolder = (folder) => {
    if (folder === null) {
      setSearchParams({})
    } else {
      setSearchParams({ folder: folder.id })
    }
  }

  const navigateToBreadcrumb = (folder, index) => {
    if (index === -1 || !folder) {
      setSearchParams({})
    } else {
      setSearchParams({ folder: folder.id })
    }
  }

  const handleCreateFolder = async (e) => {
    e?.preventDefault()
    if (!newFolderName.trim()) return
    setCreatingFolder(true)
    try {
      await folderApi.create(newFolderName.trim(), folderId)
      toast.success('Folder created')
      setNewFolderName('')
      setShowNewFolder(false)
      loadContent()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleDownload = async (file) => {
    setDownloadingId(file.id)
    try {
      const res = await fileApi.download(file.id)
      const url = window.URL.createObjectURL(res.data)
      const a = window.document.createElement('a')
      a.href = url
      a.download = file.originalName
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fileApi.remove(deleteTarget.id)
      toast.success('File deleted')
      setDeleteTarget(null)
      loadContent()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const isEmpty = !loadingFolders && !loadingFiles && folders.length === 0 && files.length === 0

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-section">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard">
          <div className="dashboard-header">
            <Breadcrumbs path={breadcrumbPath} onNavigate={navigateToBreadcrumb} />
            <div className="dashboard-actions">
              <button className="btn btn-secondary" onClick={() => setShowNewFolder(true)}>
                <FolderPlus size={18} />
                <span>New Folder</span>
              </button>
              <UploadButton folderId={folderId} onUploaded={loadContent} />
            </div>
          </div>

          {(loadingFolders || loadingFiles) && (
            <div className="state-loading">
              <Loader2 size={32} className="spin" />
              <p>Loading your drive...</p>
            </div>
          )}

          {isEmpty && (
            <div className="empty-state">
              <FolderOpen size={64} className="empty-icon" />
              <h3>{breadcrumbPath.length > 0 ? 'This folder is empty' : 'My Drive is empty'}</h3>
              <p>Upload your first file or create a folder to get started.</p>
              <div className="empty-actions">
                <button className="btn btn-secondary" onClick={() => setShowNewFolder(true)}>
                  <FolderPlus size={18} /> New Folder
                </button>
                <UploadButton folderId={folderId} onUploaded={loadContent} />
              </div>
            </div>
          )}

          {!isEmpty && !loadingFolders && folders.length > 0 && (
            <section className="content-section">
              <h4 className="section-label">Folders</h4>
              <div className="card-grid">
                {folders.map((f) => (
                  <FolderCard
                    key={f.id}
                    folder={f}
                    onClick={() => navigateToFolder(f)}
                  />
                ))}
              </div>
            </section>
          )}

          {!isEmpty && !loadingFiles && files.length > 0 && (
            <section className="content-section">
              <h4 className="section-label">Files</h4>
              <div className="card-grid">
                {files.map((f) => (
                  <FileCard
                    key={f.id}
                    file={f}
                    onDownload={handleDownload}
                    onDelete={setDeleteTarget}
                    onShare={setShowShare}
                  />
                ))}
              </div>
            </section>
          )}

          {!isEmpty && !loadingFiles && files.length === 0 && folders.length > 0 && !loadingFolders && (
            <div className="inline-empty">
              <FileX size={32} />
              <p>No files in this folder yet</p>
            </div>
          )}
        </main>
      </div>

      {showNewFolder && (
        <div className="modal-overlay" onClick={() => setShowNewFolder(false)}>
          <form className="modal modal-sm" onClick={(e) => e.stopPropagation()} onSubmit={handleCreateFolder}>
            <div className="modal-header">
              <div className="modal-title">
                <FolderPlus size={20} />
                <h3>New Folder</h3>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowNewFolder(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Folder name</label>
                <input
                  type="text"
                  placeholder="Untitled folder"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={creatingFolder || !newFolderName.trim()}>
                {creatingFolder ? 'Creating...' : 'Create folder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showShare && (
        <ShareDialog file={showShare} onClose={() => setShowShare(null)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete file"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {downloadingId && (
        <div className="loading-overlay">
          <Loader2 size={32} className="spin" />
          <p>Preparing download...</p>
        </div>
      )}
    </div>
  )
}
