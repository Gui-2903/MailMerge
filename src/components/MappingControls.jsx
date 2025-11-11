import React from 'react'

export default function MappingControls({ headers, mapping, setMapping }) {
  const placeholders = ['#nome', '#email'] // pode ser detectado futuramente

  const handleChange = (ph, value) => {
    setMapping({ ...mapping, [ph]: value })
  }

  return (
    <div className="controls">
      {placeholders.map((ph, i) => (
        <div key={i} className="map-row">
          <div style={{ minWidth: 100 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Placeholder</div>
            <div style={{ fontWeight: 600 }}>{ph}</div>
          </div>
          <select value={mapping[ph] || ''} onChange={(e) => handleChange(ph, e.target.value)}>
            <option value="">-- selecionar coluna --</option>
            {headers.map((h, idx) => (
              <option key={idx} value={idx}>
                {h}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
