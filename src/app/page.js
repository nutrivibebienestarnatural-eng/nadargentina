'use client'
import { useState } from 'react'
import { AppProvider, useApp } from '@/lib/store'
import Dashboard from '@/components/Dashboard'
import Pedidos from '@/components/Pedidos'
import Consolidado from '@/components/Consolidado'
import Envios from '@/components/Envios'
import EditorKits from '@/components/EditorKits'

const TABS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: '◈' },
  { id: 'pedidos',     label: 'Pedidos',       icon: '▦' },
  { id: 'consolidado', label: 'Consolidado',   icon: '⊞' },
  { id: 'envios',      label: 'Envíos',        icon: '⬡' },
  { id: 'kits',        label: 'Editor Kits',   icon: '⊛' },
]

function Shell() {
  const [tab, setTab] = useState('dashboard')
  const { toast, pedidos, seleccionados, consolidado } = useApp()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#08090D' }}>

      {/* Toast global */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.tipo === 'err' ? '#F05A5A' : toast.tipo === 'warn' ? '#F5A623' : '#2DD4A0',
          color: '#000', padding: '11px 20px', borderRadius: 10,
          fontWeight: 700, fontSize: 13,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'fadeUp 0.25s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: 220, background: '#0A0B10',
        borderRight: '1px solid #1E2030',
        display: 'flex', flexDirection: 'column',
        padding: '0',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid #1E2030',
        }}>
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800, fontSize: 17,
            color: '#E8EAF0', letterSpacing: '-0.5px',
            lineHeight: 1.2
          }}>
            GESTOR<br />
            <span style={{ color: '#4F6EF7' }}>TIENDA NUBE</span>
          </div>
          <div style={{ fontSize: 11, color: '#3A3F58', marginTop: 4, fontWeight: 600 }}>
            PRO V5
          </div>
        </div>

        {/* Stats rápidos */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1E2030' }}>
          {[
            { label: 'Pedidos', val: pedidos.length > 0 ? [...new Set(pedidos.map(p => {
                const k = Object.keys(p).find(c => c.toLowerCase().includes('número') || c.toLowerCase().includes('pedido'))
                return k ? p[k] : ''
              }))].length : 0 },
            { label: 'Seleccionados', val: seleccionados.size },
            { label: 'Consolidados', val: consolidado.length },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 6
            }}>
              <span style={{ fontSize: 12, color: '#5A5F7A' }}>{s.label}</span>
              <span style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700, fontSize: 14,
                color: s.val > 0 ? '#4F6EF7' : '#3A3F58'
              }}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px' }}>
          {TABS.map(t => {
            const activo = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 10, padding: '10px 12px',
                background: activo ? 'rgba(79,110,247,0.12)' : 'transparent',
                border: 'none',
                borderRadius: 8,
                color: activo ? '#4F6EF7' : '#5A5F7A',
                fontWeight: activo ? 600 : 400,
                fontSize: 14, cursor: 'pointer',
                marginBottom: 2,
                textAlign: 'left',
                transition: 'all 0.15s',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                <span style={{
                  fontSize: 16,
                  opacity: activo ? 1 : 0.6
                }}>{t.icon}</span>
                {t.label}
                {activo && (
                  <div style={{
                    marginLeft: 'auto', width: 4, height: 4,
                    borderRadius: '50%', background: '#4F6EF7'
                  }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #1E2030' }}>
          <div style={{ fontSize: 11, color: '#2E3250' }}>
            NAD Argentina © 2025
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{
        flex: 1, overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 28px',
          borderBottom: '1px solid #1E2030',
          display: 'flex', alignItems: 'center',
          background: '#08090D',
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700, fontSize: 20,
              margin: 0, color: '#E8EAF0',
              letterSpacing: '-0.3px'
            }}>
              {TABS.find(t => t.id === tab)?.label}
            </h1>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
          {tab === 'dashboard'   && <Dashboard   onNavigate={setTab} />}
          {tab === 'pedidos'     && <Pedidos     onNavigate={setTab} />}
          {tab === 'consolidado' && <Consolidado onNavigate={setTab} />}
          {tab === 'envios'      && <Envios />}
          {tab === 'kits'        && <EditorKits />}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
