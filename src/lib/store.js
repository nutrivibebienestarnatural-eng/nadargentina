'use client'
import { createContext, useContext, useState, useCallback } from 'react'

const KITS_DEFAULT = {
  "VELLE NMN® Premium Anti-Age Kit 3x2": { componentes: { "VELLE NMN® Premium Anti-Age | Precursor NAD+ y Colágeno | Rejuvenecimiento, Energía, Piel y Articulaciones (Polvo Puro) - NAD Argentina": 3 } },
  "Kit Regenerar Integral": { componentes: { "VELLE NMN® Premium Anti-Age | Precursor NAD+ y Colágeno | Rejuvenecimiento, Energía, Piel y Articulaciones (Polvo Puro) - NAD Argentina": 3, "ELIXIR | Regenerador Bio Metabolico optimizador de la salud": 3, "Resveratrol PREMIUM - Antioxidante": 3 } },
  "KIT Velle NMN": { componentes: { "VELLE NMN® Premium Anti-Age | Precursor NAD+ y Colágeno | Rejuvenecimiento, Energía, Piel y Articulaciones (Polvo Puro) - NAD Argentina": 1, "Resveratrol PREMIUM - Antioxidante": 1, "ELIXIR | Regenerador Bio Metabolico optimizador de la salud": 1 } },
  "Resveratrol y Velle NMN": { componentes: { "Resveratrol PREMIUM - Antioxidante": 1, "VELLE NMN® Premium Anti-Age | Precursor NAD+ y Colágeno | Rejuvenecimiento, Energía, Piel y Articulaciones (Polvo Puro) - NAD Argentina": 1 } },
  "ELIXIR KIT x3 UNIDADES": { componentes: { "ELIXIR | Regenerador Bio Metabolico optimizador de la salud": 3 } },
  "KIT ANUAL ANTI-EDAD": { componentes: { "VELLE NMN® Premium Anti-Age | Precursor NAD+ y Colágeno | Rejuvenecimiento, Energía, Piel y Articulaciones (Polvo Puro) - NAD Argentina": 6, "Resveratrol PREMIUM - Antioxidante": 6, "AKG (Alfa-Cetoglutarato) | Energía + Rendimiento fisico+ Recuperación de Músculo + Antienvejecimiento": 6, "Astaxantina 12mg | Antioxidante": 6 } },
  "Resveratrol y Velle NMN KIT x2": { componentes: { "Resveratrol PREMIUM - Antioxidante": 2, "VELLE NMN® Premium Anti-Age | Precursor NAD+ y Colágeno | Rejuvenecimiento, Energía, Piel y Articulaciones (Polvo Puro) - NAD Argentina": 2 } },
  "KIT ANTI-EDAD": { componentes: { "VELLE NMN® Premium Anti-Age | Precursor NAD+ y Colágeno | Rejuvenecimiento, Energía, Piel y Articulaciones (Polvo Puro) - NAD Argentina": 1, "Resveratrol PREMIUM - Antioxidante": 1, "Astaxantina 12mg | Antioxidante": 1, "AKG (Alfa-Cetoglutarato) | Energía + Rendimiento fisico+ Recuperación de Músculo + Antienvejecimiento": 1 } },
  "AKG KIT x3": { componentes: { "AKG (Alfa-Cetoglutarato) | Energía + Rendimiento fisico+ Recuperación de Músculo + Antienvejecimiento": 3 } },
  "Astaxantina 12mg KIT 3X2": { componentes: { "Astaxantina 12mg | Antioxidante": 3 } },
  "Resveratrol PREMIUM KITx3": { componentes: { "Resveratrol PREMIUM - Antioxidante": 3 } },
  "NMN 500mg KIT 3x2": { componentes: { "NMN 500mg (Nicotinamida Mononucléotido) | Senolitico Rejuvenecedor - NAD Argentina": 3 } },
  "KIT ANUAL BOOST": { componentes: { "VELLE NMN® Premium Anti-Age | Precursor NAD+ y Colágeno | Rejuvenecimiento, Energía, Piel y Articulaciones (Polvo Puro) - NAD Argentina": 12, "Resveratrol PREMIUM - Antioxidante": 12, "AKG (Alfa-Cetoglutarato) | Energía + Rendimiento fisico+ Recuperación de Músculo + Antienvejecimiento": 12, "Astaxantina 12mg | Antioxidante": 12 } }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [pedidos, setPedidos] = useState([])          // array de filas del CSV
  const [seleccionados, setSeleccionados] = useState(new Set())
  const [consolidado, setConsolidado] = useState([])
  const [seguimientos, setSeguimientos] = useState({}) // { numPedido: codigo }
  const [kits, setKits] = useState(KITS_DEFAULT)
  const [duplicadosEvitados, setDuplicadosEvitados] = useState(0)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, tipo = 'ok') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 2800)
  }, [])

  // Detectar columna por nombres posibles
  const findCol = useCallback((row, names) => {
    if (!row) return null
    const keys = Object.keys(row)
    for (const name of names) {
      const found = keys.find(k => k.toLowerCase().includes(name.toLowerCase()))
      if (found) return found
    }
    return null
  }, [])

  // Importar pedidos sin duplicados
  const importarPedidos = useCallback((rows) => {
    if (!rows.length) return { nuevos: 0, duplicados: 0 }
    const colPedido = findCol(rows[0], ['número de orden', 'número', 'numero', 'pedido'])
    if (!colPedido) { showToast('No se encontró columna de número de pedido', 'err'); return }

    const idsActuales = new Set(pedidos.map(r => String(r[colPedido] || '').trim()))
    const nuevos = rows.filter(r => !idsActuales.has(String(r[colPedido] || '').trim()))
    const nDup = rows.length - nuevos.length

    setPedidos(prev => [...prev, ...nuevos])
    setDuplicadosEvitados(prev => prev + nDup)
    showToast(`✅ ${nuevos.length} pedidos importados · ${nDup} duplicados ignorados`)
    return { nuevos: nuevos.length, duplicados: nDup }
  }, [pedidos, findCol, showToast])

  // Consolidar pedidos seleccionados
  const consolidarPedidos = useCallback(() => {
    if (!seleccionados.size) { showToast('Seleccioná pedidos primero', 'warn'); return }
    const colPedido  = findCol(pedidos[0], ['número de orden', 'número', 'pedido'])
    const colProd    = findCol(pedidos[0], ['nombre del producto', 'producto'])
    const colCant    = findCol(pedidos[0], ['cantidad del producto', 'cantidad'])
    if (!colPedido || !colProd || !colCant) { showToast('Columnas no encontradas', 'err'); return }

    const filtrados = pedidos.filter(r => seleccionados.has(String(r[colPedido] || '').trim()))
    const mapa = {}

    filtrados.forEach(row => {
      const prod = String(row[colProd] || '').trim()
      const cant = parseInt(row[colCant]) || 0
      let esKit = false

      for (const [kitNombre, kitDef] of Object.entries(kits)) {
        if (prod.toLowerCase().includes(kitNombre.toLowerCase())) {
          const comps = kitDef.componentes || {}
          Object.entries(comps).forEach(([comp, compCant]) => {
            if (!mapa[comp]) mapa[comp] = { total: 0, desglose: [] }
            mapa[comp].total += cant * compCant
            mapa[comp].desglose.push(`${cant * compCant} de kit`)
          })
          esKit = true
          break
        }
      }
      if (!esKit) {
        if (!mapa[prod]) mapa[prod] = { total: 0, desglose: [] }
        mapa[prod].total += cant
        mapa[prod].desglose.push(`${cant}`)
      }
    })

    const result = Object.entries(mapa)
      .map(([prod, info]) => ({ producto: prod, total: info.total, desglose: info.desglose.join(' + ') }))
      .sort((a, b) => b.total - a.total)

    setConsolidado(result)
    showToast(`✅ Consolidado: ${result.length} productos`)
    return result
  }, [pedidos, seleccionados, kits, findCol, showToast])

  // Importar seguimientos desde CSV (solo con código)
  const importarSeguimientos = useCallback((rows, colPedido, colCodigo) => {
    let nuevos = 0, actualizados = 0, sinCod = 0
    const nuevosSeg = { ...seguimientos }
    rows.forEach(row => {
      const num = String(row[colPedido] || '').trim()
      const cod = String(row[colCodigo] || '').trim()
      const vacío = !cod || ['nan','none','nat','-',''].includes(cod.toLowerCase())
      if (vacío) { sinCod++; return }
      if (nuevosSeg[num]) actualizados++; else nuevos++
      nuevosSeg[num] = cod
    })
    setSeguimientos(nuevosSeg)
    showToast(`✅ ${nuevos} nuevos · ${actualizados} actualizados · ${sinCod} sin código ignorados`)
  }, [seguimientos, showToast])

  return (
    <AppContext.Provider value={{
      pedidos, setPedidos,
      seleccionados, setSeleccionados,
      consolidado, setConsolidado,
      seguimientos, setSeguimientos,
      kits, setKits,
      duplicadosEvitados,
      toast,
      showToast,
      findCol,
      importarPedidos,
      consolidarPedidos,
      importarSeguimientos,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
