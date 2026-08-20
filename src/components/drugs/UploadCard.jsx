import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon.jsx'

function canCreateObjectUrl() {
  return typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
}

export default function UploadCard({ label, side, onChange, required = false }) {
  const cameraInputRef = useRef(null)
  const albumInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const previewUrlRef = useRef('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isPickerOpen, setPickerOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const sourceOptions = [
    { key: 'camera', label: '촬영하기', icon: 'camera', inputRef: cameraInputRef },
    { key: 'album', label: '사진 보관함에서 선택하기', icon: 'image', inputRef: albumInputRef },
    { key: 'file', label: '파일에서 선택하기', icon: 'folder', inputRef: fileInputRef },
  ]

  const releasePreview = () => {
    if (previewUrlRef.current && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    previewUrlRef.current = ''
  }

  useEffect(() => () => releasePreview(), [])

  useEffect(() => {
    if (!isPickerOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPickerOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPickerOpen])

  const selectFile = (nextFile) => {
    if (!nextFile || !nextFile.type.startsWith('image/')) return
    releasePreview()

    const nextPreviewUrl = canCreateObjectUrl() ? URL.createObjectURL(nextFile) : ''
    previewUrlRef.current = nextPreviewUrl
    setFile(nextFile)
    setPreviewUrl(nextPreviewUrl)
    setPickerOpen(false)
    onChange(nextFile)
  }

  const handleFileChange = (event) => selectFile(event.target.files?.[0] ?? null)

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files?.[0] ?? null)
  }

  const handleRemove = () => {
    releasePreview()
    setFile(null)
    setPreviewUrl('')
    setPickerOpen(false)
    onChange(null)
    ;[cameraInputRef, albumInputRef, fileInputRef].forEach((inputRef) => {
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  return (
    <article className={`upload-card ${file ? 'has-file' : ''} ${isDragging ? 'is-dragging' : ''}`}>
      <div className="upload-card__topline">
        <div>
          <h3>{label}</h3>
        </div>
        <span className="upload-card__status">{file ? '선택됨' : '선택 전'}</span>
      </div>

      <button
        aria-controls={`${side}-source-picker`}
        aria-expanded={isPickerOpen}
        aria-label={`${label} 이미지 선택 영역`}
        aria-required={required}
        className="upload-card__preview"
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
        onDragLeave={(event) => { event.preventDefault(); setIsDragging(false) }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onClick={() => setPickerOpen((current) => !current)}
        type="button"
      >
        {previewUrl ? (
          <img alt={`${label} 업로드 미리보기`} src={previewUrl} />
        ) : (
          <span className="upload-card__empty">
            <span className="upload-card__empty-icon"><Icon name="image" size={23} /></span>
            <strong>사진 추가</strong>
            <small>클릭 또는 드래그</small>
          </span>
        )}
      </button>

      {isPickerOpen && (
        <div className="upload-action-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setPickerOpen(false)}>
          <section aria-labelledby={`${side}-upload-action-title`} aria-modal="true" className="upload-source-picker" id={`${side}-source-picker`} role="dialog">
            <span className="upload-source-picker__handle" aria-hidden="true" />
            <header className="upload-source-picker__header">
              <h3 id={`${side}-upload-action-title`}>사진 추가</h3>
              <button aria-label="사진 추가 닫기" onClick={() => setPickerOpen(false)} type="button"><Icon name="close" size={18} /></button>
            </header>
            <div className="upload-source-picker__options">
              {sourceOptions.map((source) => (
                <div className="upload-source-picker__item" key={source.key}>
                  <button className="upload-source-picker__option" onClick={() => source.inputRef.current?.click()} type="button">
                    <span className="upload-source-picker__icon"><Icon name={source.icon} size={18} /></span>
                    <span>{source.label}</span>
                    <Icon name="chevronRight" size={15} />
                  </button>
                  <input accept="image/*" aria-label={`${label} ${source.label}`} aria-required={required} capture={source.key === 'camera' ? 'environment' : undefined} className="sr-only" id={`${side}-${source.key}-upload`} onChange={handleFileChange} ref={source.inputRef} type="file" />
                </div>
              ))}
            </div>
            <button className="upload-source-picker__cancel" onClick={() => setPickerOpen(false)} type="button">취소</button>
          </section>
        </div>
      )}

      {file && (
        <div className="upload-card__footer">
          <span className="upload-card__hint">{file.name}</span>
          <span className="upload-card__actions">
            <button onClick={() => setPickerOpen((current) => !current)} type="button">변경</button>
            <button aria-label={`${label} 사진 삭제`} onClick={handleRemove} type="button">삭제</button>
          </span>
        </div>
      )}
    </article>
  )
}
