'use client'
import { useState, useRef, useMemo } from 'react'
import { useApp } from '@/lib/store'

export default function Envios() {
  const { pedidos, seguimientos, setSeguimientos, importarSeguimientos, findCol, showToast, seleccionados } = useApp()
  const fileRef     = useRef()
  const [numManual, setNumManual]   = useState('')
  const [codManual, setCodManual]   = useState('')
  const [filtroEnv, setFiltroEnv]   = useState('Todos')
  const [busqueda,  setBusqueda]    = useState('')
  const [modalCols, setModalCols]   = useState(null) // { rows, columnas }
  const [colPedSel, setColPedSel]   = useState('')
  const [colCodSel, setColCodSel]   = useState('')

  const colPed  = pedidos.length ? findCol(pedidos[0], ['número de orden', 'número', 'pedido']) : null
  const colCli  = pedidos.length ? findCol(pedidos[0], ['nombre del comprador', 'cliente']) : null
  const colProd = pedidos.length ? findCol(pedidos[0], ['nombre del producto', 'producto']) : null
  const colCant = pedidos.length ? findCol(pedidos[0], ['cantidad del producto', 'cantidad']) : null

  // Pedidos únicos para la tabla
  const pedidosUnicos = useMemo(() => {
    const vistos = new Set()
    return pedidos.filter(r => {
      const num = String(r[colPed] || '')
      if (vistos.has(num)) return false
      vistos.add(num); return true
    })
  }, [pedidos, colPed])

  const filasFiltradas = useMemo(() => {
    return pedidosUnicos.filter(row => {
      const num = String(row[colPed] || '')
      const cod = seguimientos[num] || ''
      const tieneCod = !!cod && cod !== ''
      if (filtroEnv === 'Con seguimiento' && !tieneCod) return false
      if (filtroEnv === 'Sin seguimiento' && tieneCod)  return false
      const q = busqueda.toLowerCase()
      if (q && !num.toLowerCase().includes(q) &&
          !String(row[colCli] || '').toLowerCase().includes(q) &&
          !cod.toLowerCase().includes(q)) return false
      return true
    })
  }, [pedidosUnicos, seguimientos, filtroEnv, busqueda, colPed, colCli])

  function agregarManual() {
    if (!numManual.trim() || !codManual.trim()) {
      showToast('Completá número de pedido y código', 'warn'); return
    }
    setSeguimientos(prev => ({ ...prev, [numManual.trim()]: codManual.trim() }))
    showToast(`✅ Código agregado al pedido ${numManual}`)
    setNumManual(''); setCodManual('')
  }

  function marcarEnProceso() {
    if (!seleccionados.size) { showToast('Seleccioná pedidos primero', 'warn'); return }
    const nuevo = { ...seguimientos }
    seleccionados.forEach(num => { if (!nuevo[num]) nuevo[num] = 'EN PROCESO' })
    setSeguimientos(nuevo)
    showToast(`✅ ${seleccionados.size} pedidos marcados EN PROCESO`)
  }

  function copiar(cod) {
    navigator.clipboard.writeText(cod)
    showToast('📋 Código copiado')
  }

  // Importar seguimientos
  async function onFileSeg(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        let rows
        if (file.name.endsWith('.csv')) {
          const Papa = require('papaparse')
          rows = Papa.parse(ev.target.result, { header: true, skipEmptyLines: true }).data
        } else {
          const XLSX = require('xlsx')
          const wb = XLSX.read(ev.target.result, { type: 'binary' })
          rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        }
        const cols = Object.keys(rows[0] || {})
        // Autodetectar
        const autoPed = cols.find(c => ['número','numero','pedido','orden'].some(k => c.toLowerCase().includes(k))) || cols[0]
        const autoCod = cols.find(c => ['seguimiento','tracking','codigo','código','envio','envío'].some(k => c.toLowerCase().includes(k))) || cols[1]
        setColPedSel(autoPed)
        setColCodSel(autoCod)
        setModalCols({ rows, columnas: cols })
      } catch { showToast('Error al leer el archivo', 'err') }
    }
    if (file.name.endsWith('.csv')) reader.readAsText(file, 'latin1')
    else reader.readAsBinaryString(file)
    e.target.value = ''
  }

  function confirmarImport() {
    if (!colPedSel || !colCodSel) { showToast('Seleccioná ambas columnas', 'warn'); return }
    importarSeguimientos(modalCols.rows, colPedSel, colCodSel)
    setModalCols(null)
  }

  const nConSeg = Object.keys(seguimientos).length
  const nSinSeg = pedidosUnicos.length - nConSeg

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

      {/* Modal selección de columnas */}
      {modalCols && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#0F1117', border: '1px solid #1E2030',
            borderRadius: 16, padding: 28, width: 480
          }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              Configurar columnas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Columna Número de Pedido', val: colPedSel, set: setColPedSel },
                { label: 'Columna Código de Seguimiento', val: colCodSel, set: setColCodSel },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <div style={{ fontSize: 12, color: '#5A5F7A', marginBottom: 6, fontWeight: 600 }}>{label}</div>
                  <select value={val} onChange={e => set(e.target.value)} style={{
                    width: '100%', background: '#141620', border: '1px solid #2E3050',
                    borderRadius: 8, padding: '9px 12px', color: '#E8EAF0',
                    fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif'
                  }}>
                    {modalCols.columnas.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={confirmarImport} className="btn-primary">✅ Importar</button>
              <button onClick={() => setModalCols(null)} className="btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Con seguimiento', val: nConSeg,              color: '#2DD4A0' },
          { label: 'Sin seguimiento', val: Math.max(0, nSinSeg), color: '#F5A623' },
          { label: 'Total pedidos',   val: pedidosUnicos.length,  color: '#4F6EF7' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#0F1117', border: `1px solid #1E2030`,
            borderTop: `3px solid ${s.color}`,
            borderRadius: 12, padding: '16px 20px'
          }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: s.color }}>
              {s.val}
            </div>
            <div style={{ fontSize: 12, color: '#5A5F7A', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div style={{
        background: '#0F1117', border: '1px solid #1E2030',
        borderRadius: 12, padding: '14px 18px',
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <input type="file" ref={fileRef} onChange={onFileSeg}
          accept=".csv,.xlsx,.xls" style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} className="btn-primary"
          style={{ background: '#F5A623', color: '#000' }}>
          📦 Importar seguimientos CSV
        </button>
        <button onClick={marcarEnProceso} className="btn-ghost">
          🕐 Marcar EN PROCESO
        </button>

        {/* Agregar manual */}
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          marginLeft: 'auto', flexWrap: 'wrap'
        }}>
          <input placeholder="N° pedido" value={numManual}
            onChange={e => setNumManual(e.target.value)}
            className="input-dark" style={{ width: 120 }} />
          <input placeholder="Código seguimiento" value={codManual}
            onChange={e => setCodManual(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && agregarManual()}
            className="input-dark" style={{ width: 200 }} />
          <button onClick={agregarManual} className="btn-primary"
            style={{ background: '#2DD4A0', color: '#000' }}>
            ✅ Agregar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <input placeholder="🔍 Buscar pedido, cliente, código…"
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="input-dark" style={{ width: 280 }} />
        {['Todos', 'Con seguimiento', 'Sin seguimiento'].map(f => (
          <button key={f} onClick={() => setFiltroEnv(f)} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', border: 'none',
            background: filtroEnv === f ? '#4F6EF7' : '#0F1117',
            color: filtroEnv === f ? 'white' : '#5A5F7A',
            fontFamily: 'DM Sans, sans-serif',
          }}>{f}</button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#5A5F7A' }}>
          {filasFiltradas.length} pedidos
        </div>
      </div>

      {/* Tabla */}
      <div style={{
        flex: 1, overflow: 'auto',
        background: '#0F1117', border: '1px solid #1E2030', borderRadius: 12
      }}>
        {pedidos.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 10, color: '#3A3F58' }}>
            <div style={{ fontSize: 36 }}>⬡</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Sin pedidos</div>
            <div style={{ fontSize: 13 }}>Importá pedidos primero</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2030', position: 'sticky', top: 0, background: '#0F1117' }}>
                {['Pedido', 'Cliente', 'Producto', 'Cant', 'Estado', 'Código de seguimiento', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#5A5F7A', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filasFiltradas.map((row, i) => {
                const num = String(row[colPed] || '')
                const cod = seguimientos[num] || ''
                const tieneCod = !!cod
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #141620', background: tieneCod ? 'rgba(45,212,160,0.04)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', color: '#4F6EF7', fontWeight: 600, whiteSpace: 'nowrap' }}>{num}</td>
                    <td style={{ padding: '10px 14px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#C8CAD8' }}>
                      {String(row[colCli] || '')}
                    </td>
                    <td style={{ padding: '10px 14px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#8A8FA8' }}>
                      {String(row[colProd] || '')}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>{row[colCant] || ''}</td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                        background: tieneCod ? 'rgba(45,212,160,0.15)' : 'rgba(245,166,35,0.12)',
                        color: tieneCod ? '#2DD4A0' : '#F5A623'
                      }}>
                        {tieneCod ? '✅ Enviado' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#5A5F7A', fontFamily: 'monospace', fontSize: 12 }}>
                      {cod || '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {cod && (
                        <button onClick={() => copiar(cod)} style={{
                          background: 'transparent', border: '1px solid #1E2030',
                          borderRadius: 6, padding: '4px 10px', color: '#5A5F7A',
                          fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                        }}>📋</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
