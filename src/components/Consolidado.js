'use client'
import { useApp } from '@/lib/store'

export default function Consolidado({ onNavigate }) {
  const { consolidado, seleccionados, consolidarPedidos, pedidos } = useApp()

  const totalUnidades = consolidado.reduce((s, r) => s + r.total, 0)

  function exportarCSV() {
    const headers = 'Producto,Cantidad,Desglose'
    const rows = consolidado.map(r =>
      `"${r.producto.replace(/"/g, '""')}",${r.total},"${r.desglose}"`
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `consolidado_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  function exportarPDF() {
    const win = window.open('', '_blank')
    const fecha = new Date().toLocaleDateString('es-AR')
    win.document.write(`
      <html><head><title>Consolidado</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #888; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #222; color: white; padding: 10px 14px; text-align: left; font-size: 13px; }
        td { padding: 9px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
        tr:nth-child(even) td { background: #f9f9f9; }
        .total-row td { font-weight: bold; background: #f0f0f0; font-size: 14px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>PEDIDO PARA LABORATORIO</h1>
      <p class="sub">${fecha} · ${seleccionados.size} pedidos · ${consolidado.length} productos · ${totalUnidades} unidades</p>
      <table>
        <tr><th>PRODUCTO</th><th style="width:100px;text-align:center">CANTIDAD</th></tr>
        ${consolidado.map(r => `<tr><td>${r.producto}</td><td style="text-align:center;font-weight:700">${r.total}</td></tr>`).join('')}
        <tr class="total-row"><td>TOTAL</td><td style="text-align:center">${totalUnidades}</td></tr>
      </table>
      <script>window.print()</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

      {/* Header con acciones */}
      <div style={{
        background: '#0F1117', border: '1px solid #1E2030',
        borderRadius: 12, padding: '14px 18px',
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap'
      }}>
        {pedidos.length > 0 && (
          <button onClick={() => { consolidarPedidos() }} className="btn-primary">
            🔄 Re-consolidar ({seleccionados.size} sel.)
          </button>
        )}
        {consolidado.length > 0 && (<>
          <button onClick={exportarCSV} className="btn-ghost">📥 Exportar CSV</button>
          <button onClick={exportarPDF} className="btn-ghost">📄 Imprimir / PDF</button>
        </>)}
        {consolidado.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#4F6EF7' }}>
                {consolidado.length}
              </div>
              <div style={{ fontSize: 11, color: '#5A5F7A' }}>Productos</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#2DD4A0' }}>
                {totalUnidades}
              </div>
              <div style={{ fontSize: 11, color: '#5A5F7A' }}>Unidades</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div style={{
        flex: 1, overflow: 'auto',
        background: '#0F1117', border: '1px solid #1E2030',
        borderRadius: 12,
      }}>
        {consolidado.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: 300, gap: 12, color: '#3A3F58'
          }}>
            <div style={{ fontSize: 40 }}>⊞</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>Sin consolidado</div>
            <div style={{ fontSize: 13 }}>
              {pedidos.length === 0
                ? 'Primero importá pedidos'
                : 'Seleccioná pedidos y hacé clic en Consolidar'}
            </div>
            {pedidos.length > 0 && (
              <button onClick={() => onNavigate('pedidos')} className="btn-primary" style={{ marginTop: 8 }}>
                Ir a Pedidos →
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2030', position: 'sticky', top: 0, background: '#0F1117' }}>
                <th style={{ padding: '10px 18px', textAlign: 'left', color: '#5A5F7A', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Producto
                </th>
                <th style={{ padding: '10px 18px', textAlign: 'center', color: '#5A5F7A', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', width: 120 }}>
                  Cantidad
                </th>
                <th style={{ padding: '10px 18px', textAlign: 'left', color: '#5A5F7A', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Desglose
                </th>
              </tr>
            </thead>
            <tbody>
              {consolidado.map((row, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid #141620',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                }}>
                  <td style={{ padding: '11px 18px', color: '#C8CAD8', maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.producto}
                  </td>
                  <td style={{ padding: '11px 18px', textAlign: 'center' }}>
                    <span style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18,
                      color: row.total >= 10 ? '#F5A623' : row.total >= 5 ? '#4F6EF7' : '#2DD4A0'
                    }}>{row.total}</span>
                  </td>
                  <td style={{ padding: '11px 18px', color: '#3A3F58', fontSize: 12 }}>
                    {row.desglose}
                  </td>
                </tr>
              ))}
              {/* Total */}
              <tr style={{ borderTop: '2px solid #1E2030', background: '#141620' }}>
                <td style={{ padding: '12px 18px', fontWeight: 700, color: '#E8EAF0', fontFamily: 'Syne, sans-serif' }}>
                  TOTAL
                </td>
                <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#4F6EF7' }}>
                    {totalUnidades}
                  </span>
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
