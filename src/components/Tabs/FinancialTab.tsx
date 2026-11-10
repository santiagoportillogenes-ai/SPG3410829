import React, { useState } from 'react';
import {
  DollarSign,
  Scale,
  Sliders,
  TrendingUp,
  Percent,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CalculatedKPIs, ParametrosFinancieros } from '../../types';
import { formatCurrencyCOP, formatPercent } from '../../utils/calculations';

interface FinancialTabProps {
  kpis: CalculatedKPIs;
  parametros: ParametrosFinancieros;
  onUpdateParametros: (params: ParametrosFinancieros) => void;
}

export const FinancialTab: React.FC<FinancialTabProps> = ({
  kpis,
  parametros,
  onUpdateParametros,
}) => {
  // Local state for what-if simulation
  const [simGastosFijos, setSimGastosFijos] = useState<number>(kpis.gastosFijosTotales);
  const [simVentas, setSimVentas] = useState<number>(kpis.ventasTotales);
  const [simMargenContribucionPct, setSimMargenContribucionPct] = useState<number>(
    Math.round(kpis.margenContribucionPct * 100)
  );

  // Recalculate simulation values
  const simMC = simMargenContribucionPct / 100;
  const simPuntoEquilibrioValor = simMC > 0 ? Math.round(simGastosFijos / simMC) : 0;
  const simMargenSeguridadValor = simVentas - simPuntoEquilibrioValor;
  const simMargenSeguridadPct = simVentas > 0 ? simMargenSeguridadValor / simVentas : 0;
  const simUtilidadOperativa = Math.round(simVentas * simMC) - simGastosFijos;

  const handleResetSimulation = () => {
    setSimGastosFijos(kpis.gastosFijosTotales);
    setSimVentas(kpis.ventasTotales);
    setSimMargenContribucionPct(Math.round(kpis.margenContribucionPct * 100));
  };

  const handleUpdateFixedExpense = (field: keyof ParametrosFinancieros, val: number) => {
    const updated = { ...parametros, [field]: val };
    onUpdateParametros(updated);
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Split: Comprehensive Income Statement (P&L) vs Break-Even Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Estado de Resultados Integral (P&L) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                Estado de Resultados Integral (P&amp;L)
              </h2>
              <p className="text-xs text-slate-500">
                Estructura de Ingresos, Costos, Utilidad Operativa e Impuestos
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">Semestral</span>
          </div>

          <div className="space-y-2 text-xs font-mono tabular-nums">
            {/* Ingresos Brutos */}
            <div className="flex justify-between py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded">
              <span className="font-sans font-medium text-slate-600 dark:text-slate-400">
                (+) Ingresos Brutos Facturados
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrencyCOP(kpis.ventasBrutas)}
              </span>
            </div>

            {/* Descuentos */}
            <div className="flex justify-between py-1.5 px-2 text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded">
              <span className="font-sans">(-) Descuentos Comerciales Concedidos</span>
              <span>-{formatCurrencyCOP(kpis.descuentosTotales)} ({formatPercent(kpis.descuentoEfectivoPct)})</span>
            </div>

            {/* Ventas Netas */}
            <div className="flex justify-between py-2 px-2 bg-slate-100 dark:bg-slate-800 rounded font-bold text-slate-900 dark:text-slate-100">
              <span className="font-sans">(=) VENTAS NETAS OPERACIONALES</span>
              <span>{formatCurrencyCOP(kpis.ventasTotales)}</span>
            </div>

            {/* Costo de Ventas */}
            <div className="flex justify-between py-1.5 px-2 text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded">
              <span className="font-sans">(-) Costo de Mercancía Vendida / Operación (CMV)</span>
              <span>-{formatCurrencyCOP(kpis.cmvTotal)}</span>
            </div>

            {/* Utilidad Bruta */}
            <div className="flex justify-between py-2 px-2 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded font-bold">
              <span className="font-sans">(=) UTILIDAD BRUTA</span>
              <div className="text-right">
                <span>{formatCurrencyCOP(kpis.utilidadBruta)}</span>
                <span className="text-[11px] block text-emerald-600 dark:text-emerald-400 font-normal">
                  Margen Bruto: {formatPercent(kpis.margenBrutoPct)}
                </span>
              </div>
            </div>

            {/* Gastos Fijos Desglosados */}
            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1">
                Gastos Operacionales Fijos (Administración &amp; Estructura)
              </span>

              <div className="pl-4 space-y-1">
                <div className="flex justify-between py-1 px-2 text-slate-600 dark:text-slate-400">
                  <span className="font-sans">· Gastos Administrativos &amp; Licencias TIC</span>
                  <span>{formatCurrencyCOP(parametros.GastosFijosAdmin)}</span>
                </div>
                <div className="flex justify-between py-1 px-2 text-slate-600 dark:text-slate-400">
                  <span className="font-sans">· Arrendamientos (Centros Logísticos y Patios)</span>
                  <span>{formatCurrencyCOP(parametros.GastosFijosArriendos)}</span>
                </div>
                <div className="flex justify-between py-1 px-2 text-slate-600 dark:text-slate-400">
                  <span className="font-sans">· Nómina Fija de Supervisión y Operaciones</span>
                  <span>{formatCurrencyCOP(parametros.GastosFijosNomina)}</span>
                </div>
                <div className="flex justify-between py-1 px-2 text-slate-600 dark:text-slate-400">
                  <span className="font-sans">· Servicios Públicos, Conectividad y Pólizas</span>
                  <span>{formatCurrencyCOP(parametros.GastosFijosServicios)}</span>
                </div>
              </div>
            </div>

            {/* Total Gastos Fijos */}
            <div className="flex justify-between py-1 px-2 text-rose-600 dark:text-rose-400">
              <span className="font-sans">(-) Total Gastos Fijos de Operación</span>
              <span>-{formatCurrencyCOP(kpis.gastosFijosTotales)}</span>
            </div>

            {/* Gastos Variables */}
            <div className="flex justify-between py-1 px-2 text-rose-600 dark:text-rose-400">
              <span className="font-sans">(-) Gastos Variables ({formatPercent(parametros.GastosVariablesPorc)} s/ventas)</span>
              <span>-{formatCurrencyCOP(kpis.gastosVariablesTotales)}</span>
            </div>

            {/* Utilidad Operativa */}
            <div className="flex justify-between py-2.5 px-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded font-bold text-sm">
              <span className="font-sans">(=) UTILIDAD OPERATIVA (EBITDA)</span>
              <div className="text-right">
                <span>{formatCurrencyCOP(kpis.utilidadOperativa)}</span>
                <span className="text-[11px] block font-normal opacity-85">
                  Margen Operativo: {formatPercent(kpis.margenOperativoPct)}
                </span>
              </div>
            </div>

            {/* Impuestos */}
            <div className="flex justify-between py-1.5 px-2 text-slate-500">
              <span className="font-sans">(-) Provisión Impuesto Renta ({(parametros.TasaImpuestos * 100).toFixed(0)}%)</span>
              <span>-{formatCurrencyCOP(kpis.impuestosEstimados)}</span>
            </div>

            {/* Utilidad Neta */}
            <div className="flex justify-between py-2 px-2 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100">
              <span className="font-sans">(=) UTILIDAD NETA DEL EJERCICIO</span>
              <div className="text-right">
                <span>{formatCurrencyCOP(kpis.utilidadNeta)}</span>
                <span className="text-[11px] block text-emerald-600 dark:text-emerald-400 font-normal">
                  Margen Neto: {formatPercent(kpis.margenNetoPct)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Break-Even Calculator & What-If Simulator */}
        <div className="lg:col-span-6 space-y-6">
          {/* Real Break-Even Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  Ecuación del Punto de Equilibrio
                </h2>
                <p className="text-xs text-slate-500">
                  PE = Gastos Fijos / Margen de Contribución %
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Zona de Utilidad
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono tabular-nums mb-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-sans block mb-1">Punto de Equilibrio en COP</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 block">
                  {formatCurrencyCOP(kpis.puntoEquilibrioValor)}
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Ventas mínimas para no perder
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-sans block mb-1">Punto Equilibrio Unidades</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 block">
                  {kpis.puntoEquilibrioUnidades.toLocaleString()} Unid.
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Volumen físico umbral
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-sans block mb-1">Margen de Seguridad</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block">
                  +{formatPercent(kpis.margenSeguridadPct)}
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  {formatCurrencyCOP(kpis.margenSeguridadValor)} por encima
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-sans block mb-1">Apalancamiento Operativo</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 block">
                  {kpis.gradoApalancamientoOperativo}x
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Sensibilidad de utilidad ante ventas
                </span>
              </div>
            </div>

            {/* Visual Break-Even Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">PE: {formatCurrencyCOP(kpis.puntoEquilibrioValor)}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  Ventas: {formatCurrencyCOP(kpis.ventasTotales)}
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-sm relative overflow-hidden flex">
                <div
                  className="h-full bg-amber-500/80"
                  style={{ width: `${Math.min((kpis.puntoEquilibrioValor / kpis.ventasTotales) * 100, 100)}%` }}
                  title="Zona de Cobertura de Costos Fijos"
                />
                <div
                  className="h-full bg-emerald-500 flex-1"
                  title="Zona de Margen de Seguridad / Utilidad"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0 COP</span>
                <span>Cobertura Costos: {formatPercent(kpis.puntoEquilibrioValor / kpis.ventasTotales)}</span>
                <span>Margen de Ganancia: {formatPercent(kpis.margenSeguridadPct)}</span>
              </div>
            </div>
          </div>

          {/* Interactive What-If Simulator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-500" />
                Simulador de Sensibilidad Financiera (What-If)
              </h3>
              <button
                onClick={handleResetSimulation}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                title="Restablecer valores actuales"
              >
                <RotateCcw className="w-3 h-3" /> Restablecer
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Slider 1: Gastos Fijos */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Gastos Fijos Totales:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrencyCOP(simGastosFijos)}
                  </span>
                </div>
                <input
                  type="range"
                  min={10000000}
                  max={80000000}
                  step={1000000}
                  value={simGastosFijos}
                  onChange={(e) => setSimGastosFijos(Number(e.target.value))}
                  className="w-full accent-slate-900 dark:accent-white cursor-pointer"
                />
              </div>

              {/* Slider 2: Margen de Contribucion % */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Margen de Contribución (%):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {simMargenContribucionPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={1}
                  value={simMargenContribucionPct}
                  onChange={(e) => setSimMargenContribucionPct(Number(e.target.value))}
                  className="w-full accent-slate-900 dark:accent-white cursor-pointer"
                />
              </div>

              {/* Slider 3: Ventas Proyectadas */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Ventas Proyectadas:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrencyCOP(simVentas)}
                  </span>
                </div>
                <input
                  type="range"
                  min={50000000}
                  max={400000000}
                  step={5000000}
                  value={simVentas}
                  onChange={(e) => setSimVentas(Number(e.target.value))}
                  className="w-full accent-slate-900 dark:accent-white cursor-pointer"
                />
              </div>

              {/* Simulation Result Callout */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-100 dark:border-slate-800 space-y-2 font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Nuevo Punto de Equilibrio:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrencyCOP(simPuntoEquilibrioValor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Margen de Seguridad Proyectado:</span>
                  <span className={`font-bold ${simMargenSeguridadPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercent(simMargenSeguridadPct)} ({formatCurrencyCOP(simMargenSeguridadValor)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Utilidad Operativa Proyectada:</span>
                  <span className={`font-bold ${simUtilidadOperativa >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrencyCOP(simUtilidadOperativa)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
