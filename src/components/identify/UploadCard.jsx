import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon.jsx'
import PillIllustration from '../illustrations/PillIllustration.jsx'

function canCreateObjectUrl() {
  return typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
}

export default function UploadCard({ label, side, onChange }) {
  const cameraInputRef = useRef(null)
  const albumInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const previewUrlRef = useRef('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isPickerOpen, setPickerOpen] = useState(false)

  const sourceOptions = [
    { key: 'camera', label: '촬영하기', icon: 'camera', inputRef: cameraInputRef },
    { key: 'album', label: '앨범에서 선택하기', icon: 'image', inputRef: albumInputRef },
    { key: 'file', label: '파일 탐색기에서 선택하기', icon: 'folder', inputRef: fileInputRef },
  ]

  const releasePreview = () => {
    if (previewUrlRef.current && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    previewUrlRef.current = ''
  }

  useEffect(() => () => releasePreview(), [])

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    releasePreview()

    const nextPreviewUrl = nextFile && canCreateObjectUrl() ? URL.createObjectURL(nextFile) : ''
    previewUrlRef.current = nextPreviewUrl
    setFile(nextFile)
    setPreviewUrl(nextPreviewUrl)
    setPickerOpen(false)
    onChange(nextFile)
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
    <article className={`upload-card ${file ? 'has-file' : ''}`}>
      <div className="upload-card__topline">
        <div>
          <span className="eyebrow">{side === 'front' ? '식별문자' : '분할선'}</span>
          <h3>{label}</h3>
        </div>
        <span className="upload-card__status">{file ? '선택됨' : '선택 전'}</span>
      </div>

      <button
        aria-controls={`${side}-source-picker`}
        aria-expanded={isPickerOpen}
        aria-label={`${label} 이미지 선택 영역`}
        className="upload-card__preview"
        onClick={() => setPickerOpen((current) => !current)}
        type="button"
      >
        {previewUrl ? (
          <img alt={`${label} 업로드 미리보기`} src={previewUrl} />
        ) : (
          <>
            <span className="preview-grid" aria-hidden="true" />
            <PillIllustration imprint={side === 'front' ? 'PM' : '|'} size="large" variant="pink" />
            <span className="upload-card__example"><Icon name="sparkle" size={13} /> 예시 이미지</span>
          </>
        )}
      </button>

      {isPickerOpen && (
        <div aria-label={`${label} 사진 선택 방법`} className="upload-source-picker" id={`${side}-source-picker`} role="group">
          {sourceOptions.map((source) => (
            <div className="upload-source-picker__item" key={source.key}>
              <button className="upload-source-picker__option" onClick={() => source.inputRef.current?.click()} type="button">
                <Icon name={source.icon} size={16} />
                <span>{source.label}</span>
              </button>
              <input
                accept="image/*"
                aria-label={`${label} ${source.label}`}
                capture={source.key === 'camera' ? 'environment' : undefined}
                className="sr-only"
                id={`${side}-${source.key}-upload`}
                onChange={handleFileChange}
                ref={source.inputRef}
                type="file"
              />
            </div>
          ))}
        </div>
      )}

      <div className="upload-card__footer">
        <span className="upload-card__hint">{file ? '이미지를 눌러 교체할 수 있어요' : '예시 이미지를 눌러 사진을 선택해요'}</span>
        {file && (
          <button aria-label={`${label} 사진 삭제`} className="icon-button icon-button--small" onClick={handleRemove} type="button">
            <Icon name="close" size={15} />
          </button>
        )}
      </div>
    </article>
  )
}
