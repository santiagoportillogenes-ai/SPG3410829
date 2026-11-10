import * as XLSX from 'xlsx';
import {
  FactVentaItem,
  DimRegionItem,
  DimClienteItem,
  InventarioItem,
  ParametrosFinancieros,
  CalculatedKPIs,
  MedidaDAX,
} from '../types';
import { formatCurrencyCOP, formatPercent, recalculateFactVentaItem } from './calculations';

export interface FullTICModelExport {
  metadata: {
    titulo: string;
    sistema: string;
    ficha: string;
    fechaGeneracion: string;
    formatoTIC: string;
  };
  FactVentas: FactVentaItem[];
  DimRegion: DimRegionItem[];
  DimCliente: DimClienteItem[];
  Inventarios: InventarioItem[];
  ParametrosFinancieros: ParametrosFinancieros;
  ResumenKPIs: {
    ventasTotales: number;
    ventasBrutas: number;
    metaSemestral: number;
    cumplimientoPorc: number;
    utilidadBruta: number;
    utilidadOperativa: number;
    utilidadNeta: number;
    rotacionInventario: number;
    diasInventario: number;
    puntoEquilibrioValor: number;
    margenSeguridadPorc: number;
  };
}

/**
 * Download a Blob as a file in the browser
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 1. Export to Excel (.xlsx) Multi-Sheet
 */
export function exportToExcel(
  ventas: FactVentaItem[],
  regiones: DimRegionItem[],
  clientes: DimClienteItem[],
  inventario: InventarioItem[],
  kpis: CalculatedKPIs,
  medidasDax: MedidaDAX[],
  fileName = 'Modelo_Gestion_Integral_SENA_CPL3410829.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumen Ejecutivo KPIs
  const kpiData = [
    { Indicador: 'Ventas Totales Netas', Valor: kpis.ventasTotales, Unidad: 'COP', Formula_DAX: 'SUM(FactVentas[Importe])' },
    { Indicador: 'Ventas Brutas', Valor: kpis.ventasBrutas, Unidad: 'COP', Formula_DAX: 'SUMX(FactVentas, Cantidad * PrecioUnitario)' },
    { Indicador: 'Descuentos Totales Concedidos', Valor: kpis.descuentosTotales, Unidad: 'COP', Formula_DAX: '[Bruto] - [Ventas Totales]' },
    { Indicador: 'Tasa Efectiva de Descuento', Valor: (kpis.descuentoEfectivoPct * 100).toFixed(2) + '%', Unidad: '%', Formula_DAX: 'DIVIDE([Bruto] - [Ventas Totales], [Bruto])' },
    { Indicador: 'Meta Semestral Presupuestada', Valor: kpis.metaTotal, Unidad: 'COP', Formula_DAX: 'SUM(DimRegion[MetaSemestral])' },
    { Indicador: 'Cumplimiento Global de Meta', Valor: (kpis.cumplimientoTotal * 100).toFixed(2) + '%', Unidad: '%', Formula_DAX: 'DIVIDE([Ventas Totales], [Meta Ventas])' },
    { Indicador: 'Ticket Promedio por Pedido', Valor: kpis.ticketPromedio, Unidad: 'COP', Formula_DAX: 'DIVIDE([Ventas Totales], [Pedidos])' },
    { Indicador: 'Precio Neto Promedio por Unidad', Valor: Math.round(kpis.precioNetoPromedioPorUnidad), Unidad: 'COP', Formula_DAX: 'DIVIDE(SUM(Importe), SUM(Cantidad))' },
    { Indicador: 'Pedidos Únicos Despachados', Valor: kpis.totalPedidos, Unidad: 'Pedidos', Formula_DAX: 'DISTINCTCOUNT(FactVentas[PedidoID])' },
    { Indicador: 'Líneas Operativas Totales', Valor: kpis.totalLineas, Unidad: 'Líneas', Formula_DAX: 'COUNTROWS(FactVentas)' },
    { Indicador: 'Costo Mercancía Vendida (CMV)', Valor: kpis.cmvTotal, Unidad: 'COP', Formula_DAX: 'SUMX(FactVentas, Cantidad * CostoUnitario)' },
    { Indicador: 'Utilidad Bruta', Valor: kpis.utilidadBruta, Unidad: 'COP', Formula_DAX: '[Ventas Totales] - [CMV]' },
    { Indicador: 'Margen Bruto', Valor: (kpis.margenBrutoPct * 100).toFixed(2) + '%', Unidad: '%', Formula_DAX: 'DIVIDE([Utilidad Bruta], [Ventas Totales])' },
    { Indicador: 'Gastos Operativos (Fijos + Var)', Valor: kpis.gastosOperativosTotales, Unidad: 'COP', Formula_DAX: '[Gastos Fijos] + [Gastos Variables]' },
    { Indicador: 'Utilidad Operativa (EBIT)', Valor: kpis.utilidadOperativa, Unidad: 'COP', Formula_DAX: '[Utilidad Bruta] - [Gastos Operativos]' },
    { Indicador: 'Margen Operativo', Valor: (kpis.margenOperativoPct * 100).toFixed(2) + '%', Unidad: '%', Formula_DAX: 'DIVIDE([Utilidad Operativa], [Ventas Totales])' },
    { Indicador: 'Utilidad Neta', Valor: kpis.utilidadNeta, Unidad: 'COP', Formula_DAX: '[Utilidad Operativa] - [Impuestos]' },
    { Indicador: 'Rotación de Inventarios (Turnover)', Valor: kpis.rotacionInventarioGlobal, Unidad: 'Veces / Semestre', Formula_DAX: 'DIVIDE([CMV], [Inventario Promedio])' },
    { Indicador: 'Días de Inventario (DSI)', Valor: kpis.diasInventarioGlobal, Unidad: 'Días', Formula_DAX: 'DIVIDE(180, [Rotación Inventario])' },
    { Indicador: 'Punto de Equilibrio Monetario', Valor: kpis.puntoEquilibrioValor, Unidad: 'COP', Formula_DAX: 'DIVIDE([Gastos Fijos], [Margen Contribución %])' },
    { Indicador: 'Punto de Equilibrio en Unidades', Valor: kpis.puntoEquilibrioUnidades, Unidad: 'Unidades', Formula_DAX: 'DIVIDE([Gastos Fijos], [Margen Contribución Unitario])' },
    { Indicador: 'Margen de Seguridad', Valor: (kpis.margenSeguridadPct * 100).toFixed(2) + '%', Unidad: '%', Formula_DAX: 'DIVIDE([Ventas Totales] - [Punto Equilibrio], [Ventas Totales])' },
  ];
  const wsKPI = XLSX.utils.json_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(wb, wsKPI, 'Resumen_KPIs');

  // Sheet 2: FactVentas
  const wsVentas = XLSX.utils.json_to_sheet(ventas);
  XLSX.utils.book_append_sheet(wb, wsVentas, 'FactVentas');

  // Sheet 3: DimRegion
  const wsRegion = XLSX.utils.json_to_sheet(regiones);
  XLSX.utils.book_append_sheet(wb, wsRegion, 'DimRegion');

  // Sheet 4: DimCliente
  const wsCliente = XLSX.utils.json_to_sheet(clientes);
  XLSX.utils.book_append_sheet(wb, wsCliente, 'DimCliente');

  // Sheet 5: Inventarios
  const wsInv = XLSX.utils.json_to_sheet(inventario);
  XLSX.utils.book_append_sheet(wb, wsInv, 'Inventarios_y_Compras');

  // Sheet 6: Medidas_DAX
  const wsDAX = XLSX.utils.json_to_sheet(medidasDax);
  XLSX.utils.book_append_sheet(wb, wsDAX, 'Medidas_DAX_Oficiales');

  // Generate buffer and trigger download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, fileName);
}

/**
 * 2. Export to CSV (with customizable separator: ',' or ';')
 */
export function exportToCSV(
  data: object[],
  fileName: string,
  separator: ',' | ';' = ';'
) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);

  const rows = data.map((row) => {
    return headers
      .map((header) => {
        const val = (row as Record<string, unknown>)[header];
        if (val === null || val === undefined) return '';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(separator);
  });

  const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(separator), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, fileName);
}

/**
 * 3. Export to JSON (Full Database TIC representation)
 */
export function exportToJSON(
  ventas: FactVentaItem[],
  regiones: DimRegionItem[],
  clientes: DimClienteItem[],
  inventario: InventarioItem[],
  parametros: ParametrosFinancieros,
  kpis: CalculatedKPIs,
  fileName = 'Dataset_Gestion_Integral_TIC.json'
) {
  const exportPayload: FullTICModelExport = {
    metadata: {
      titulo: 'Modelo de Cálculo Integral en Bases de Datos y Gestión TIC',
      sistema: 'Prototipo de Gestión Administrativa, Financiera e Inventarios',
      ficha: 'CPL_3410829 - SENA CTAPT 2026',
      fechaGeneracion: new Date().toISOString(),
      formatoTIC: 'JSON Standard Interchange RFC 8259',
    },
    FactVentas: ventas,
    DimRegion: regiones,
    DimCliente: clientes,
    Inventarios: inventario,
    ParametrosFinancieros: parametros,
    ResumenKPIs: {
      ventasTotales: kpis.ventasTotales,
      ventasBrutas: kpis.ventasBrutas,
      metaSemestral: kpis.metaTotal,
      cumplimientoPorc: kpis.cumplimientoTotal,
      utilidadBruta: kpis.utilidadBruta,
      utilidadOperativa: kpis.utilidadOperativa,
      utilidadNeta: kpis.utilidadNeta,
      rotacionInventario: kpis.rotacionInventarioGlobal,
      diasInventario: kpis.diasInventarioGlobal,
      puntoEquilibrioValor: kpis.puntoEquilibrioValor,
      margenSeguridadPorc: kpis.margenSeguridadPct,
    },
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, fileName);
}

/**
 * 4. Export to XML (W3C Standardized TIC representation)
 */
export function exportToXML(
  ventas: FactVentaItem[],
  regiones: DimRegionItem[],
  clientes: DimClienteItem[],
  inventario: InventarioItem[],
  kpis: CalculatedKPIs,
  fileName = 'Modelo_Gestion_Integral.xml'
) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<ModeloGestionIntegral version="1.0" fecha="${new Date().toISOString()}">\n`;

  xml += `  <ResumenKPIs>\n`;
  xml += `    <VentasTotales>${kpis.ventasTotales}</VentasTotales>\n`;
  xml += `    <MetaTotal>${kpis.metaTotal}</MetaTotal>\n`;
  xml += `    <CumplimientoPorcentaje>${kpis.cumplimientoTotal}</CumplimientoPorcentaje>\n`;
  xml += `    <CMVTotal>${kpis.cmvTotal}</CMVTotal>\n`;
  xml += `    <UtilidadBruta>${kpis.utilidadBruta}</UtilidadBruta>\n`;
  xml += `    <UtilidadOperativa>${kpis.utilidadOperativa}</UtilidadOperativa>\n`;
  xml += `    <RotacionInventarios>${kpis.rotacionInventarioGlobal}</RotacionInventarios>\n`;
  xml += `    <DiasInventario>${kpis.diasInventarioGlobal}</DiasInventario>\n`;
  xml += `    <PuntoEquilibrioValor>${kpis.puntoEquilibrioValor}</PuntoEquilibrioValor>\n`;
  xml += `    <PuntoEquilibrioUnidades>${kpis.puntoEquilibrioUnidades}</PuntoEquilibrioUnidades>\n`;
  xml += `  </ResumenKPIs>\n`;

  xml += `  <FactVentas cantidadRegistros="${ventas.length}">\n`;
  ventas.forEach((v) => {
    xml += `    <Venta>\n`;
    xml += `      <PedidoID>${v.PedidoID}</PedidoID>\n`;
    xml += `      <Fecha>${v.Fecha}</Fecha>\n`;
    xml += `      <Region>${v.Región}</Region>\n`;
    xml += `      <Servicio>${v.Servicio}</Servicio>\n`;
    xml += `      <ClienteID>${v.ClienteID}</ClienteID>\n`;
    xml += `      <Cantidad>${v.Cantidad}</Cantidad>\n`;
    xml += `      <PrecioUnitario>${v.PrecioUnitario}</PrecioUnitario>\n`;
    xml += `      <DescuentoPct>${v.DescuentoPct !== null ? v.DescuentoPct : ''}</DescuentoPct>\n`;
    xml += `      <Importe>${v.Importe}</Importe>\n`;
    xml += `      <Bruto>${v.Bruto}</Bruto>\n`;
    xml += `      <Mes>${v.Mes}</Mes>\n`;
    xml += `    </Venta>\n`;
  });
  xml += `  </FactVentas>\n`;

  xml += `  <DimRegion>\n`;
  regiones.forEach((r) => {
    xml += `    <Region>\n`;
    xml += `      <Nombre>${r.Región}</Nombre>\n`;
    xml += `      <Departamento>${r.Departamento}</Departamento>\n`;
    xml += `      <MetaSemestral>${r.MetaSemestral}</MetaSemestral>\n`;
    xml += `    </Region>\n`;
  });
  xml += `  </DimRegion>\n`;

  xml += `  <DimCliente>\n`;
  clientes.forEach((c) => {
    xml += `    <Cliente>\n`;
    xml += `      <ClienteID>${c.ClienteID}</ClienteID>\n`;
    xml += `      <Nombre>${c.NombreCliente}</Nombre>\n`;
    xml += `      <Region>${c.Región}</Region>\n`;
    xml += `    </Cliente>\n`;
  });
  xml += `  </DimCliente>\n`;

  xml += `  <Inventarios>\n`;
  inventario.forEach((inv) => {
    xml += `    <Articulo>\n`;
    xml += `      <Codigo>${inv.Codigo}</Codigo>\n`;
    xml += `      <Nombre>${inv.Nombre}</Nombre>\n`;
    xml += `      <StockInicial>${inv.StockInicial}</StockInicial>\n`;
    xml += `      <ComprasPeriodo>${inv.ComprasPeriodo}</ComprasPeriodo>\n`;
    xml += `      <VentasUnidades>${inv.VentasUnidades}</VentasUnidades>\n`;
    xml += `      <StockFinal>${inv.StockFinal}</StockFinal>\n`;
    xml += `      <Rotacion>${inv.Rotacion}</Rotacion>\n`;
    xml += `      <DiasInventario>${inv.DiasInventario}</DiasInventario>\n`;
    xml += `    </Articulo>\n`;
  });
  xml += `  </Inventarios>\n`;

  xml += `</ModeloGestionIntegral>\n`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  downloadBlob(blob, fileName);
}

/**
 * 5. Export to TXT (Executive Balance Sheet formatted for TIC printing/logs)
 */
export function exportToTXT(
  kpis: CalculatedKPIs,
  parametros: ParametrosFinancieros,
  fileName = 'Informe_Gestion_Ejecutivo_TIC.txt'
) {
  const line = '='.repeat(78);
  const subline = '-'.repeat(78);

  let txt = '';
  txt += `${line}\n`;
  txt += `SISTEMA DE GESTIÓN INTEGRAL · INFORME ADMINISTRATIVO Y FINANCIERO\n`;
  txt += `PROTOTIPO DE CÁLCULO DE ACTIVIDADES ORIENTADO A BASES DE DATOS TIC\n`;
  txt += `Generado el: ${new Date().toLocaleString('es-CO')}\n`;
  txt += `${line}\n\n`;

  txt += `1. INDICADORES CLAVE DE VENTAS Y METAS (KPIs)\n`;
  txt += `${subline}\n`;
  txt += `• Ventas Brutas Totales:             ${formatCurrencyCOP(kpis.ventasBrutas)}\n`;
  txt += `• Descuentos Otorgados:              ${formatCurrencyCOP(kpis.descuentosTotales)} (${formatPercent(kpis.descuentoEfectivoPct)})\n`;
  txt += `• Ventas Netas Facturadas:           ${formatCurrencyCOP(kpis.ventasTotales)}\n`;
  txt += `• Meta Presupuestal Semestral:       ${formatCurrencyCOP(kpis.metaTotal)}\n`;
  txt += `• Porcentaje de Cumplimiento:        ${formatPercent(kpis.cumplimientoTotal)}\n`;
  txt += `• Total Pedidos Despachados:         ${kpis.totalPedidos} pedidos\n`;
  txt += `• Ticket Promedio por Pedido:        ${formatCurrencyCOP(kpis.ticketPromedio)}\n`;
  txt += `• Precio Neto Promedio por Unidad:   ${formatCurrencyCOP(kpis.precioNetoPromedioPorUnidad)}\n\n`;

  txt += `2. GESTIÓN Y ROTACIÓN DE INVENTARIOS\n`;
  txt += `${subline}\n`;
  txt += `• Costo de Mercancía Vendida (CMV):  ${formatCurrencyCOP(kpis.cmvTotal)}\n`;
  txt += `• Compras del Período:               ${formatCurrencyCOP(kpis.comprasTotales)}\n`;
  txt += `• Valor Inventario Promedio:         ${formatCurrencyCOP(kpis.inventarioPromedioValor)}\n`;
  txt += `• Rotación de Inventarios:           ${kpis.rotacionInventarioGlobal} veces / semestre\n`;
  txt += `• Días de Permanencia (DSI):         ${kpis.diasInventarioGlobal} días\n\n`;

  txt += `3. ESTADO DE RESULTADOS OPERATIVO Y RENTABILIDAD\n`;
  txt += `${subline}\n`;
  txt += `(+) Ingresos Operacionales Netos:    ${formatCurrencyCOP(kpis.ventasTotales)}\n`;
  txt += `(-) Costo de Ventas (CMV):           ${formatCurrencyCOP(kpis.cmvTotal)}\n`;
  txt += `(=) UTILIDAD BRUTA:                  ${formatCurrencyCOP(kpis.utilidadBruta)} (Margen: ${formatPercent(kpis.margenBrutoPct)})\n`;
  txt += `(-) Gastos Fijos de Administración:  ${formatCurrencyCOP(kpis.gastosFijosTotales)}\n`;
  txt += `(-) Gastos Variables Operativos:     ${formatCurrencyCOP(kpis.gastosVariablesTotales)}\n`;
  txt += `(=) UTILIDAD OPERATIVA (EBITDA):     ${formatCurrencyCOP(kpis.utilidadOperativa)} (Margen: ${formatPercent(kpis.margenOperativoPct)})\n`;
  txt += `(-) Provisión Impuestos (${(parametros.TasaImpuestos * 100).toFixed(0)}%):       ${formatCurrencyCOP(kpis.impuestosEstimados)}\n`;
  txt += `(=) UTILIDAD NETA DEL EJERCICIO:     ${formatCurrencyCOP(kpis.utilidadNeta)} (Margen: ${formatPercent(kpis.margenNetoPct)})\n\n`;

  txt += `4. ANÁLISIS DE PUNTO DE EQUILIBRIO (BREAK-EVEN)\n`;
  txt += `${subline}\n`;
  txt += `• Margen de Contribución Total:      ${formatPercent(kpis.margenContribucionPct)}\n`;
  txt += `• Punto de Equilibrio en Dinero:     ${formatCurrencyCOP(kpis.puntoEquilibrioValor)}\n`;
  txt += `• Punto de Equilibrio en Unidades:   ${kpis.puntoEquilibrioUnidades.toLocaleString()} unidades\n`;
  txt += `• Margen de Seguridad Monetario:     ${formatCurrencyCOP(kpis.margenSeguridadValor)}\n`;
  txt += `• Margen de Seguridad Porcentual:    ${formatPercent(kpis.margenSeguridadPct)}\n`;
  txt += `• Grado de Apalancamiento Op. (GAO): ${kpis.gradoApalancamientoOperativo}\n\n`;

  txt += `5. DESGLOSE REGIONAL DE VENTAS Y CUMPLIMIENTO\n`;
  txt += `${subline}\n`;
  kpis.porRegion.forEach((r) => {
    txt += `[${r.region.padEnd(10)}] Ventas: ${formatCurrencyCOP(r.ventas).padEnd(16)} Meta: ${formatCurrencyCOP(r.meta).padEnd(16)} Cumplimiento: ${formatPercent(r.cumplimiento)}\n`;
  });

  txt += `\n${line}\n`;
  txt += `Fin del Reporte TIC · Conforme a requerimientos curriculares SENA Ficha 3410829\n`;

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, fileName);
}

/**
 * 6. Export DAX Measures Script (.dax) for Power BI
 */
export function exportToDAXScript(
  medidasDax: MedidaDAX[],
  fileName = 'Biblioteca_Medidas_DAX_PowerBI.dax'
) {
  let script = `-- ====================================================================\n`;
  script += `-- BIBLIOTECA OFICIAL DE MEDIDAS DAX · POWER BI\n`;
  script += `-- CURSO: Visualización de datos utilizando Power BI · SENA\n`;
  script += `-- Ficha CPL_3410829 · Fórmulas validadas con FactVentas\n`;
  script += `-- ====================================================================\n\n`;

  medidasDax.forEach((m, idx) => {
    script += `-- [Medida ${idx + 1}] Sesión ${m.sesion}: ${m.objeto}\n`;
    script += `-- Finalidad: ${m.paraQueSirve}\n`;
    script += `-- Dónde crear: ${m.dondeSeCrea}\n`;
    script += `${m.formulaDax}\n\n`;
  });

  const blob = new Blob([script], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, fileName);
}

/**
 * Parse an uploaded TIC file (.xlsx, .xls, .csv, .json, .xml)
 */
export async function parseUploadedTICFile(file: File): Promise<{
  success: boolean;
  message: string;
  ventas?: FactVentaItem[];
  regiones?: DimRegionItem[];
  clientes?: DimClienteItem[];
  inventario?: InventarioItem[];
  parametros?: ParametrosFinancieros;
}> {
  const fileName = file.name.toLowerCase();

  try {
    // Case 1: JSON
    if (fileName.endsWith('.json')) {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let newVentas: FactVentaItem[] | undefined;
      let newRegiones: DimRegionItem[] | undefined;
      let newClientes: DimClienteItem[] | undefined;
      let newInventarios: InventarioItem[] | undefined;
      let newParams: ParametrosFinancieros | undefined;

      // Check if it's the full SENA format or our TIC model format
      if (Array.isArray(parsed.FactVentas)) {
        newVentas = parsed.FactVentas.map(recalculateFactVentaItem);
      }
      if (Array.isArray(parsed.DimRegion)) {
        newRegiones = parsed.DimRegion;
      }
      if (Array.isArray(parsed.DimCliente)) {
        newClientes = parsed.DimCliente;
      }
      if (Array.isArray(parsed.Inventarios)) {
        newInventarios = parsed.Inventarios;
      }
      if (parsed.ParametrosFinancieros) {
        newParams = parsed.ParametrosFinancieros;
      }

      // If top-level was an array of sales
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].PedidoID) {
        newVentas = parsed.map(recalculateFactVentaItem);
      }

      return {
        success: true,
        message: `Archivo JSON cargado exitosamente (${newVentas ? newVentas.length : 0} registros de ventas actualizados).`,
        ventas: newVentas,
        regiones: newRegiones,
        clientes: newClientes,
        inventario: newInventarios,
        parametros: newParams,
      };
    }

    // Case 2: Excel (.xlsx, .xls)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      let newVentas: FactVentaItem[] | undefined;
      let newRegiones: DimRegionItem[] | undefined;
      let newClientes: DimClienteItem[] | undefined;
      let newInventarios: InventarioItem[] | undefined;

      // Check sheet names
      if (workbook.SheetNames.includes('FactVentas')) {
        const raw = XLSX.utils.sheet_to_json(workbook.Sheets['FactVentas']);
        newVentas = (raw as Partial<FactVentaItem>[]).map(recalculateFactVentaItem);
      } else if (workbook.SheetNames.length > 0) {
        // Fallback to first sheet
        const raw = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (Array.isArray(raw) && raw.length > 0 && (raw[0] as Record<string, unknown>).PedidoID) {
          newVentas = (raw as Partial<FactVentaItem>[]).map(recalculateFactVentaItem);
        }
      }

      if (workbook.SheetNames.includes('DimRegion')) {
        newRegiones = XLSX.utils.sheet_to_json(workbook.Sheets['DimRegion']) as DimRegionItem[];
      }
      if (workbook.SheetNames.includes('DimCliente')) {
        newClientes = XLSX.utils.sheet_to_json(workbook.Sheets['DimCliente']) as DimClienteItem[];
      }
      if (workbook.SheetNames.includes('Inventarios') || workbook.SheetNames.includes('Inventarios_y_Compras')) {
        const sName = workbook.SheetNames.includes('Inventarios') ? 'Inventarios' : 'Inventarios_y_Compras';
        newInventarios = XLSX.utils.sheet_to_json(workbook.Sheets[sName]) as InventarioItem[];
      }

      return {
        success: true,
        message: `Libro de Excel procesado. Se cargaron ${workbook.SheetNames.length} hojas: ${workbook.SheetNames.join(', ')}.`,
        ventas: newVentas,
        regiones: newRegiones,
        clientes: newClientes,
        inventario: newInventarios,
      };
    }

    // Case 3: CSV
    if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
      const text = await file.text();
      // Auto-detect comma vs semicolon separator
      const firstLine = text.split('\n')[0] || '';
      const sep = firstLine.includes(';') ? ';' : ',';

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        return { success: false, message: 'El archivo CSV no contiene registros suficientes.' };
      }

      // Parse headers
      const headers = lines[0].split(sep).map((h) => h.replace(/^"|"$/g, '').trim());
      const rawItems: Record<string, unknown>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(sep).map((c) => c.replace(/^"|"$/g, '').trim());
        const item: Record<string, unknown> = {};
        headers.forEach((h, idx) => {
          item[h] = cols[idx];
        });
        rawItems.push(item);
      }

      // Check if it's FactVentas
      if (headers.includes('PedidoID') || headers.includes('Importe') || headers.includes('PrecioUnitario')) {
        const newVentas = rawItems.map((r) => recalculateFactVentaItem(r as unknown as Partial<FactVentaItem>));
        return {
          success: true,
          message: `Archivo CSV importado con éxito: ${newVentas.length} registros cargados (separador '${sep}').`,
          ventas: newVentas,
        };
      }

      return {
        success: true,
        message: `Archivo CSV leído: ${rawItems.length} filas procesadas.`,
      };
    }

    // Case 4: XML
    if (fileName.endsWith('.xml')) {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const ventaNodes = xmlDoc.getElementsByTagName('Venta');
      if (ventaNodes.length > 0) {
        const newVentas: FactVentaItem[] = [];
        for (let i = 0; i < ventaNodes.length; i++) {
          const node = ventaNodes[i];
          const rawItem: Partial<FactVentaItem> = {
            PedidoID: node.getElementsByTagName('PedidoID')[0]?.textContent || `P${i + 1}`,
            Fecha: node.getElementsByTagName('Fecha')[0]?.textContent || '2026-01-01',
            Región: node.getElementsByTagName('Region')[0]?.textContent || 'Costa',
            Servicio: node.getElementsByTagName('Servicio')[0]?.textContent || 'Transporte',
            ClienteID: node.getElementsByTagName('ClienteID')[0]?.textContent || 'C01',
            Cantidad: Number(node.getElementsByTagName('Cantidad')[0]?.textContent) || 1,
            PrecioUnitario: Number(node.getElementsByTagName('PrecioUnitario')[0]?.textContent) || 0,
            DescuentoPct: node.getElementsByTagName('DescuentoPct')[0]?.textContent
              ? Number(node.getElementsByTagName('DescuentoPct')[0]?.textContent)
              : null,
          };
          newVentas.push(recalculateFactVentaItem(rawItem));
        }

        return {
          success: true,
          message: `Archivo XML interpretado exitosamente: ${newVentas.length} ventas extraídas.`,
          ventas: newVentas,
        };
      }
    }

    return {
      success: false,
      message: 'Formato de archivo no soportado. Por favor use .xlsx, .csv, .json, o .xml.',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al procesar archivo: ${(error as Error).message}`,
    };
  }
}
