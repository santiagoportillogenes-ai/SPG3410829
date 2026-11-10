import {
  FactVentaItem,
  DimRegionItem,
  DimClienteItem,
  InventarioItem,
  ParametrosFinancieros,
  CalculatedKPIs,
  RegionSummary,
  ClienteSummary,
  MesSummary,
  ServicioSummary,
} from '../types';

const NOMBRES_MESES: Record<number, string> = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
};

export function recalculateFactVentaItem(item: Partial<FactVentaItem>): FactVentaItem {
  const cantidad = Number(item.Cantidad) || 0;
  const precioUnitario = Number(item.PrecioUnitario) || 0;
  const descuentoPct = item.DescuentoPct !== null && item.DescuentoPct !== undefined && !isNaN(Number(item.DescuentoPct))
    ? Number(item.DescuentoPct)
    : null;

  const bruto = Math.round(cantidad * precioUnitario);
  const factorDescuento = descuentoPct !== null ? (1 - descuentoPct) : 1;
  const importe = Math.round(cantidad * precioUnitario * factorDescuento);
  const precioNeto = cantidad > 0 ? Math.round(importe / cantidad) : 0;

  // Extract month from Fecha if not set
  let mes = item.Mes || 1;
  if (item.Fecha) {
    const parts = item.Fecha.split('-');
    if (parts.length >= 2) {
      mes = parseInt(parts[1], 10) || 1;
    }
  }

  // Cost estimate (for COGS) if missing
  const costoUnitario = item.CostoUnitario !== undefined
    ? Number(item.CostoUnitario)
    : Math.round(precioUnitario * 0.55);

  return {
    PedidoID: String(item.PedidoID || 'P000'),
    Fecha: String(item.Fecha || new Date().toISOString().split('T')[0]),
    Región: String(item.Región || 'Costa'),
    Servicio: String(item.Servicio || 'Transporte'),
    ClienteID: String(item.ClienteID || 'C01'),
    Cantidad: cantidad,
    PrecioUnitario: precioUnitario,
    DescuentoPct: descuentoPct,
    Importe: importe,
    PrecioNeto: precioNeto,
    Bruto: bruto,
    Mes: mes,
    CostoUnitario: costoUnitario,
  };
}

export function calculateAllKPIs(
  ventas: FactVentaItem[],
  regiones: DimRegionItem[],
  clientes: DimClienteItem[],
  inventario: InventarioItem[],
  parametros: ParametrosFinancieros
): CalculatedKPIs {
  // 1. Basic sales metrics
  const totalLineas = ventas.length;
  let ventasTotales = 0;
  let ventasBrutas = 0;
  let totalCantidad = 0;
  let sumaDescuentos = 0;
  let descuentosRegistradosCount = 0;
  let descuentosVacios = 0;
  let cmvTotalCalculado = 0;

  const pedidosSet = new Set<string>();
  const clientesSet = new Set<string>();

  ventas.forEach((v) => {
    ventasTotales += v.Importe;
    ventasBrutas += v.Bruto;
    totalCantidad += v.Cantidad;
    pedidosSet.add(v.PedidoID);
    clientesSet.add(v.ClienteID);

    if (v.DescuentoPct === null || v.DescuentoPct === undefined) {
      descuentosVacios++;
    } else {
      descuentosRegistradosCount++;
      sumaDescuentos += v.DescuentoPct;
    }

    const costoUni = v.CostoUnitario || Math.round(v.PrecioUnitario * 0.55);
    cmvTotalCalculado += v.Cantidad * costoUni;
  });

  const totalPedidos = pedidosSet.size;
  const totalClientes = clientesSet.size;
  const descuentosTotales = Math.max(0, ventasBrutas - ventasTotales);
  const descuentoEfectivoPct = ventasBrutas > 0 ? descuentosTotales / ventasBrutas : 0;
  const ticketPromedio = totalPedidos > 0 ? Math.round(ventasTotales / totalPedidos) : 0;
  const precioNetoPromedioPorUnidad = totalCantidad > 0 ? ventasTotales / totalCantidad : 0;
  const cantidadPromedioPorLinea = totalLineas > 0 ? totalCantidad / totalLineas : 0;
  const descuentoPromedioRegistrado = descuentosRegistradosCount > 0 ? sumaDescuentos / descuentosRegistradosCount : 0;

  // 2. Metas & Cumplimiento
  const metaTotal = regiones.reduce((acc, r) => acc + (r.MetaSemestral || 0), 0);
  const cumplimientoTotal = metaTotal > 0 ? ventasTotales / metaTotal : 0;

  // 3. Regiones
  const metaMap = new Map<string, { depto: string; meta: number }>();
  regiones.forEach((r) => metaMap.set(r.Región, { depto: r.Departamento, meta: r.MetaSemestral }));

  const regionSalesMap = new Map<string, { ventas: number; bruto: number; pedidos: Set<string> }>();
  // Initialize with all declared regions
  regiones.forEach((r) => {
    regionSalesMap.set(r.Región, { ventas: 0, bruto: 0, pedidos: new Set() });
  });

  ventas.forEach((v) => {
    const reg = regionSalesMap.get(v.Región) || { ventas: 0, bruto: 0, pedidos: new Set() };
    reg.ventas += v.Importe;
    reg.bruto += v.Bruto;
    reg.pedidos.add(v.PedidoID);
    regionSalesMap.set(v.Región, reg);
  });

  const porRegion: RegionSummary[] = Array.from(regionSalesMap.entries()).map(([region, data]) => {
    const metaInfo = metaMap.get(region) || { depto: 'N/A', meta: 0 };
    const numPedidos = data.pedidos.size;
    const ticketProm = numPedidos > 0 ? Math.round(data.ventas / numPedidos) : 0;
    const cumplimiento = metaInfo.meta > 0 ? data.ventas / metaInfo.meta : 0;
    const participacion = ventasTotales > 0 ? data.ventas / ventasTotales : 0;

    return {
      region,
      departamento: metaInfo.depto,
      ventas: data.ventas,
      bruto: data.bruto,
      pedidos: numPedidos,
      ticketPromedio: ticketProm,
      meta: metaInfo.meta,
      cumplimiento,
      participacion,
    };
  }).sort((a, b) => b.ventas - a.ventas);

  // 4. Clientes & Ranking
  const clienteNames = new Map<string, { nombre: string; region: string }>();
  clientes.forEach((c) => clienteNames.set(c.ClienteID, { nombre: c.NombreCliente, region: c.Región }));

  const clientSalesMap = new Map<string, { ventas: number; pedidos: Set<string> }>();
  clientes.forEach((c) => clientSalesMap.set(c.ClienteID, { ventas: 0, pedidos: new Set() }));

  ventas.forEach((v) => {
    const cData = clientSalesMap.get(v.ClienteID) || { ventas: 0, pedidos: new Set() };
    cData.ventas += v.Importe;
    cData.pedidos.add(v.PedidoID);
    clientSalesMap.set(v.ClienteID, cData);
  });

  const clientListRaw = Array.from(clientSalesMap.entries()).map(([clienteId, data]) => {
    const info = clienteNames.get(clienteId) || { nombre: `Cliente ${clienteId}`, region: 'N/A' };
    const participacion = ventasTotales > 0 ? data.ventas / ventasTotales : 0;
    let segmento: 'Oro' | 'Plata' | 'Bronce' = 'Bronce';
    if (data.ventas >= 30000000) segmento = 'Oro';
    else if (data.ventas >= 20000000) segmento = 'Plata';

    return {
      clienteId,
      nombre: info.nombre,
      region: info.region,
      ventas: data.ventas,
      pedidos: data.pedidos.size,
      segmento,
      participacion,
      ranking: 1,
    };
  });

  // Sort by sales descending and assign ranking
  clientListRaw.sort((a, b) => b.ventas - a.ventas);
  const porCliente: ClienteSummary[] = clientListRaw.map((item, index) => ({
    ...item,
    ranking: index + 1,
  }));

  // 5. Meses (1..6)
  const monthMap = new Map<number, { ventas: number; pedidos: Set<string>; unidades: number }>();
  for (let m = 1; m <= 6; m++) {
    monthMap.set(m, { ventas: 0, pedidos: new Set(), unidades: 0 });
  }

  ventas.forEach((v) => {
    const m = v.Mes || 1;
    const mData = monthMap.get(m) || { ventas: 0, pedidos: new Set(), unidades: 0 };
    mData.ventas += v.Importe;
    mData.pedidos.add(v.PedidoID);
    mData.unidades += v.Cantidad;
    monthMap.set(m, mData);
  });

  let cumulativeYTD = 0;
  let previousMonthSales: number | null = null;
  const porMes: MesSummary[] = [];

  for (let m = 1; m <= 6; m++) {
    const data = monthMap.get(m)!;
    cumulativeYTD += data.ventas;
    let varMoM: number | null = null;
    if (previousMonthSales !== null && previousMonthSales > 0) {
      varMoM = (data.ventas - previousMonthSales) / previousMonthSales;
    }
    previousMonthSales = data.ventas;

    porMes.push({
      mes: m,
      nombreMes: NOMBRES_MESES[m] || `Mes ${m}`,
      ventas: data.ventas,
      pedidos: data.pedidos.size,
      unidades: data.unidades,
      varMoM,
      ventasYTD: cumulativeYTD,
    });
  }

  // 6. Servicios
  const serviceMap = new Map<string, { ventas: number; pedidos: Set<string>; unidades: number; cmv: number }>();
  ventas.forEach((v) => {
    const sData = serviceMap.get(v.Servicio) || { ventas: 0, pedidos: new Set(), unidades: 0, cmv: 0 };
    sData.ventas += v.Importe;
    sData.pedidos.add(v.PedidoID);
    sData.unidades += v.Cantidad;
    sData.cmv += v.Cantidad * (v.CostoUnitario || v.PrecioUnitario * 0.55);
    serviceMap.set(v.Servicio, sData);
  });

  const porServicio: ServicioSummary[] = Array.from(serviceMap.entries()).map(([servicio, data]) => {
    const participacion = ventasTotales > 0 ? data.ventas / ventasTotales : 0;
    const utilidadBruta = data.ventas - data.cmv;
    return {
      servicio,
      ventas: data.ventas,
      pedidos: data.pedidos.size,
      unidades: data.unidades,
      participacion,
      cmvEstimado: Math.round(data.cmv),
      utilidadBruta: Math.round(utilidadBruta),
    };
  }).sort((a, b) => b.ventas - a.ventas);

  // 7. Inventarios & Compras
  let comprasTotales = 0;
  let inventarioInicialValor = 0;
  let inventarioFinalValor = 0;

  inventario.forEach((inv) => {
    comprasTotales += inv.ComprasPeriodo * inv.CostoUnitarioCompra;
    inventarioInicialValor += inv.StockInicial * inv.CostoPromedio;
    inventarioFinalValor += inv.StockFinal * inv.CostoPromedio;
  });

  const inventarioPromedioValor = Math.max(1, (inventarioInicialValor + inventarioFinalValor) / 2);
  const cmvTotal = cmvTotalCalculado > 0 ? cmvTotalCalculado : Math.round(ventasTotales * 0.56);
  const rotacionInventarioGlobal = Number((cmvTotal / inventarioPromedioValor).toFixed(2));
  const diasInventarioGlobal = rotacionInventarioGlobal > 0
    ? Number((parametros.DiasPeriodo / rotacionInventarioGlobal).toFixed(1))
    : 0;

  // 8. Finanzas & P&L
  const utilidadBruta = Math.max(0, ventasTotales - cmvTotal);
  const margenBrutoPct = ventasTotales > 0 ? utilidadBruta / ventasTotales : 0;

  const gastosFijosTotales = parametros.GastosFijosAdmin +
    parametros.GastosFijosArriendos +
    parametros.GastosFijosNomina +
    parametros.GastosFijosServicios;

  const gastosVariablesTotales = Math.round(ventasTotales * (parametros.GastosVariablesPorc || 0));
  const gastosOperativosTotales = gastosFijosTotales + gastosVariablesTotales;

  const utilidadOperativa = utilidadBruta - gastosOperativosTotales;
  const margenOperativoPct = ventasTotales > 0 ? utilidadOperativa / ventasTotales : 0;

  const impuestosEstimados = utilidadOperativa > 0
    ? Math.round(utilidadOperativa * (parametros.TasaImpuestos || 0.33))
    : 0;
  const utilidadNeta = utilidadOperativa - impuestosEstimados;
  const margenNetoPct = ventasTotales > 0 ? utilidadNeta / ventasTotales : 0;

  // 9. Punto de Equilibrio (Break-Even)
  // Margen de contribucion = Ventas - Costos Variables (CMV + Gastos Variables)
  const costosVariablesTotales = cmvTotal + gastosVariablesTotales;
  const margenContribucionValor = ventasTotales - costosVariablesTotales;
  const margenContribucionPct = ventasTotales > 0 ? margenContribucionValor / ventasTotales : 0;

  const puntoEquilibrioValor = margenContribucionPct > 0
    ? Math.round(gastosFijosTotales / margenContribucionPct)
    : 0;

  const precioPromedioUnitario = totalCantidad > 0 ? ventasTotales / totalCantidad : 0;
  const costoVariableUnitario = totalCantidad > 0 ? costosVariablesTotales / totalCantidad : 0;
  const contribucionUnitaria = precioPromedioUnitario - costoVariableUnitario;

  const puntoEquilibrioUnidades = contribucionUnitaria > 0
    ? Math.round(gastosFijosTotales / contribucionUnitaria)
    : 0;

  const margenSeguridadValor = ventasTotales - puntoEquilibrioValor;
  const margenSeguridadPct = ventasTotales > 0 ? (margenSeguridadValor / ventasTotales) : 0;

  const gradoApalancamientoOperativo = utilidadOperativa > 0
    ? Number((margenContribucionValor / utilidadOperativa).toFixed(2))
    : 0;

  return {
    ventasTotales,
    ventasBrutas,
    descuentosTotales,
    descuentoEfectivoPct,
    totalPedidos,
    totalClientes,
    totalLineas,
    ticketPromedio,
    precioNetoPromedioPorUnidad,
    cantidadPromedioPorLinea,
    descuentoPromedioRegistrado,
    descuentosVacios,
    metaTotal,
    cumplimientoTotal,
    comprasTotales,
    cmvTotal,
    inventarioInicialValor,
    inventarioFinalValor,
    inventarioPromedioValor,
    rotacionInventarioGlobal,
    diasInventarioGlobal,
    utilidadBruta,
    margenBrutoPct,
    gastosFijosTotales,
    gastosVariablesTotales,
    gastosOperativosTotales,
    utilidadOperativa,
    margenOperativoPct,
    impuestosEstimados,
    utilidadNeta,
    margenNetoPct,
    margenContribucionPct,
    puntoEquilibrioValor,
    puntoEquilibrioUnidades,
    margenSeguridadValor,
    margenSeguridadPct,
    gradoApalancamientoOperativo,
    porRegion,
    porCliente,
    porMes,
    porServicio,
  };
}

export function formatCurrencyCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
