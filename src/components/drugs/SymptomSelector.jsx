import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon.jsx'

export default function SymptomSelector({ categories, primarySymptoms, selected, onToggle, required = false, maxSelected = 10 }) {
  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef(null)
  const additionalSymptoms = selected.filter((symptom) => !primarySymptoms.includes(symptom))

  useEffect(() => {
    if (!isOpen) return undefined

    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <section aria-labelledby="symptom-selector-title" className="symptom-selector">
      <div className="section-heading section-heading--tight">
        <div>
          <h2 id="symptom-selector-title">
            증상 선택 {required && <><span aria-hidden="true" className="required-mark">*</span><span className="sr-only"> (필수)</span></>}
          </h2>
        </div>
        <span className="symptom-count" aria-live="polite">{selected.length}/{maxSelected}개 선택</span>
      </div>
      <p className="section-helper">해당되는 증상을 모두 선택할 수 있어요.</p>
      <div className="symptom-selector__grid">
        {primarySymptoms.map((symptom) => {
          const isSelected = selected.includes(symptom)
          const isDisabled = !isSelected && selected.length >= maxSelected
          return (
            <button
              aria-pressed={isSelected}
              className={`symptom-chip ${isSelected ? 'is-selected' : ''}`}
              disabled={isDisabled}
              key={symptom}
              onClick={() => onToggle(symptom)}
              type="button"
            >
              <span className="symptom-chip__dot" aria-hidden="true" />
              <span>{symptom}</span>
            </button>
          )
        })}
      </div>
      {additionalSymptoms.length > 0 && (
        <div className="selected-symptoms">
          {additionalSymptoms.map((symptom) => (
            <button aria-label={`${symptom} 삭제`} className="selected-symptom-chip" key={symptom} onClick={() => onToggle(symptom)} type="button">
              <span>{symptom}</span><Icon name="close" size={14} />
            </button>
          ))}
        </div>
      )}
      <button className="symptom-selector__more" onClick={() => setIsOpen(true)} type="button">
        <Icon name="plus" size={15} /> 다른 증상 찾기
      </button>

      {isOpen && (
        <div className="symptom-sheet-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsOpen(false)}>
          <section aria-labelledby="symptom-sheet-title" aria-modal="true" className="symptom-sheet" role="dialog">
            <div className="symptom-sheet__handle" aria-hidden="true" />
            <header className="symptom-sheet__header">
              <div><h3 id="symptom-sheet-title">증상 선택</h3><p>추가할 증상을 모두 골라 주세요.</p></div>
              <button aria-label="증상 선택 닫기" className="symptom-sheet__close" onClick={() => setIsOpen(false)} ref={closeButtonRef} type="button"><Icon name="close" size={18} /></button>
            </header>
            <div className="symptom-sheet__body">
              {categories.map((category) => (
                <div className="symptom-category" key={category.name}>
                  <h4>{category.name}</h4>
                  <div className="symptom-category__options">
                    {category.symptoms.map((symptom) => {
                      const isSelected = selected.includes(symptom)
                      const isDisabled = !isSelected && selected.length >= maxSelected
                      return <button aria-pressed={isSelected} className={`symptom-option ${isSelected ? 'is-selected' : ''}`} disabled={isDisabled} key={symptom} onClick={() => onToggle(symptom)} type="button">{isSelected && <Icon name="check" size={13} />}{symptom}</button>
                    })}
                  </div>
                </div>
              ))}
            </div>
            <footer className="symptom-sheet__footer">
              <span>{selected.length}/{maxSelected}개 선택</span>
              <button className="button button--primary" onClick={() => setIsOpen(false)} type="button">선택 완료</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  )
}
