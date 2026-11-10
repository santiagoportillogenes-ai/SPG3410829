import React, { useState, useMemo } from 'react';
import {
  FactVentaItem,
  DimRegionItem,
  DimClienteItem,
  InventarioItem,
  ParametrosFinancieros,
  SectorType,
} from './types';
import {
  INITIAL_FACT_VENTAS,
  INITIAL_DIM_REGION,
  INITIAL_DIM_CLIENTE,
  INITIAL_INVENTARIO,
  INITIAL_PARAMETROS_FINANCIEROS,
  INITIAL_EQUIVALENCIAS,
  INITIAL_MEDIDAS_DAX,
  INITIAL_EVIDENCIAS,
  SECTORES_CONFIG,
} from './data/defaultData';
import { calculateAllKPIs, recalculateFactVentaItem } from './utils/calculations';
import { exportToCSV } from './utils/ticExportImport';
import { Header } from './components/Header';
import { KPISummaryStrip } from './components/KPISummaryStrip';
import { DashboardTab } from './components/Tabs/DashboardTab';
import { InventoryTab } from './components/Tabs/InventoryTab';
import { FinancialTab } from './components/Tabs/FinancialTab';
import { DataTableTab } from './components/Tabs/DataTableTab';
import { ManagementReportTab } from './components/Tabs/ManagementReportTab';
import { DAXLibraryTab } from './components/Tabs/DAXLibraryTab';
import { FileExchangeModal } from './components/Modals/FileExchangeModal';
import { FloatingIslandDock } from './components/FloatingIslandDock';

export default function App() {
  // Main Database State
  const [ventas, setVentas] = useState<FactVentaItem[]>(INITIAL_FACT_VENTAS);
  const [regiones, setRegiones] = useState<DimRegionItem[]>(INITIAL_DIM_REGION);
  const [clientes, setClientes] = useState<DimClienteItem[]>(INITIAL_DIM_CLIENTE);
  const [inventario, setInventario] = useState<InventarioItem[]>(INITIAL_INVENTARIO);
  const [parametros, setParametros] = useState<ParametrosFinancieros>(INITIAL_PARAMETROS_FINANCIEROS);

  // App Navigation & Configuration State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedSector, setSelectedSector] = useState<SectorType>('logistica');
  const [isTICModalOpen, setIsTICModalOpen] = useState(false);
  const [isIslandOpen, setIsIslandOpen] = useState(true);

  // Active Sector Configuration
  const activeSectorConfig = SECTORES_CONFIG[selectedSector] || SECTORES_CONFIG.logistica;

  // Real-time KPI Calculation Engine
  const kpis = useMemo(() => {
    return calculateAllKPIs(ventas, regiones, clientes, inventario, parametros);
  }, [ventas, regiones, clientes, inventario, parametros]);

  // Sector Switch Handler
  const handleSectorChange = (sector: SectorType) => {
    setSelectedSector(sector);
    const config = SECTORES_CONFIG[sector];
    if (config && config.gastosFijosDefecto) {
      // Scale default fixed expenses proportionately to sector profile
      setParametros((prev) => ({
        ...prev,
        GastosFijosAdmin: Math.round(config.gastosFijosDefecto * 0.35),
        GastosFijosArriendos: Math.round(config.gastosFijosDefecto * 0.28),
        GastosFijosNomina: Math.round(config.gastosFijosDefecto * 0.27),
        GastosFijosServicios: Math.round(config.gastosFijosDefecto * 0.10),
      }));
    }
  };

  // Reset to original SENA dataset
  const handleResetOriginalData = () => {
    setVentas(INITIAL_FACT_VENTAS);
    setRegiones(INITIAL_DIM_REGION);
    setClientes(INITIAL_DIM_CLIENTE);
    setInventario(INITIAL_INVENTARIO);
    setParametros(INITIAL_PARAMETROS_FINANCIEROS);
    setSelectedSector('logistica');
  };

  // Print Report Handler
  const handlePrintReport = () => {
    if (currentTab !== 'informe') {
      setCurrentTab('informe');
      setTimeout(() => {
        window.print();
      }, 300);
    } else {
      window.print();
    }
  };

  // Handle TIC Imported Data
  const handleImportTICData = (data: {
    ventas?: FactVentaItem[];
    regiones?: DimRegionItem[];
    clientes?: DimClienteItem[];
    inventario?: InventarioItem[];
    parametros?: ParametrosFinancieros;
  }) => {
    if (data.ventas && data.ventas.length > 0) {
      setVentas(data.ventas);
    }
    if (data.regiones && data.regiones.length > 0) {
      setRegiones(data.regiones);
    }
    if (data.clientes && data.clientes.length > 0) {
      setClientes(data.clientes);
    }
    if (data.inventario && data.inventario.length > 0) {
      setInventario(data.inventario);
    }
    if (data.parametros) {
      setParametros(data.parametros);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* 1. Header with Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedSector={selectedSector}
        onSectorChange={handleSectorChange}
        onOpenTICModal={() => setIsTICModalOpen(true)}
        onPrintReport={handlePrintReport}
        onResetOriginalData={handleResetOriginalData}
        activeSectorConfig={activeSectorConfig}
        isIslandOpen={isIslandOpen}
        onToggleIsland={() => setIsIslandOpen((prev) => !prev)}
      />

      {/* 2. Floating Island Dock (Costado derecho, ocultable / colapsable) */}
      <FloatingIslandDock
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedSector={selectedSector}
        onSectorChange={handleSectorChange}
        onOpenTICModal={() => setIsTICModalOpen(true)}
        onPrintReport={handlePrintReport}
        onResetOriginalData={handleResetOriginalData}
        isOpen={isIslandOpen}
        onToggleOpen={() => setIsIslandOpen((prev) => !prev)}
      />

      {/* 3. Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Strip (Hidden in print mode) */}
        <div className="no-print">
          <KPISummaryStrip kpis={kpis} />
        </div>

        {/* Tab Content Display */}
        {currentTab === 'dashboard' && (
          <DashboardTab
            kpis={kpis}
            sectorConfig={activeSectorConfig}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'inventarios' && (
          <InventoryTab
            inventario={inventario}
            kpis={kpis}
            onUpdateInventario={setInventario}
          />
        )}

        {currentTab === 'finanzas' && (
          <FinancialTab
            kpis={kpis}
            parametros={parametros}
            onUpdateParametros={setParametros}
          />
        )}

        {currentTab === 'database' && (
          <DataTableTab
            ventas={ventas}
            regiones={regiones}
            clientes={clientes}
            onUpdateVentas={setVentas}
            onUpdateRegiones={setRegiones}
            onUpdateClientes={setClientes}
            onExportCSV={() => exportToCSV(ventas, 'FactVentas.csv', ';')}
          />
        )}

        {currentTab === 'informe' && (
          <ManagementReportTab
            kpis={kpis}
            parametros={parametros}
            sectorConfig={activeSectorConfig}
            onPrint={handlePrintReport}
          />
        )}

        {currentTab === 'dax' && (
          <DAXLibraryTab
            medidasDax={INITIAL_MEDIDAS_DAX}
            equivalencias={INITIAL_EQUIVALENCIAS}
            evidencias={INITIAL_EVIDENCIAS}
          />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Prototipo de Gestión Integral &amp; Motor de Cálculo TIC
            </span>
            <span aria-hidden="true">·</span>
            <span>SENA CTAPT 2026 · Ficha CPL_3410829</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Intercambio TIC: XLSX · CSV · JSON · XML · TXT · DAX</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsTICModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Cargar / Descargar Archivos
            </button>
          </div>
        </div>
      </footer>

      {/* 5. TIC Multi-Extension File Center Modal */}
      <FileExchangeModal
        isOpen={isTICModalOpen}
        onClose={() => setIsTICModalOpen(false)}
        ventas={ventas}
        regiones={regiones}
        clientes={clientes}
        inventario={inventario}
        parametros={parametros}
        kpis={kpis}
        medidasDax={INITIAL_MEDIDAS_DAX}
        onImportData={handleImportTICData}
        onResetOriginal={handleResetOriginalData}
      />
    </div>
  );
}
