import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CalculatedKPIs, SectorConfig } from '../../types';
import { formatCurrencyCOP, formatPercent } from '../../utils/calculations';

interface DashboardTabProps {
  kpis: CalculatedKPIs;
  sectorConfig: SectorConfig;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  kpis,
  sectorConfig,
  onNavigateToTab,
}) => {
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  const maxMonthSales = Math.max(...kpis.porMes.map((m) => m.ventas), 1);
  const maxRegionSales = Math.max(...kpis.porRegion.map((r) => Math.max(r.ventas, r.meta)), 1);

  return (
    <div className="space-y-6">
      {/* 2-Column Split: Regional Goal Achievement & Monthly Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Regional Performance vs Goal */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cumplimiento de Metas por Región
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Medida DAX: % Cumplimiento = DIVIDE([Ventas Totales], [Meta Ventas])
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Cumplimiento Global</span>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {formatPercent(kpis.cumplimientoTotal)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {kpis.porRegion.map((r) => {
              const pctOfMax = (r.ventas / maxRegionSales) * 100;
              const metaPctOfMax = (r.meta / maxRegionSales) * 100;
              const isSuperada = r.cumplimiento >= 1.0;

              return (
                <div key={r.region} className="border-b border-slate-100 dark:border-slate-800/80 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{r.region}</span>
                      <span className="text-slate-400 text-[11px]">({r.departamento})</span>
                      {isSuperada ? (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Meta Lograda
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> Brecha: {formatCurrencyCOP(r.meta - r.ventas)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums text-right">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrencyCOP(r.ventas)}
                      </span>
                      <span className="text-slate-400">/ {formatCurrencyCOP(r.meta)}</span>
                      <span className={`w-16 font-bold ${isSuperada ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {formatPercent(r.cumplimiento)}
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar (Actual vs Meta) */}
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-sm relative overflow-hidden">
                    {/* Meta indicator marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10"
                      style={{ left: `${Math.min(metaPctOfMax, 100)}%` }}
                      title={`Meta: ${formatCurrencyCOP(r.meta)}`}
                    />
                    {/* Sales progress fill */}
                    <div
                      className={`h-full transition-all duration-300 ${
                        isSuperada ? 'bg-emerald-500' : 'bg-slate-700 dark:bg-slate-400'
                      }`}
                      style={{ width: `${Math.min(pctOfMax, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{r.pedidos} pedidos · Ticket: {formatCurrencyCOP(r.ticketPromedio)}</span>
                    <span>Participación: {formatPercent(r.participacion)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Monthly Evolution & MoM Growth */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Evolución Mensual &amp; MoM
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ventas por DimFecha[Mes] y Var % MoM
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">Semestre 2026</span>
            </div>

            {/* Monthly Bar Chart */}
            <div className="space-y-2.5">
              {kpis.porMes.map((m) => {
                const heightPct = (m.ventas / maxMonthSales) * 100;
                return (
                  <div key={m.mes} className="flex items-center gap-3 text-xs">
                    <span className="w-14 font-medium text-slate-600 dark:text-slate-400 shrink-0">
                      {m.nombreMes}
                    </span>
                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-sm relative overflow-hidden flex items-center">
                      <div
                        className="h-full bg-slate-800 dark:bg-slate-200 transition-all duration-300"
                        style={{ width: `${heightPct}%` }}
                      />
                      <span className="absolute left-2 text-[11px] font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 mix-blend-difference">
                        {formatCurrencyCOP(m.ventas)}
                      </span>
                    </div>
                    <div className="w-20 text-right font-mono tabular-nums shrink-0">
                      {m.varMoM !== null ? (
                        <span
                          className={`flex items-center justify-end text-[11px] font-semibold ${
                            m.varMoM >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {m.varMoM >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {formatPercent(m.varMoM)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Base</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>Ventas Acumuladas YTD (Junio):</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrencyCOP(kpis.porMes[kpis.porMes.length - 1]?.ventasYTD || kpis.ventasTotales)}
            </span>
          </div>
        </div>
      </div>

      {/* Second Row: Service Distribution, Break-Even Threshold, Client Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Service Breakdown (CALCULATE) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              Ingresos por Servicio
            </h3>
            <span className="text-xs text-slate-500 font-mono">CALCULATE</span>
          </div>

          <div className="space-y-3">
            {kpis.porServicio.map((s) => (
              <div key={s.servicio} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{s.servicio}</span>
                  <div className="font-mono tabular-nums text-right">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrencyCOP(s.ventas)}
                    </span>
                    <span className="text-slate-400 ml-1.5">({formatPercent(s.participacion)})</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-800 dark:bg-slate-300"
                    style={{ width: `${s.participacion * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{s.pedidos} despachos · {s.unidades} unidades</span>
                  <span>Margen Bruto: {formatCurrencyCOP(s.utilidadBruta)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Break-Even Gauge */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Diagnóstico Punto de Equilibrio
            </h3>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +{formatPercent(kpis.margenSeguridadPct)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Las ventas netas superan el punto de equilibrio en{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-mono">
                {formatCurrencyCOP(kpis.margenSeguridadValor)}
              </strong>
              , garantizando un margen de seguridad robusto frente a caídas de demanda.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md space-y-2 border border-slate-100 dark:border-slate-800 font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-500">Punto de Equilibrio:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrencyCOP(kpis.puntoEquilibrioValor)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unidades de Equilibrio:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {kpis.puntoEquilibrioUnidades.toLocaleString()} unid.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Apalancamiento Operativo (GAO):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {kpis.gradoApalancamientoOperativo}x
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('finanzas')}
              className="text-xs text-slate-900 dark:text-slate-100 font-semibold hover:underline flex items-center gap-1 mt-1"
            >
              Ver simulador de sensibilidad financiero <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Client Ranking (Oro / Plata / Bronce) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Ranking de Clientes (Pareto)
            </h3>
            <span className="text-xs text-slate-500 font-mono">RANKX</span>
          </div>

          <div className="space-y-2">
            {kpis.porCliente.slice(0, 5).map((c) => (
              <div
                key={c.clienteId}
                className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-mono font-bold text-slate-400">
                    #{c.ranking}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {c.nombre}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {c.clienteId} · {c.region}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100 block tabular-nums">
                    {formatCurrencyCOP(c.ventas)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase ${
                      c.segmento === 'Oro'
                        ? 'text-amber-600 dark:text-amber-400'
                        : c.segmento === 'Plata'
                        ? 'text-slate-600 dark:text-slate-300'
                        : 'text-amber-800 dark:text-amber-600'
                    }`}
                  >
                    Nivel {c.segmento}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateToTab('database')}
            className="text-xs text-slate-900 dark:text-slate-100 font-semibold hover:underline flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 w-full"
          >
            Ver todos los 8 clientes en base de datos <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
