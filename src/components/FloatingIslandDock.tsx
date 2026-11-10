import React, { useState } from 'react';
import {
  BarChart3,
  Boxes,
  DollarSign,
  Database,
  FileText,
  BookOpen,
  Download,
  Upload,
  Printer,
  RotateCcw,
  Building2,
  ChevronRight,
  ChevronLeft,
  Sliders,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from 'lucide-react';
import { SectorConfig, SectorType } from '../types';
import { SECTORES_CONFIG } from '../data/defaultData';

interface FloatingIslandDockProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  selectedSector: SectorType;
  onSectorChange: (sector: SectorType) => void;
  onOpenTICModal: () => void;
  onPrintReport: () => void;
  onResetOriginalData: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const FloatingIslandDock: React.FC<FloatingIslandDockProps> = ({
  currentTab,
  onTabChange,
  selectedSector,
  onSectorChange,
  onOpenTICModal,
  onPrintReport,
  onResetOriginalData,
  isOpen,
  onToggleOpen,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Tablero KPIs', icon: BarChart3 },
    { id: 'inventarios', label: 'Inventarios & Compras', icon: Boxes },
    { id: 'finanzas', label: 'Finanzas & Equilibrio', icon: DollarSign },
    { id: 'database', label: 'Base de Datos', icon: Database },
    { id: 'informe', label: 'Informe de Gestión', icon: FileText },
    { id: 'dax', label: 'Biblioteca DAX', icon: BookOpen },
  ];

  return (
    <aside
      aria-label="Panel flotante lateral de herramientas y navegación"
      className="fixed right-3 top-20 z-40 flex items-start no-print select-none transition-all duration-300 ease-in-out pointer-events-auto"
    >
      {/* 1. Toggle Button / Tab on Left Edge of Island */}
      <button
        onClick={onToggleOpen}
        title={isOpen ? 'Ocultar isla flotante' : 'Mostrar isla flotante de herramientas'}
        aria-label={isOpen ? 'Ocultar panel flotante' : 'Mostrar panel flotante'}
        className={`flex items-center gap-1.5 py-2 px-2.5 rounded-l-xl text-xs font-semibold shadow-lg border-y border-l transition-all duration-200 ${
          isOpen
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-700 dark:border-slate-300'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-500 shadow-emerald-600/20'
        }`}
      >
        {isOpen ? (
          <>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline text-[11px] font-medium">Ocultar</span>
          </>
        ) : (
          <>
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold tracking-tight">Acciones TIC</span>
          </>
        )}
      </button>

      {/* 2. Floating Island Card Body */}
      {isOpen && (
        <div className="w-72 max-w-[calc(100vw-3rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-r-xl rounded-b-xl shadow-2xl p-4 space-y-4 animate-in slide-in-from-right-4 fade-in-50 duration-200 max-h-[calc(100vh-6.5rem)] overflow-y-auto">
          {/* Header of Island */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Isla de Control TIC
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Herramientas y accesos directos flotantes
              </p>
            </div>
            <button
              onClick={onToggleOpen}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
              title="Minimizar panel flotante"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>

          {/* Module Navigation Tabs */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              Navegación de Módulos
            </span>
            <div className="grid grid-cols-1 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Island: TIC Exchange & Export Tools */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Operaciones &amp; Archivos TIC
            </span>

            {/* TIC File Exchange Button */}
            <button
              onClick={onOpenTICModal}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 shrink-0" />
                <Upload className="w-4 h-4 shrink-0" />
                <span>Archivos TIC</span>
              </div>
              <span className="text-[10px] font-mono opacity-85">XLSX/CSV/JSON</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              onClick={onPrintReport}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>Imprimir / Exportar PDF</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Ctrl+P</span>
            </button>

            {/* Reset Dataset SENA */}
            <button
              onClick={() => {
                if (window.confirm('¿Desea restablecer todas las tablas al dataset SENA original?')) {
                  onResetOriginalData();
                }
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Restablecer Datos SENA</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Default</span>
            </button>
          </div>

          {/* Sector Selector Island */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              Sector Económico Activo
            </span>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedSector}
                onChange={(e) => onSectorChange(e.target.value as SectorType)}
                aria-label="Seleccionar sector económico"
                className="w-full text-xs pl-8 pr-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {Object.values(SECTORES_CONFIG).map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.id === 'logistica' ? '★ ' + sec.nombre : sec.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
