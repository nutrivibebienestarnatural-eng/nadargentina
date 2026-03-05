'use client'
import { useState, useRef, useMemo } from 'react'
import { useApp } from '@/lib/store'

function parsearCSV(texto) {
  const Papa = require('papaparse')
  const result = Papa.parse(texto, { header: true, skipEmptyLines: true, encoding: 'latin1' })
  return result.data
}

export default function Pedidos({ onNavigate }) {
  const { pedidos, importarPedidos, seleccionados, setSeleccionados, consolidarPedidos, findCol, showToast } = useApp()
  const fileRef = useRef()
  const [busqueda, setBusqueda]       = useState('')
  const [filtroProd, setFiltroProd]   = useState('Todos')
  const [filtroCli, setFiltroCli]     = useState('Todos')
  const [filtroEst, setFiltroEst]     = useState('Todos')
  const [cargando, setCargando]       = useState(false)

  const colPed  = pedidos.length ? findCol(pedidos[0], ['número de orden', 'número', 'pedido']) : null
  const colFech = pedidos.length ? findCol(pedidos[0], ['fecha']) : null
  const colCli  = pedidos.length ? findCol(pedidos[0], ['nombre del comprador', 'cliente', 'comprador']) : null
  const colProd = pedidos.length ? findCol(pedidos[0], ['nombre del producto', 'producto']) : null
  const colCant = pedidos.length ? findCol(pedidos[0], ['cantidad del producto', 'cantidad']) : null
  const colEst  = pedidos.length ? findCol(pedidos[0], ['estado de la orden', 'estado de orden', 'estado']) : null

  // Opciones de filtros
  const opcionesProds = useMemo(() => ['Todos', ...new Set(pedidos.map(r => String(r[colProd] || '')).filter(Boolean))].sort(), [pedidos, colProd])
  const opcionesClis  = useMemo(() => ['Todos', ...new Set(pedidos.map(r => String(r[colCli]  || '')).filter(Boolean))].sort(), [pedidos, colCli])

  // Filas filtradas
  const filasFiltradas = useMemo(() => {
    return pedidos.filter(row => {
      const num  = String(row[colPed]  || '').toLowerCase()
      const cli  = String(row[colCli]  || '').toLowerCase()
      const prod = String(row[colProd] || '').toLowerCase()
      const est  = String(row[colEst]  || '').toLowerCase()
      const q    = busqueda.toLowerCase()
      if (q && !num.includes(q) && !cli.includes(q) && !prod.includes(q)) return false
      if (filtroEst !== 'Todos' && !est.includes(filtroEst.toLowerCase())) return false
      if (filtroProd !== 'Todos' && String(row[colProd] || '') !== filtroProd) return false
      if (filtroCli  !== 'Todos' && String(row[colCli]  || '') !== filtroCli)  return false
      return true
    })
  }, [pedidos, busqueda, filtroEst, filtroProd, filtroCli, colPed, colCli, colProd, colEst])

  // Importar archivo
  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCargando(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        let rows
        if (file.name.endsWith('.csv')) {
          rows = parsearCSV(ev.target.result)
        } else {
          const XLSX = require('xlsx')
          const wb = XLSX.read(ev.target.result, { type: 'binary' })
          rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        }
        importarPedidos(rows)
      } catch(err) {
        showToast('Error al leer el archivo', 'err')
      }
      setCargando(false)
    }
    if (file.name.endsWith('.csv')) reader.readAsText(file, 'latin1')
    else reader.readAsBinaryString(file)
    e.target.value = ''
  }

  function togglePedido(num) {
    setSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num); else next.add(num)
      return next
    })
  }
  function seleccionarTodos() {
    setSeleccionados(new Set(filasFiltradas.map(r => String(r[colPed] || ''))))
  }
  function deseleccionarTodos() { setSeleccionados(new Set()) }

  function hacerConsolidar() {
    const result = consolidarPedidos()
    if (result) onNavigate('consolidado')
  }

  function limpiarFiltros() {
    setBusqueda(''); setFiltroProd('Todos'); setFiltroCli('Todos'); setFiltroEst('Todos')
  }

  const Select = ({ value, onChange, options, style }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        background: '#0F1117', border: '1px solid #1E2030', borderRadius: 8,
        padding: '8px 12px', color: value === 'Todos' ? '#5A5F7A' : '#E8EAF0',
        fontSize: 13, outline: 'none', cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif', ...style
      }}>
      {options.map(o => <option key={o} value={o}>{o.length > 40 ? o.slice(0, 40) + '…' : o}</option>)}
    </select>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

      {/* Toolbar */}
      <div style={{
        background: '#0F1117', border: '1px solid #1E2030',
        borderRadius: 12, padding: '14px 18px',
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <input type="file" ref={fileRef} onChange={onFile}
          accept=".csv,.xlsx,.xls" style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} className="btn-primary" disabled={cargando}>
          {cargando ? '⏳ Cargando…' : '📁 Importar CSV/Excel'}
        </button>
        <button onClick={hacerConsolidar} className="btn-primary"
          style={{ background: '#2DD4A0', color: '#000' }}
          disabled={!seleccionados.size}>
          🔄 Consolidar ({seleccionados.size})
        </button>
        <button onClick={seleccionarTodos}  className="btn-ghost">✅ Todos</button>
        <button onClick={deseleccionarTodos} className="btn-ghost">❌ Ninguno</button>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#5A5F7A' }}>
          {filasFiltradas.length} de {pedidos.length} registros
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        background: '#0F1117', border: '1px solid #1E2030',
        borderRadius: 12, padding: '12px 18px',
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <input
          placeholder="🔍 Buscar pedido, cliente, producto…"
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="input-dark" style={{ width: 280 }}
        />
        <Select value={filtroEst}  onChange={setFiltroEst}  options={['Todos', 'Abierta', 'Cerrada']} />
        <Select value={filtroProd} onChange={setFiltroProd} options={opcionesProds} style={{ maxWidth: 240 }} />
        <Select value={filtroCli}  onChange={setFiltroCli}  options={opcionesClis}  style={{ maxWidth: 200 }} />
        <button onClick={limpiarFiltros} className="btn-ghost" style={{ fontSize: 12 }}>
          ✕ Limpiar
        </button>
      </div>

      {/* Tabla */}
      <div style={{
        flex: 1, overflow: 'auto',
        background: '#0F1117', border: '1px solid #1E2030',
        borderRadius: 12,
      }}>
        {pedidos.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: 300, gap: 12, color: '#3A3F58'
          }}>
            <div style={{ fontSize: 40 }}>📂</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>
              Sin pedidos cargados
            </div>
            <div style={{ fontSize: 13 }}>Importá un archivo CSV o Excel para empezar</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2030', position: 'sticky', top: 0, background: '#0F1117' }}>
                {['', 'Pedido', 'Fecha', 'Cliente', 'Producto', 'Cant', 'Estado'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    color: '#5A5F7A', fontWeight: 600, fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filasFiltradas.map((row, i) => {
                const num = String(row[colPed] || i)
                const sel = seleccionados.has(num)
                return (
                  <tr key={i}
                    onClick={() => togglePedido(num)}
                    className="tabla-row"
                    style={{
                      borderBottom: '1px solid #141620',
                      cursor: 'pointer',
                      background: sel ? 'rgba(79,110,247,0.1)' : 'transparent',
                    }}>
                    <td style={{ padding: '9px 14px', width: 36 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `2px solid ${sel ? '#4F6EF7' : '#2E3050'}`,
                        background: sel ? '#4F6EF7' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: 'white', flexShrink: 0
                      }}>
                        {sel ? '✓' : ''}
                      </div>
                    </td>
                    <td style={{ padding: '9px 14px', color: '#4F6EF7', fontWeight: 600, whiteSpace: 'nowrap' }}>{num}</td>
                    <td style={{ padding: '9px 14px', color: '#5A5F7A', whiteSpace: 'nowrap' }}>
                      {String(row[colFech] || '').slice(0, 10)}
                    </td>
                    <td style={{ padding: '9px 14px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(row[colCli] || '')}
                    </td>
                    <td style={{ padding: '9px 14px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#C8CAD8' }}>
                      {String(row[colProd] || '')}
                    </td>
                    <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: 600 }}>
                      {row[colCant] || ''}
                    </td>
                    <td style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 8px',
                        borderRadius: 5,
                        background: String(row[colEst] || '').toLowerCase().includes('abierta')
                          ? 'rgba(45,212,160,0.15)' : 'rgba(90,95,122,0.2)',
                        color: String(row[colEst] || '').toLowerCase().includes('abierta')
                          ? '#2DD4A0' : '#5A5F7A',
                      }}>
                        {String(row[colEst] || '').slice(0, 12)}
                      </span>
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
