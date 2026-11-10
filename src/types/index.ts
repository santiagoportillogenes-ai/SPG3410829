export interface FactVentaItem {
  PedidoID: string;
  Fecha: string;
  Región: string;
  Servicio: string;
  ClienteID: string;
  Cantidad: number;
  PrecioUnitario: number;
  DescuentoPct: number | null;
  Importe: number;
  PrecioNeto: number;
  Bruto: number;
  Mes: number;
  CostoUnitario?: number;
}

export interface DimRegionItem {
  Región: string;
  Departamento: string;
  MetaSemestral: number;
}

export interface DimClienteItem {
  ClienteID: string;
  NombreCliente: string;
  Región: string;
}

export interface InventarioItem {
  Codigo: string;
  Nombre: string;
  Categoria: string;
  StockInicial: number;
  ComprasPeriodo: number;
  CostoUnitarioCompra: number;
  VentasUnidades: number;
  StockFinal: number;
  StockSeguridad: number;
  PuntoReorden: number;
  CostoPromedio: number;
  ValorInventarioTotal: number;
  Rotacion: number;
  DiasInventario: number;
  EstadoAbastecimiento: 'Optimo' | 'Alerta' | 'Critico' | 'Sobreinventario';
}

export interface ParametrosFinancieros {
  GastosFijosAdmin: number;
  GastosFijosArriendos: number;
  GastosFijosNomina: number;
  GastosFijosServicios: number;
  GastosVariablesPorc: number; // Porcentaje sobre ventas (e.g., 0.06 = 6%)
  TasaImpuestos: number; // Porcentaje de impuestos (e.g. 0.33)
  DiasPeriodo: number; // 180 días (semestre)
}

export type SectorType = 'logistica' | 'retail' | 'manufactura' | 'salud' | 'agro';

export interface SectorConfig {
  id: SectorType;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  moneda: string;
  serviciosOProductos: string[];
  costoMarginalDefectoPct: number;
  gastosFijosDefecto: number;
}

export interface RegionSummary {
  region: string;
  departamento: string;
  ventas: number;
  bruto: number;
  pedidos: number;
  ticketPromedio: number;
  meta: number;
  cumplimiento: number;
  participacion: number;
}

export interface ClienteSummary {
  clienteId: string;
  nombre: string;
  region: string;
  ventas: number;
  pedidos: number;
  ranking: number;
  segmento: 'Oro' | 'Plata' | 'Bronce';
  participacion: number;
}

export interface MesSummary {
  mes: number;
  nombreMes: string;
  ventas: number;
  pedidos: number;
  unidades: number;
  varMoM: number | null;
  ventasYTD: number;
}

export interface ServicioSummary {
  servicio: string;
  ventas: number;
  pedidos: number;
  unidades: number;
  participacion: number;
  cmvEstimado: number;
  utilidadBruta: number;
}

export interface CalculatedKPIs {
  // Ventas & Ingresos
  ventasTotales: number;
  ventasBrutas: number;
  descuentosTotales: number;
  descuentoEfectivoPct: number;
  totalPedidos: number;
  totalClientes: number;
  totalLineas: number;
  ticketPromedio: number;
  precioNetoPromedioPorUnidad: number;
  cantidadPromedioPorLinea: number;
  descuentoPromedioRegistrado: number;
  descuentosVacios: number;

  // Metas
  metaTotal: number;
  cumplimientoTotal: number;

  // Inventarios & Compras
  comprasTotales: number;
  cmvTotal: number; // Cost of goods sold / Costo de ventas
  inventarioInicialValor: number;
  inventarioFinalValor: number;
  inventarioPromedioValor: number;
  rotacionInventarioGlobal: number; // CMV / Inventario Promedio
  diasInventarioGlobal: number; // 180 / Rotacion

  // Finanzas & Rentabilidad
  utilidadBruta: number;
  margenBrutoPct: number;
  gastosFijosTotales: number;
  gastosVariablesTotales: number;
  gastosOperativosTotales: number;
  utilidadOperativa: number; // EBIT / EBITDA
  margenOperativoPct: number;
  impuestosEstimados: number;
  utilidadNeta: number;
  margenNetoPct: number;

  // Punto de Equilibrio
  margenContribucionPct: number;
  puntoEquilibrioValor: number;
  puntoEquilibrioUnidades: number;
  margenSeguridadValor: number;
  margenSeguridadPct: number;
  gradoApalancamientoOperativo: number;

  // Desgloses
  porRegion: RegionSummary[];
  porCliente: ClienteSummary[];
  porMes: MesSummary[];
  porServicio: ServicioSummary[];
}

export interface EquivalenciaItem {
  concepto: string;
  formulaExcel: string;
  medidaDax: string;
  resultadoExcel: number | string;
  valorPresentacion: number | string;
  control: string;
  sesion: number;
}

export interface MedidaDAX {
  sesion: number;
  objeto: string;
  formulaDax: string;
  paraQueSirve: string;
  dondeSeCrea: string;
}

export interface Evidencia {
  sesion: string | number;
  fecha: string;
  tema: string;
  evidencias: string;
  plazo: string;
  estado: string;
}
