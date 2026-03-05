'use client'
import { useState } from 'react'
import { useApp } from '@/lib/store'

const COLORES = {
  'VELLE NMN': '#6C63FF', 'Resveratrol': '#F05A5A',
  'ELIXIR': '#2DD4A0',    'AKG': '#F5A623',
  'Astaxantina': '#EC4899','NMN 500': '#4F6EF7',
}
function colorProd(nombre) {
  for (const [k, v] of Object.entries(COLORES)) {
    if (nombre.includes(k)) return v
  }
  return '#5A5F7A'
}
function corto(nombre) {
  if (nombre.includes('VELLE NMN®')) return 'VELLE NMN®'
  if (nombre.includes('Resveratrol')) return 'Resveratrol PREMIUM'
  if (nombre.includes('ELIXIR')) return 'ELIXIR'
  if (nombre.includes('AKG')) return 'AKG'
  if (nombre.includes('Astaxantina')) return 'Astaxantina 12mg'
  if (nombre.includes('NMN 500mg')) return 'NMN 500mg'
  return nombre.slice(0, 32) + (nombre.length > 32 ? '…' : '')
}

export default function EditorKits() {
  const { kits, setKits, showToast } = useApp()
  const [selKit,      setSelKit]      = useState(null)
  const [editando,    setEditando]    = useState(false)
  const [modoNuevo,   setModoNuevo]   = useState(false)
  const [nombreKit,   setNombreKit]   = useState('')
  const [comps,       setComps]       = useState({})
  const [newProd,     setNewProd]     = useState('')
  const [newCant,     setNewCant]     = useState(1)
  const [busqueda,    setBusqueda]    = useState('')

  function abrirKit(nombre) {
    setSelKit(nombre); setNombreKit(nombre)
    setComps({ ...kits[nombre].componentes })
    setEditando(false); setModoNuevo(false)
  }

  function nuevoKit() {
    setSelKit(null); setNombreKit(''); setComps({})
    setEditando(true); setModoNuevo(true)
  }

  function guardar() {
    if (!nombreKit.trim()) { showToast('El kit necesita un nombre', 'err'); return }
    if (!Object.keys(comps).length) { showToast('Agregá al menos un producto', 'err'); return }
    const nuevos = { ...kits }
    if (!modoNuevo && selKit && selKit !== nombreKit) delete nuevos[selKit]
    nuevos[nombreKit] = { componentes: { ...comps } }
    setKits(nuevos); setSelKit(nombreKit)
    setEditando(false); setModoNuevo(false)
    showToast('✅ Kit guardado')
  }

  function eliminar(nombre) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return
    const nuevos = { ...kits }; delete nuevos[nombre]
    setKits(nuevos); setSelKit(null)
    showToast('Kit eliminado', 'warn')
  }

  function setCant(prod, n) {
    const v = parseInt(n); if (isNaN(v) || v < 1) return
    setComps(p => ({ ...p, [prod]: v }))
  }

  function agregarComp() {
    if (!newProd.trim()) { showToast('Escribí el nombre del producto', 'err'); return }
    setComps(p => ({ ...p, [newProd.trim()]: newCant }))
    setNewProd(''); setNewCant(1)
  }

  function exportarJSON() {
    const blob = new Blob([JSON.stringify(kits, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'kits_configuracion_editado.json'
    a.click()
    showToast('📥 JSON descargado')
  }

  function importarJSON(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        setKits(data); showToast('✅ Kits importados desde JSON')
      } catch { showToast('Error al leer el JSON', 'err') }
    }
    reader.readAsText(file); e.target.value = ''
  }

  const kitsFiltrados = Object.keys(kits).filter(k =>
    k.toLowerCase().includes(busqueda.toLowerCase()))

  const totalComps = selKit
    ? Object.values(kits[selKit]?.componentes || {}).reduce((a, b) => a + b, 0) : 0

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 130px)', gap: 0, overflow: 'hidden' }}>

      {/* Lista de kits */}
      <div style={{
        width: 260, background: '#0A0B10',
        border: '1px solid #1E2030', borderRadius: '12px 0 0 12px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
      }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #1E2030', display: 'flex', gap: 8 }}>
          <input placeholder="🔍 Buscar…" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input-dark" style={{ flex: 1, fontSize: 12 }} />
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {kitsFiltrados.map(nombre => {
            const act = selKit === nombre && !modoNuevo
            return (
              <div key={nombre} onClick={() => abrirKit(nombre)} style={{
                padding: '11px 14px', cursor: 'pointer',
                borderBottom: '1px solid #141620',
                borderLeft: `3px solid ${act ? '#4F6EF7' : 'transparent'}`,
                background: act ? 'rgba(79,110,247,0.1)' : 'transparent',
                transition: 'all 0.12s',
              }}>
                <div style={{ fontSize: 12, fontWeight: act ? 600 : 400, color: act ? '#C4BDFF' : '#8A8FA8', lineHeight: 1.3 }}>
                  {nombre}
                </div>
                <div style={{ fontSize: 11, color: '#3A3F58', marginTop: 3 }}>
                  {Object.keys(kits[nombre].componentes).length} productos
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid #1E2030', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={nuevoKit} className="btn-primary" style={{ width: '100%', fontSize: 12 }}>
            + Nuevo Kit
          </button>
          <button onClick={exportarJSON} className="btn-ghost" style={{ width: '100%', fontSize: 12 }}>
            📥 Exportar JSON
          </button>
          <label style={{
            display: 'block', textAlign: 'center', padding: '8px 0',
            border: '1px solid #1E2030', borderRadius: 8, cursor: 'pointer',
            fontSize: 12, color: '#5A5F7A', fontFamily: 'DM Sans, sans-serif'
          }}>
            📤 Importar JSON
            <input type="file" accept=".json" onChange={importarJSON} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{
        flex: 1, overflow: 'auto',
        background: '#0F1117', border: '1px solid #1E2030',
        borderLeft: 'none', borderRadius: '0 12px 12px 0',
        padding: 24
      }}>

        {!selKit && !modoNuevo && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 12, color: '#3A3F58' }}>
            <div style={{ fontSize: 44 }}>⊛</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>Seleccioná un kit</div>
            <div style={{ fontSize: 13 }}>o creá uno nuevo desde la lista</div>
          </div>
        )}

        {/* VISTA */}
        {selKit && !editando && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, margin: 0, color: '#E8EAF0' }}>
                  {selKit}
                </h2>
                <div style={{ color: '#5A5F7A', fontSize: 12, marginTop: 4 }}>
                  {Object.keys(kits[selKit]?.componentes || {}).length} productos · {totalComps} unidades
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditando(true)} className="btn-primary" style={{ fontSize: 12 }}>✏️ Editar</button>
                <button onClick={() => eliminar(selKit)} className="btn-ghost"
                  style={{ color: '#F05A5A', borderColor: '#F05A5A33', fontSize: 12 }}>🗑</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(kits[selKit]?.componentes || {}).map(([prod, cant]) => (
                <div key={prod} style={{
                  background: '#141620', border: '1px solid #1E2030',
                  borderLeft: `4px solid ${colorProd(prod)}`,
                  borderRadius: 10, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: colorProd(prod) }}>{corto(prod)}</div>
                    <div style={{ fontSize: 11, color: '#3A3F58', marginTop: 3, maxWidth: 440 }}>{prod}</div>
                  </div>
                  <div style={{
                    background: colorProd(prod) + '22', border: `1px solid ${colorProd(prod)}44`,
                    borderRadius: 8, padding: '6px 18px',
                    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22,
                    color: colorProd(prod), minWidth: 56, textAlign: 'center'
                  }}>{cant}u</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDICIÓN */}
        {editando && (
          <div style={{ maxWidth: 680 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, margin: '0 0 20px 0', color: '#E8EAF0' }}>
              {modoNuevo ? '+ Nuevo Kit' : `Editando: ${selKit}`}
            </h2>

            {/* Nombre */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: '#5A5F7A', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre del Kit</div>
              <input value={nombreKit} onChange={e => setNombreKit(e.target.value)}
                placeholder="Ej: Resveratrol y Velle NMN"
                className="input-dark" style={{ width: '100%', fontSize: 15, fontWeight: 600 }} />
            </div>

            {/* Componentes */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#5A5F7A', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Componentes ({Object.keys(comps).length})
              </div>
              {Object.keys(comps).length === 0 && (
                <div style={{ background: '#141620', border: '1px dashed #2E3050', borderRadius: 8, padding: 16, textAlign: 'center', color: '#3A3F58', fontSize: 13 }}>
                  Sin componentes — agregá uno abajo
                </div>
              )}
              {Object.entries(comps).map(([prod, cant]) => (
                <div key={prod} style={{
                  background: '#141620', border: '1px solid #1E2030',
                  borderLeft: `4px solid ${colorProd(prod)}`,
                  borderRadius: 10, padding: '11px 14px',
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: colorProd(prod) }}>{corto(prod)}</div>
                    <div style={{ fontSize: 11, color: '#3A3F58', marginTop: 2 }}>{prod}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => setCant(prod, cant - 1)} disabled={cant <= 1} style={{
                      width: 28, height: 28, borderRadius: 6, background: '#1E2030', border: 'none',
                      color: cant <= 1 ? '#2E3050' : '#8A8FA8', cursor: cant <= 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 700, fontSize: 16
                    }}>−</button>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, minWidth: 30, textAlign: 'center', color: colorProd(prod) }}>
                      {cant}
                    </span>
                    <button onClick={() => setCant(prod, cant + 1)} style={{
                      width: 28, height: 28, borderRadius: 6, background: '#1E2030', border: 'none',
                      color: '#8A8FA8', cursor: 'pointer', fontWeight: 700, fontSize: 16
                    }}>+</button>
                  </div>
                  <button onClick={() => { const n = { ...comps }; delete n[prod]; setComps(n) }} style={{
                    background: 'transparent', border: 'none', color: '#F05A5A',
                    cursor: 'pointer', fontSize: 16, padding: '4px 6px'
                  }}>✕</button>
                </div>
              ))}
            </div>

            {/* Agregar producto */}
            <div style={{ background: '#141620', border: '1px dashed #2E3050', borderRadius: 10, padding: 16, marginBottom: 22 }}>
              <div style={{ fontSize: 11, color: '#5A5F7A', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Agregar Producto
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input placeholder="Nombre completo del producto"
                  value={newProd} onChange={e => setNewProd(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && agregarComp()}
                  className="input-dark" style={{ flex: 1, minWidth: 200 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => setNewCant(Math.max(1, newCant - 1))} style={{
                    width: 30, height: 36, borderRadius: 6, background: '#1E2030', border: 'none', color: '#8A8FA8', cursor: 'pointer', fontWeight: 700
                  }}>−</button>
                  <span style={{ fontWeight: 700, minWidth: 26, textAlign: 'center', color: '#E8EAF0' }}>{newCant}</span>
                  <button onClick={() => setNewCant(newCant + 1)} style={{
                    width: 30, height: 36, borderRadius: 6, background: '#1E2030', border: 'none', color: '#8A8FA8', cursor: 'pointer', fontWeight: 700
                  }}>+</button>
                </div>
                <button onClick={agregarComp} className="btn-primary">Agregar</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={guardar} className="btn-primary"
                style={{ background: '#2DD4A0', color: '#000' }}>
                💾 Guardar Kit
              </button>
              <button onClick={() => { setEditando(false); setModoNuevo(false) }} className="btn-ghost">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
