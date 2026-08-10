import { Folder } from 'lucide-react'

export default function FolderCard({ folder, onClick }) {
  return (
    <button className="card-item folder-card" onClick={onClick}>
      <div className="card-icon folder-icon">
        <Folder size={28} />
      </div>
      <div className="card-info">
        <span className="card-name">{folder.name}</span>
        <span className="card-meta">Folder</span>
      </div>
    </button>
  )
}
