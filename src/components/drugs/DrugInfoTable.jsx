export default function DrugInfoTable({ drug }) {
  const rows = [
    ['제조사', drug.manufacturer],
    ['주성분', drug.ingredient],
    ['분류명', drug.classification],
    ['모양', drug.shape],
    ['제형', drug.form],
    ['색상', drug.color],
    ['식별 문자', `앞면 ${drug.imprintFront} · 뒷면 ${drug.imprintBack}`],
  ]

  return (
    <dl className="info-table">
      {rows.map(([label, value]) => (
        <div className="info-table__row" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
