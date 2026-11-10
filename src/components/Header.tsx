import React from 'react';
import {
  Sliders,
  Building2,
  Download,
  Upload,
  Printer,
  RotateCcw,
} from 'lucide-react';
import { SectorConfig, SectorType } from '../types';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  selectedSector: SectorType;
  onSectorChange: (sector: SectorType) => void;
  onOpenTICModal: () => void;
  onPrintReport: () => void;
  onResetOriginalData: () => void;
  activeSectorConfig: SectorConfig;
  isIslandOpen: boolean;
  onToggleIsland: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  selectedSector,
  onSectorChange,
  onOpenTICModal,
  onPrintReport,
  onResetOriginalData,
  activeSectorConfig,
  isIslandOpen,
  onToggleIsland,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Tablero KPIs' },
    { id: 'inventarios', label: 'Inventarios & Compras' },
    { id: 'finanzas', label: 'Finanzas & Equilibrio' },
    { id: 'database', label: 'Base de Datos' },
    { id: 'informe', label: 'Informe de Gestión' },
    { id: 'dax', label: 'Biblioteca DAX' },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 transition-colors">
      {/* Top 3-Zone Contract Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs">
            TIC
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Gestión Integral · SENA
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Ficha CPL_3410829 · Motor DAX
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean, non-scrolling) */}
        <nav className="hidden md:flex items-center gap-1 py-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Floating Island Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick TIC modal access */}
          <button
            onClick={onOpenTICModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0"
            title="Cargar y descargar datos en XLSX, CSV, JSON, XML, TXT, DAX"
          >
            <Download className="w-3.5 h-3.5" />
            <Upload className="w-3.5 h-3.5" />
            <span>Archivos TIC</span>
          </button>

          {/* Toggle Button for the Right-Side Floating Island */}
          <button
            onClick={onToggleIsland}
            aria-label="Abrir panel flotante lateral de herramientas"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all whitespace-nowrap shrink-0 ${
              isIslandOpen
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isIslandOpen ? 'Ocultar Isla' : 'Isla Flotante'}</span>
          </button>
        </div>
      </div>

      {/* Active Sector Informational Strip */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Sector:</span>
          <span>{activeSectorConfig.nombre}</span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="text-slate-500">{activeSectorConfig.subtitulo}</span>
        </div>
        <div className="flex items-center gap-3 font-mono tabular-nums text-slate-500 text-[11px]">
          <span>51 Líneas</span>
          <span aria-hidden="true">·</span>
          <span>4 Regiones</span>
          <span aria-hidden="true">·</span>
          <span>8 Clientes</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Motor DAX Activo</span>
        </div>
      </div>
    </header>
  );
};
