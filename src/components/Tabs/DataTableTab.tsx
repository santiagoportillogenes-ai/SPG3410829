import React, { useState } from 'react';
import {
  Table,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  Filter,
  Download,
  Database,
  MapPin,
  Users,
} from 'lucide-react';
import { FactVentaItem, DimRegionItem, DimClienteItem } from '../../types';
import { formatCurrencyCOP, formatPercent, recalculateFactVentaItem } from '../../utils/calculations';

interface DataTableTabProps {
  ventas: FactVentaItem[];
  regiones: DimRegionItem[];
  clientes: DimClienteItem[];
  onUpdateVentas: (ventas: FactVentaItem[]) => void;
  onUpdateRegiones: (regiones: DimRegionItem[]) => void;
  onUpdateClientes: (clientes: DimClienteItem[]) => void;
  onExportCSV: () => void;
}

export const DataTableTab: React.FC<DataTableTabProps> = ({
  ventas,
  regiones,
  clientes,
  onUpdateVentas,
  onUpdateRegiones,
  onUpdateClientes,
  onExportCSV,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ventas' | 'regiones' | 'clientes'>('ventas');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [servicioFilter, setServicioFilter] = useState('all');

  // Editing state for FactVentas
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<Partial<FactVentaItem>>({});

  // Adding new sale
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [newSale, setNewSale] = useState<Partial<FactVentaItem>>({
    PedidoID: `P0${ventas.length + 1}`,
    Fecha: '2026-06-25',
    Región: 'Costa',
    Servicio: 'Transporte',
    ClienteID: 'C05',
    Cantidad: 10,
    PrecioUnitario: 550000,
    DescuentoPct: 0.05,
    Mes: 6,
  });

  // Filtered sales
  const filteredVentas = ventas.filter((v) => {
    const matchSearch =
      v.PedidoID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ClienteID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.Servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.Región.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRegion = regionFilter === 'all' || v.Región === regionFilter;
    const matchServicio = servicioFilter === 'all' || v.Servicio === servicioFilter;

    return matchSearch && matchRegion && matchServicio;
  });

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditRow({ ...ventas[index] });
  };

  const handleSaveEdit = (index: number) => {
    const updated = [...ventas];
    updated[index] = recalculateFactVentaItem({
      ...updated[index],
      ...editRow,
    });
    onUpdateVentas(updated);
    setEditingIndex(null);
  };

  const handleDeleteSale = (index: number) => {
    const updated = ventas.filter((_, idx) => idx !== index);
    onUpdateVentas(updated);
  };

  const handleAddSale = () => {
    const calculated = recalculateFactVentaItem(newSale);
    onUpdateVentas([calculated, ...ventas]);
    setIsAddingSale(false);
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation for Tables */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('ventas')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'ventas'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>FactVentas ({ventas.length} líneas)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('regiones')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'regiones'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>DimRegion ({regiones.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('clientes')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'clientes'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>DimCliente ({clientes.length})</span>
          </button>
        </div>

        {activeSubTab === 'ventas' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingSale(!isAddingSale)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingSale ? 'Cerrar Formulario' : 'Nueva Venta'}</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-md transition-colors"
              title="Descargar tabla en CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: FACT VENTAS */}
      {activeSubTab === 'ventas' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          {/* Filters Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar pedido, cliente, servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Region Filter */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Región:</span>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Todas ({ventas.length})</option>
                  {regiones.map((r) => (
                    <option key={r.Región} value={r.Región}>
                      {r.Región}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicio Filter */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Servicio:</span>
                <select
                  value={servicioFilter}
                  onChange={(e) => setServicioFilter(e.target.value)}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Todos</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Distribución">Distribución</option>
                  <option value="Almacenamiento">Almacenamiento</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Sale Form */}
          {isAddingSale && (
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-800 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                Registrar Nueva Operación de Venta
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Pedido ID</label>
                  <input
                    type="text"
                    value={newSale.PedidoID || ''}
                    onChange={(e) => setNewSale({ ...newSale, PedidoID: e.target.value })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newSale.Fecha || ''}
                    onChange={(e) => setNewSale({ ...newSale, Fecha: e.target.value })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Región</label>
                  <select
                    value={newSale.Región || 'Costa'}
                    onChange={(e) => setNewSale({ ...newSale, Región: e.target.value })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded"
                  >
                    {regiones.map((r) => (
                      <option key={r.Región} value={r.Región}>{r.Región}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Servicio</label>
                  <select
                    value={newSale.Servicio || 'Transporte'}
                    onChange={(e) => setNewSale({ ...newSale, Servicio: e.target.value })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded"
                  >
                    <option value="Transporte">Transporte</option>
                    <option value="Distribución">Distribución</option>
                    <option value="Almacenamiento">Almacenamiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Cliente</label>
                  <select
                    value={newSale.ClienteID || 'C01'}
                    onChange={(e) => setNewSale({ ...newSale, ClienteID: e.target.value })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded"
                  >
                    {clientes.map((c) => (
                      <option key={c.ClienteID} value={c.ClienteID}>
                        {c.ClienteID} - {c.NombreCliente}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Cantidad</label>
                  <input
                    type="number"
                    value={newSale.Cantidad || 1}
                    onChange={(e) => setNewSale({ ...newSale, Cantidad: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Precio Unit.</label>
                  <input
                    type="number"
                    value={newSale.PrecioUnitario || 0}
                    onChange={(e) => setNewSale({ ...newSale, PrecioUnitario: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Dcto (e.g. 0.05)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={newSale.DescuentoPct ?? ''}
                    onChange={(e) =>
                      setNewSale({
                        ...newSale,
                        DescuentoPct: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingSale(false)}
                  className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSale}
                  className="px-4 py-1 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Guardar Venta
                </button>
              </div>
            </div>
          )}

          {/* Table Data */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2 px-3 font-semibold">PedidoID</th>
                  <th className="py-2 px-3 font-semibold">Fecha</th>
                  <th className="py-2 px-3 font-semibold">Región</th>
                  <th className="py-2 px-3 font-semibold">Servicio</th>
                  <th className="py-2 px-3 font-semibold">ClienteID</th>
                  <th className="py-2 px-3 font-semibold text-right">Cantidad</th>
                  <th className="py-2 px-3 font-semibold text-right">Precio Unit.</th>
                  <th className="py-2 px-3 font-semibold text-right">Descuento</th>
                  <th className="py-2 px-3 font-semibold text-right text-emerald-700 dark:text-emerald-400">
                    Importe (Neto)
                  </th>
                  <th className="py-2 px-3 font-semibold text-right">Precio Neto</th>
                  <th className="py-2 px-3 font-semibold text-right">Bruto</th>
                  <th className="py-2 px-3 font-semibold text-center">Mes</th>
                  <th className="py-2 px-3 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono tabular-nums">
                {filteredVentas.map((v, idx) => {
                  const isEditing = editingIndex === idx;

                  return (
                    <tr
                      key={`${v.PedidoID}-${v.Servicio}-${idx}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {v.PedidoID}
                      </td>

                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        {v.Fecha.split(' ')[0]}
                      </td>

                      <td className="py-2 px-3 font-sans">
                        {isEditing ? (
                          <select
                            value={editRow.Región ?? v.Región}
                            onChange={(e) => setEditRow({ ...editRow, Región: e.target.value })}
                            className="bg-white dark:bg-slate-800 border rounded px-1 py-0.5"
                          >
                            {regiones.map((r) => (
                              <option key={r.Región} value={r.Región}>{r.Región}</option>
                            ))}
                          </select>
                        ) : (
                          v.Región
                        )}
                      </td>

                      <td className="py-2 px-3 font-sans">
                        {isEditing ? (
                          <select
                            value={editRow.Servicio ?? v.Servicio}
                            onChange={(e) => setEditRow({ ...editRow, Servicio: e.target.value })}
                            className="bg-white dark:bg-slate-800 border rounded px-1 py-0.5"
                          >
                            <option value="Transporte">Transporte</option>
                            <option value="Distribución">Distribución</option>
                            <option value="Almacenamiento">Almacenamiento</option>
                          </select>
                        ) : (
                          v.Servicio
                        )}
                      </td>

                      <td className="py-2 px-3">
                        {v.ClienteID}
                      </td>

                      {/* Cantidad */}
                      <td className="py-2 px-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editRow.Cantidad ?? v.Cantidad}
                            onChange={(e) => setEditRow({ ...editRow, Cantidad: Number(e.target.value) })}
                            className="w-16 px-1 py-0.5 text-right bg-white dark:bg-slate-800 border rounded"
                          />
                        ) : (
                          v.Cantidad
                        )}
                      </td>

                      {/* Precio Unitario */}
                      <td className="py-2 px-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editRow.PrecioUnitario ?? v.PrecioUnitario}
                            onChange={(e) => setEditRow({ ...editRow, PrecioUnitario: Number(e.target.value) })}
                            className="w-24 px-1 py-0.5 text-right bg-white dark:bg-slate-800 border rounded"
                          />
                        ) : (
                          formatCurrencyCOP(v.PrecioUnitario)
                        )}
                      </td>

                      {/* Descuento */}
                      <td className="py-2 px-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editRow.DescuentoPct ?? ''}
                            onChange={(e) =>
                              setEditRow({
                                ...editRow,
                                DescuentoPct: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            className="w-16 px-1 py-0.5 text-right bg-white dark:bg-slate-800 border rounded"
                          />
                        ) : v.DescuentoPct !== null ? (
                          `${(v.DescuentoPct * 100).toFixed(0)}%`
                        ) : (
                          <span className="text-slate-400 font-sans italic text-[11px]">Vacío</span>
                        )}
                      </td>

                      {/* Importe (Calculado) */}
                      <td className="py-2 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrencyCOP(v.Importe)}
                      </td>

                      {/* Precio Neto */}
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                        {formatCurrencyCOP(v.PrecioNeto)}
                      </td>

                      {/* Bruto */}
                      <td className="py-2 px-3 text-right text-slate-500">
                        {formatCurrencyCOP(v.Bruto)}
                      </td>

                      {/* Mes */}
                      <td className="py-2 px-3 text-center">
                        M{v.Mes}
                      </td>

                      {/* Acciones */}
                      <td className="py-2 px-3 text-center">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(idx)}
                            className="p-1 text-emerald-600 hover:text-emerald-700"
                            title="Guardar fila"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartEdit(idx)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Editar fila"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSale(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Eliminar fila"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: DIM REGION */}
      {activeSubTab === 'regiones' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            DimRegion · Metas Semestrales por Zona
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Relación *:1 con FactVentas[Región] para los KPIs de cumplimiento
          </p>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600">
                <th className="py-2 px-3">Región</th>
                <th className="py-2 px-3">Departamento</th>
                <th className="py-2 px-3 text-right">Meta Semestral (COP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono tabular-nums">
              {regiones.map((r, idx) => (
                <tr key={r.Región} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">{r.Región}</td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">{r.Departamento}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                    <input
                      type="number"
                      value={r.MetaSemestral}
                      onChange={(e) => {
                        const copy = [...regiones];
                        copy[idx] = { ...copy[idx], MetaSemestral: Number(e.target.value) };
                        onUpdateRegiones(copy);
                      }}
                      className="px-2 py-1 text-right bg-transparent border border-transparent hover:border-slate-300 focus:border-slate-600 rounded font-mono"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: DIM CLIENTE */}
      {activeSubTab === 'clientes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            DimCliente · Directorio Maestro de Clientes
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Relación *:1 con FactVentas[ClienteID] para ranking y segmentación
          </p>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600">
                <th className="py-2 px-3">ClienteID</th>
                <th className="py-2 px-3">Nombre Cliente</th>
                <th className="py-2 px-3">Región Principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono tabular-nums">
              {clientes.map((c, idx) => (
                <tr key={c.ClienteID} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{c.ClienteID}</td>
                  <td className="py-2 px-3 font-sans text-slate-900 dark:text-slate-100">
                    <input
                      type="text"
                      value={c.NombreCliente}
                      onChange={(e) => {
                        const copy = [...clientes];
                        copy[idx] = { ...copy[idx], NombreCliente: e.target.value };
                        onUpdateClientes(copy);
                      }}
                      className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-slate-600 rounded font-sans"
                    />
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">{c.Región}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
