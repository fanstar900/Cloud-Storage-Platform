import { Link } from 'react-router-dom'
import { Cloud, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-brand">
          <Cloud size={40} />
          <h1>CloudDrive</h1>
        </div>
        <h2>Page not found</h2>
        <p className="auth-subtitle">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={18} /> Back to My Drive
        </Link>
      </div>
    </div>
  )
}
