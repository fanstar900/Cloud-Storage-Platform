import {
  FileText, Image, Film, Music, File, Archive, FileCode,
  FileSpreadsheet, FileType, FileImage,
} from 'lucide-react'

export function getFileIcon(nameOrMime = '') {
  const v = (nameOrMime || '').toLowerCase()
  if (v.includes('image') || /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(v)) return FileImage
  if (v.includes('video') || /\.(mp4|avi|mov|mkv|webm|flv|wmv)$/.test(v)) return Film
  if (v.includes('audio') || /\.(mp3|wav|flac|aac|ogg|m4a)$/.test(v)) return Music
  if (v.includes('pdf') || v.endsWith('.pdf')) return FileType
  if (v.includes('zip') || v.includes('compressed') || /\.(zip|rar|7z|tar|gz)$/.test(v)) return Archive
  if (v.includes('spreadsheet') || /\.(xls|xlsx|csv|ods)$/.test(v)) return FileSpreadsheet
  if (v.includes('code') || /\.(js|jsx|ts|tsx|py|java|c|cpp|rb|go|rs|php|html|css|json|xml|yml|yaml|sh)$/.test(v)) return FileCode
  if (v.includes('text') || /\.(txt|md|rtf|doc|docx)$/.test(v)) return FileText
  return File
}

export function formatBytes(bytes) {
  if (bytes == null || isNaN(bytes)) return '—'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return '—'
  }
}

export function getInitials(name) {
  if (!name) return 'U'
  const parts = name.split(/[\s@]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
