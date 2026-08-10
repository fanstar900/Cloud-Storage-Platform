import { useRef, useState } from 'react'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { fileApi } from '../api/services'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function UploadButton({ folderId, onUploaded }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  const handleClick = () => inputRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      await fileApi.upload(file, folderId, setProgress)
      toast.success(`"${file.name}" uploaded successfully`)
      onUploaded?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <button
        className="btn btn-primary"
        onClick={handleClick}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="spin" />
            <span>Uploading... {progress}%</span>
          </>
        ) : (
          <>
            <Upload size={18} />
            <span>Upload</span>
          </>
        )}
      </button>
    </>
  )
}
