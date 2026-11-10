import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  FileJson,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  FactVentaItem,
  DimRegionItem,
  DimClienteItem,
  InventarioItem,
  ParametrosFinancieros,
  CalculatedKPIs,
  MedidaDAX,
} from '../../types';
import {
  exportToExcel,
  exportToCSV,
  exportToJSON,
  exportToXML,
  exportToTXT,
  exportToDAXScript,
  parseUploadedTICFile,
} from '../../utils/ticExportImport';

interface FileExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ventas: FactVentaItem[];
  regiones: DimRegionItem[];
  clientes: DimClienteItem[];
  inventario: InventarioItem[];
  parametros: ParametrosFinancieros;
  kpis: CalculatedKPIs;
  medidasDax: MedidaDAX[];
  onImportData: (data: {
    ventas?: FactVentaItem[];
    regiones?: DimRegionItem[];
    clientes?: DimClienteItem[];
    inventario?: InventarioItem[];
    parametros?: ParametrosFinancieros;
  }) => void;
  onResetOriginal: () => void;
}

export const FileExchangeModal: React.FC<FileExchangeModalProps> = ({
  isOpen,
  onClose,
  ventas,
  regiones,
  clientes,
  inventario,
  parametros,
  kpis,
  medidasDax,
  onImportData,
  onResetOriginal,
}) => {
  const [csvSeparator, setCsvSeparator] = useState<',' | ';'>(',');
  const [selectedExportTable, setSelectedExportTable] = useState<'ventas' | 'inventarios' | 'kpis'>('ventas');
  const [uploadStatus, setUploadStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus({ loading: true });
    const result = await parseUploadedTICFile(file);

    if (result.success) {
      onImportData({
        ventas: result.ventas,
        regiones: result.regiones,
        clientes: result.clientes,
        inventario: result.inventario,
        parametros: result.parametros,
      });
      setUploadStatus({
        loading: false,
        success: true,
        message: result.message,
      });
    } else {
      setUploadStatus({
        loading: false,
        success: false,
        message: result.message,
      });
    }
  };

  const handleDownloadExcel = () => {
    exportToExcel(ventas, regiones, clientes, inventario, kpis, medidasDax);
  };

  const handleDownloadCSV = () => {
    let dataToExport: object[] = ventas;
    let fileName = `FactVentas_${csvSeparator === ',' ? 'coma' : 'puntoycoma'}.csv`;

    if (selectedExportTable === 'inventarios') {
      dataToExport = inventario;
      fileName = 'Inventarios_y_Compras.csv';
    } else if (selectedExportTable === 'kpis') {
      dataToExport = kpis.porRegion;
      fileName = 'Resumen_Regiones_KPIs.csv';
    }

    exportToCSV(dataToExport, fileName, csvSeparator);
  };

  const handleDownloadJSON = () => {
    exportToJSON(ventas, regiones, clientes, inventario, parametros, kpis);
  };

  const handleDownloadXML = () => {
    exportToXML(ventas, regiones, clientes, inventario, kpis);
  };

  const handleDownloadTXT = () => {
    exportToTXT(kpis, parametros);
  };

  const handleDownloadDAX = () => {
    exportToDAXScript(medidasDax);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              Centro de Intercambio de Archivos TIC
            </h2>
            <p className="text-xs text-slate-500">
              Carga y descarga en cualquier extensión estándar TIC: XLSX, CSV, JSON, XML, TXT, DAX
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: CARGAR ARCHIVOS (UPLOAD) */}
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-5 text-center bg-slate-50/50 dark:bg-slate-800/30">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Cargar Archivo al Motor de Cálculo
            </h3>
            <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
              Seleccione o arrastre su archivo en formato <strong>.XLSX, .XLS, .CSV, .JSON o .XML</strong>. El motor detectará automáticamente las columnas y actualizará los KPIs.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv,.json,.xml,.txt"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 rounded-md shadow-xs transition-colors"
            >
              Examinar Archivo en el Equipo
            </button>

            {/* Status message */}
            {uploadStatus.loading && (
              <div className="mt-3 text-xs text-slate-500 font-mono">Procesando archivo...</div>
            )}
            {uploadStatus.message && (
              <div
                className={`mt-3 p-2.5 rounded text-xs flex items-center justify-center gap-2 ${
                  uploadStatus.success
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {uploadStatus.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{uploadStatus.message}</span>
              </div>
            )}
          </div>

          {/* SECTION 2: DESCARGAR ARCHIVOS (EXPORT) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Descargar Datos y Reportes TIC
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Option 1: Excel Multi-Sheet */}
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Libro de Excel (.XLSX)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Multi-hoja con FactVentas, DimRegion, DimCliente, Inventarios y KPIs.
                  </p>
                </div>
                <button
                  onClick={handleDownloadExcel}
                  className="w-full py-1.5 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded transition-colors text-center"
                >
                  Descargar .xlsx
                </button>
              </div>

              {/* Option 2: CSV con Separador */}
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>Valores Separados (.CSV)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span>Separador:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <button
                        onClick={() => setCsvSeparator(',')}
                        className={`px-1.5 py-0.5 rounded text-[10px] ${csvSeparator === ',' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold' : 'bg-slate-100 dark:bg-slate-800'}`}
                      >
                        Coma (,)
                      </button>
                      <button
                        onClick={() => setCsvSeparator(';')}
                        className={`px-1.5 py-0.5 rounded text-[10px] ${csvSeparator === ';' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold' : 'bg-slate-100 dark:bg-slate-800'}`}
                      >
                        Punto y Coma (;)
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadCSV}
                  className="w-full py-1.5 px-3 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded transition-colors text-center"
                >
                  Descargar .csv
                </button>
              </div>

              {/* Option 3: JSON TIC Standard */}
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <FileJson className="w-4 h-4 text-amber-600" />
                    <span>Estructura JSON (.JSON)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Intercambio RFC 8259 con metadatos y modelo completo relacional.
                  </p>
                </div>
                <button
                  onClick={handleDownloadJSON}
                  className="w-full py-1.5 px-3 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded transition-colors text-center"
                >
                  Descargar .json
                </button>
              </div>

              {/* Option 4: XML W3C Standard */}
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    <span>Esquema XML (.XML)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Estándar W3C para interoperabilidad con sistemas legados y ERPs.
                  </p>
                </div>
                <button
                  onClick={handleDownloadXML}
                  className="w-full py-1.5 px-3 text-xs font-medium text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded transition-colors text-center"
                >
                  Descargar .xml
                </button>
              </div>

              {/* Option 5: TXT Balance Report */}
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>Informe Plano (.TXT)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Documento de texto con balance tabulado de gestión y KPIs.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTXT}
                  className="w-full py-1.5 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded transition-colors text-center"
                >
                  Descargar .txt
                </button>
              </div>

              {/* Option 6: DAX Script for Power BI */}
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <FileCode className="w-4 h-4 text-purple-600" />
                    <span>Medidas DAX (.DAX)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Script con las 28 fórmulas para copiar en Power BI Desktop.
                  </p>
                </div>
                <button
                  onClick={handleDownloadDAX}
                  className="w-full py-1.5 px-3 text-xs font-medium text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded transition-colors text-center"
                >
                  Descargar .dax
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('¿Desea restablecer todas las tablas al dataset SENA original?')) {
                onResetOriginal();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Dataset Original SENA</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
