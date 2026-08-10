import api from './axios'

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const folderApi = {
  getRoot: () => api.get('/folders'),
  getById: (id) => api.get(`/folders/${id}`),
  create: (name, parentId) =>
    api.post('/folders', { name, parent_id: parentId ?? null }),
}

export const fileApi = {
  getFiles: (folderId) =>
    api.get('/files', { params: folderId ? { folder_id: folderId } : {} }),
  upload: (file, folderId, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) formData.append('folder_id', folderId)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
  },
  download: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
  remove: (id) => api.delete(`/files/${id}`),
  share: (id, expiresInDays, maxDownloads) =>
    api.post(`/files/${id}/share`, { expires_in_days: expiresInDays, max_downloads: maxDownloads }),
}

export const searchApi = {
  search: (q) => api.get('/search', { params: { q } }),
}

export const shareApi = {
  getShared: (token) => api.get(`/share/${token}`),
  download: (token) => api.get(`/share/${token}/download`, { responseType: 'blob' }),
}
