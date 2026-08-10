import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="breadcrumbs">
      <button className="breadcrumb-item" onClick={() => onNavigate(null)}>
        <Home size={16} />
        <span>My Drive</span>
      </button>
      {path.map((folder, i) => (
        <span key={folder.id} className="breadcrumb-segment">
          <ChevronRight size={16} className="breadcrumb-sep" />
          <button
            className="breadcrumb-item"
            onClick={() => onNavigate(folder, i)}
          >
            {folder.name}
          </button>
        </span>
      ))}
    </nav>
  )
}
