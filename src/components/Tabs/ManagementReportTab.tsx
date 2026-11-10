import React from 'react';
import {
  FileText,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Building,
  Calendar,
} from 'lucide-react';
import { CalculatedKPIs, ParametrosFinancieros, SectorConfig } from '../../types';
import { formatCurrencyCOP, formatPercent } from '../../utils/calculations';

interface ManagementReportTabProps {
  kpis: CalculatedKPIs;
  parametros: ParametrosFinancieros;
  sectorConfig: SectorConfig;
  onPrint: () => void;
}

export const ManagementReportTab: React.FC<ManagementReportTabProps> = ({
  kpis,
  parametros,
  sectorConfig,
  onPrint,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="no-print flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            Informe Ejecutivo de Gestión Administrativa y Financiera
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generado conforme a los estándares curriculares SENA Ficha CPL_3410829 · 2026
          </p>
        </div>

        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Exportar a PDF</span>
        </button>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 rounded-lg shadow-xs max-w-5xl mx-auto print:border-0 print:p-0">
        {/* Header Document Block */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-1">
              SERVICIO NACIONAL DE APRENDIZAJE · SENA CTAPT
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              INFORME DE GESTIÓN GERENCIAL Y MODELO DE CÁLCULO
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Sector: {sectorConfig.nombre} · {sectorConfig.subtitulo}
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-500 space-y-1">
            <div><span className="font-semibold text-slate-700 dark:text-slate-300">Ficha:</span> CPL_3410829</div>
            <div><span className="font-semibold text-slate-700 dark:text-slate-300">Fecha:</span> {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div><span className="font-semibold text-slate-700 dark:text-slate-300">Período:</span> Semestre I - 2026</div>
          </div>
        </div>

        {/* 1. Executive Summary Strip */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            01. Balance Consolidado de Desempeño
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 font-mono tabular-nums text-xs">
            <div>
              <span className="text-slate-500 font-sans block text-[11px]">Ventas Netas</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 block">
                {formatCurrencyCOP(kpis.ventasTotales)}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                Cumplimiento: {formatPercent(kpis.cumplimientoTotal)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-sans block text-[11px]">Utilidad Operativa</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block">
                {formatCurrencyCOP(kpis.utilidadOperativa)}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                Margen Op: {formatPercent(kpis.margenOperativoPct)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-sans block text-[11px]">Rotación Inventarios</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 block">
                {kpis.rotacionInventarioGlobal}x / Sem.
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                Ciclo DSI: {kpis.diasInventarioGlobal} días
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-sans block text-[11px]">Margen de Seguridad</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 block">
                +{formatPercent(kpis.margenSeguridadPct)}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                PE: {formatCurrencyCOP(kpis.puntoEquilibrioValor)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Three Findings for Management (Requisito Sesión 4 SENA) */}
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            02. Tres Hallazgos Estratégicos para la Gerencia (Sesión 4 DAX)
          </h2>

          <div className="space-y-4 text-xs">
            {/* Finding 1 */}
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1. Sobrecumplimiento en Urabá y Bogotá vs. Brecha Presupuestal en Costa</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Aunque la región <strong>Costa</strong> concentra el mayor volumen nominal de facturación con{' '}
                <span className="font-mono font-semibold">{formatCurrencyCOP(kpis.porRegion.find((r) => r.region === 'Costa')?.ventas || 0)}</span>{' '}
                (39.73% de participación), su cumplimiento alcanzó el <strong>88.94%</strong> frente a su meta de $96M. Por el contrario,{' '}
                <strong>Urabá</strong> superó su meta alcanzando un <strong>106.41%</strong> ($38.3M vs $36M) y{' '}
                <strong>Bogotá</strong> un <strong>103.16%</strong> ($49.5M vs $48M). Esto evidencia una altísima tracción comercial en la zona bananera y el altiplano.
              </p>
            </div>

            {/* Finding 2 */}
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>2. Concentración Crítica en Transporte y Margen Superior de Distribución</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                El servicio de <strong>Transporte</strong> genera <strong>$144,922,000</strong>, equivalente al{' '}
                <strong>67.43%</strong> del total facturado, lo que genera una alta dependencia de costos de combustible, fletes y peajes. En contraste,{' '}
                <strong>Distribución urbana</strong> aporta un margen de contribución porcentual más eficiente con un ticket promedio de mayor frecuencia.{' '}
                <strong>Almacenamiento</strong> presenta una rotación ágil de 6.2x pero con menor ticket unitario, requiriendo empaquetamiento comercial cruzado.
              </p>
            </div>

            {/* Finding 3 */}
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>3. Fuga de Ingresos por Descuentos y Calidad del Dato en Facturación</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Los descuentos comerciales otorgados sumaron{' '}
                <span className="font-mono font-semibold">{formatCurrencyCOP(kpis.descuentosTotales)}</span>, representando una tasa efectiva del{' '}
                <strong>4.21%</strong> sobre el valor bruto. Asimismo, la medida DAX <code className="font-mono">COUNTBLANK(FactVentas[DescuentoPct])</code> identificó{' '}
                <strong>2 pedidos con descuento vacío</strong> (P004 y P024), lo cual representa un riesgo de inconsistencia que debe subsanarse mediante validación obligatoria en el sistema transaccional.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Financial Diagnosis & Break-Even Evaluation */}
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            03. Diagnóstico de Salud Financiera y Punto de Equilibrio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Evaluación de Rentabilidad</h3>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>• <strong>Margen Bruto:</strong> {formatPercent(kpis.margenBrutoPct)} (Utilidad Bruta: {formatCurrencyCOP(kpis.utilidadBruta)}).</li>
                <li>• <strong>Margen Operativo (EBITDA):</strong> {formatPercent(kpis.margenOperativoPct)}, reflejando suficiente absorción de costos fijos.</li>
                <li>• <strong>Margen Neto:</strong> {formatPercent(kpis.margenNetoPct)} tras provisión de impuesto sobre la renta del 33%.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Solvencia y Apalancamiento</h3>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>• <strong>Punto de Equilibrio:</strong> Se alcanza a los {formatCurrencyCOP(kpis.puntoEquilibrioValor)} ({kpis.puntoEquilibrioUnidades.toLocaleString()} unidades).</li>
                <li>• <strong>Margen de Seguridad:</strong> +{formatPercent(kpis.margenSeguridadPct)}, lo cual permite tolerar contracciones del mercado sin incurrir en pérdidas.</li>
                <li>• <strong>Grado de Apalancamiento (GAO):</strong> {kpis.gradoApalancamientoOperativo}x.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Action Plan & Recommendations */}
        <div className="mb-10 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            04. Recomendaciones de Optimización Operativa
          </h2>
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">1.</span>
              <span><strong>Fidelización de Clientes Oro:</strong> Desarrollar acuerdos marco a largo plazo con Puerto Épsilon (C05), Logística Theta (C08) y Frutas Eta (C07), quienes aportan el 54.3% de la facturación global.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">2.</span>
              <span><strong>Política de Control de Descuentos:</strong> Establecer un tope máximo discrecional del 5% para pedidos regulares y exigir autorización gerencial para descuentos del 8% al 10%.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">3.</span>
              <span><strong>Sincronización de Inventarios y Rutas:</strong> Reducir el stock de seguridad en precintos y película stretch film para elevar el flujo de caja, manteniendo el ciclo DSI bajo 35 días.</span>
            </div>
          </div>
        </div>

        {/* 5. Formal Signatures Block */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6 text-center text-xs break-inside-avoid">
          <div>
            <div className="border-b border-slate-400 pb-8 mb-2"></div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              Alfredo de Jesús Pérez Méndez
            </span>
            <span className="text-[11px] text-slate-500 block">
              Instructor SENA · Gestión Administrativa y Financiera
            </span>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-8 mb-2"></div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              Dirección General de Operaciones
            </span>
            <span className="text-[11px] text-slate-500 block">
              Gerencia y Logística Integral
            </span>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-8 mb-2"></div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              Dirección Financiera &amp; Control Interno
            </span>
            <span className="text-[11px] text-slate-500 block">
              Contabilidad, Presupuestos y Auditoría TIC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
