import React from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  Scale,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { CalculatedKPIs } from '../types';
import { formatCurrencyCOP, formatPercent } from '../utils/calculations';

interface KPISummaryStripProps {
  kpis: CalculatedKPIs;
}

export const KPISummaryStrip: React.FC<KPISummaryStripProps> = ({ kpis }) => {
  const cards = [
    {
      title: 'Ventas Totales Netas',
      value: formatCurrencyCOP(kpis.ventasTotales),
      metaKicker: `Meta: ${formatCurrencyCOP(kpis.metaTotal)}`,
      statusText: `${formatPercent(kpis.cumplimientoTotal)} Cumplimiento`,
      subDetail: `Bruto: ${formatCurrencyCOP(kpis.ventasBrutas)} · Dcto: ${formatPercent(kpis.descuentoEfectivoPct)}`,
      icon: TrendingUp,
      statusColor: kpis.cumplimientoTotal >= 1.0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400',
    },
    {
      title: 'Rotación de Inventarios',
      value: `${kpis.rotacionInventarioGlobal}x`,
      metaKicker: `Ciclo: ${kpis.diasInventarioGlobal} Días`,
      statusText: kpis.rotacionInventarioGlobal >= 5 ? 'Rotación Alta' : 'Rotación Moderada',
      subDetail: `Inv. Promedio: ${formatCurrencyCOP(kpis.inventarioPromedioValor)}`,
      icon: Package,
      statusColor: 'text-indigo-700 dark:text-indigo-400',
    },
    {
      title: 'Utilidad Operativa (EBITDA)',
      value: formatCurrencyCOP(kpis.utilidadOperativa),
      metaKicker: `Margen Op: ${formatPercent(kpis.margenOperativoPct)}`,
      statusText: `Neta: ${formatCurrencyCOP(kpis.utilidadNeta)}`,
      subDetail: `Utilidad Bruta: ${formatCurrencyCOP(kpis.utilidadBruta)} (${formatPercent(kpis.margenBrutoPct)})`,
      icon: DollarSign,
      statusColor: kpis.utilidadOperativa > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400',
    },
    {
      title: 'Punto de Equilibrio',
      value: formatCurrencyCOP(kpis.puntoEquilibrioValor),
      metaKicker: `${kpis.puntoEquilibrioUnidades.toLocaleString()} Unidades`,
      statusText: `Seguridad: +${formatPercent(kpis.margenSeguridadPct)}`,
      subDetail: `Gastos Fijos: ${formatCurrencyCOP(kpis.gastosFijosTotales)}`,
      icon: Scale,
      statusColor: kpis.margenSeguridadPct > 0.2 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400',
    },
    {
      title: 'Costo de Ventas (CMV) & Compras',
      value: formatCurrencyCOP(kpis.cmvTotal),
      metaKicker: `Compras: ${formatCurrencyCOP(kpis.comprasTotales)}`,
      statusText: `${formatPercent(kpis.cmvTotal / (kpis.ventasTotales || 1))} de las Ventas`,
      subDetail: `Margen Contribución: ${formatPercent(kpis.margenContribucionPct)}`,
      icon: ShoppingCart,
      statusColor: 'text-slate-700 dark:text-slate-300',
    },
    {
      title: 'Ticket Promedio & Clientes',
      value: formatCurrencyCOP(kpis.ticketPromedio),
      metaKicker: `${kpis.totalPedidos} Pedidos Únicos`,
      statusText: `${kpis.totalClientes} Clientes Activos`,
      subDetail: `Precio Prom. Unitario: ${formatCurrencyCOP(kpis.precioNetoPromedioPorUnidad)}`,
      icon: Users,
      statusColor: 'text-slate-700 dark:text-slate-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex flex-col justify-between transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {card.title}
                </span>
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              <div className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {card.value}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              {/* Clean unboxed text metadata with typographic separator */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`font-semibold ${card.statusColor}`}>{card.statusText}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-slate-500 dark:text-slate-400 truncate">{card.metaKicker}</span>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                {card.subDetail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
