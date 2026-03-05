'use client'
import { useApp } from '@/lib/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function KPI({ label, value, color, sub }) {
  return (
    <div style={{
      background: '#0F1117', border: '1px solid #1E2030',
      borderRadius: 14, padding: '22px 24px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 12, color: '#5A5F7A', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: 36, fontWeight: 800,
        color: color, lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#3A4060', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard({ onNavigate }) {
  const { pedidos, seleccionados, consolidado, duplicadosEvitados, seguimientos, findCol } = useApp()

  const colProd = pedidos.length ? findCol(pedidos[0], ['nombre del producto', 'producto']) : null
  const colCant = pedidos.length ? findCol(pedidos[0], ['cantidad del producto', 'cantidad']) : null
  const colPed  = pedidos.length ? findCol(pedidos[0], ['número de orden', 'número', 'pedido']) : null
  const colCli  = pedidos.length ? findCol(pedidos[0], ['nombre del comprador', 'cliente']) : null

  const nPedidos  = colPed ? new Set(pedidos.map(r => r[colPed])).size : 0
  const nUnidades = colCant ? pedidos.reduce((s, r) => s + (parseInt(r[colCant]) || 0), 0) : 0
  const nClientes = colCli ? new Set(pedidos.map(r => r[colCli])).size : 0
  const nEnviados = Object.values(seguimientos).filter(v => v && v !== 'EN PROCESO').length

  // Top productos para gráfico
  const topProds = (() => {
    if (!colProd || !colCant) return []
    const mapa = {}
    pedidos.forEach(r => {
      const p = String(r[colProd] || '').trim()
      const c = parseInt(r[colCant]) || 0
      const short = p.length > 35 ? p.slice(0, 35) + '…' : p
      mapa[short] = (mapa[short] || 0) + c
    })
    return Object.entries(mapa)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, val]) => ({ name, val }))
  })()

  const COLORS = ['#4F6EF7','#2DD4A0','#F5A623','#F05A5A','#A78BFA','#34D399','#FB923C','#60A5FA']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPI label="Pedidos únicos"      value={nPedidos}           color="#4F6EF7" sub={`${pedidos.length} filas totales`} />
        <KPI label="Unidades totales"    value={nUnidades}          color="#2DD4A0" />
        <KPI label="Clientes"            value={nClientes}          color="#F5A623" />
        <KPI label="Duplicados evitados" value={duplicadosEvitados} color="#F05A5A" sub="al importar" />
      </div>

      {/* Fila 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Gráfico */}
        <div style={{ background: '#0F1117', border: '1px solid #1E2030', borderRadius: 14, padding: '20px 24px' }}>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: 15, marginBottom: 20, color: '#E8EAF0'
          }}>
            Top productos
          </div>
          {topProds.length === 0 ? (
            <div style={{ color: '#3A3F58', textAlign: 'center', paddingTop: 40, fontSize: 13 }}>
              Importá pedidos para ver el gráfico
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProds} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={200}
                  tick={{ fill: '#5A5F7A', fontSize: 11, fontFamily: 'DM Sans' }} />
                <Tooltip
                  contentStyle={{ background: '#141620', border: '1px solid #1E2030', borderRadius: 8, color: '#E8EAF0' }}
                  cursor={{ fill: 'rgba(79,110,247,0.08)' }}
                />
                <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                  {topProds.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Estado del sistema */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Accesos rápidos */}
          <div style={{ background: '#0F1117', border: '1px solid #1E2030', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#E8EAF0' }}>
              Acciones rápidas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '📁 Importar pedidos',      tab: 'pedidos',     color: '#4F6EF7' },
                { label: '🔄 Consolidar selección',   tab: 'consolidado', color: '#2DD4A0' },
                { label: '🚚 Ver envíos',             tab: 'envios',      color: '#F5A623' },
                { label: '📦 Editar kits',            tab: 'kits',        color: '#A78BFA' },
              ].map(a => (
                <button key={a.tab} onClick={() => onNavigate(a.tab)} style={{
                  background: 'transparent',
                  border: `1px solid #1E2030`,
                  borderLeft: `3px solid ${a.color}`,
                  borderRadius: 8, padding: '10px 14px',
                  color: '#C8CAD8', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estado envíos */}
          <div style={{ background: '#0F1117', border: '1px solid #1E2030', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#E8EAF0' }}>
              Estado envíos
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#2DD4A0' }}>{nEnviados}</div>
                <div style={{ fontSize: 12, color: '#5A5F7A', marginTop: 4 }}>Con seguimiento</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#F5A623' }}>
                  {Math.max(0, nPedidos - nEnviados)}
                </div>
                <div style={{ fontSize: 12, color: '#5A5F7A', marginTop: 4 }}>Pendientes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
