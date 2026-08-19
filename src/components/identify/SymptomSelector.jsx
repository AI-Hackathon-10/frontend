export default function SymptomSelector({ options, selected, onToggle }) {
  return (
    <section aria-labelledby="symptom-selector-title" className="symptom-selector">
      <div className="section-heading section-heading--tight">
        <div>
          <span className="eyebrow">현재 상태</span>
          <h2 id="symptom-selector-title">현재 어떤 증상이 있나요?</h2>
        </div>
        <span className="symptom-count" aria-live="polite">{selected.length}개 선택</span>
      </div>
      <p className="section-helper">해당되는 증상을 모두 선택해 주세요.</p>
      <div className="symptom-selector__grid">
        {options.map((symptom) => {
          const isSelected = selected.includes(symptom)

          return (
            <button
              aria-pressed={isSelected}
              className={`symptom-chip ${isSelected ? 'is-selected' : ''}`}
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
    </section>
  )
}
