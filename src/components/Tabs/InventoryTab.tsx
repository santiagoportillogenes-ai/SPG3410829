import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  RotateCcw,
  Boxes,
  Truck,
  TrendingUp,
} from 'lucide-react';
import { InventarioItem, CalculatedKPIs } from '../../types';
import { formatCurrencyCOP, formatPercent } from '../../utils/calculations';

interface InventoryTabProps {
  inventario: InventarioItem[];
  kpis: CalculatedKPIs;
  onUpdateInventario: (items: InventarioItem[]) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventario,
  kpis,
  onUpdateInventario,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<InventarioItem>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemForm, setNewItemForm] = useState<Partial<InventarioItem>>({
    Codigo: '',
    Nombre: '',
    Categoria: 'Insumos',
    StockInicial: 100,
    ComprasPeriodo: 300,
    CostoUnitarioCompra: 50000,
    VentasUnidades: 250,
    StockSeguridad: 50,
    PuntoReorden: 100,
  });

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...inventario[index] });
  };

  const handleSaveEdit = (index: number) => {
    if (!editForm) return;
    const updated = [...inventario];
    const initial = editForm.StockInicial ?? updated[index].StockInicial;
    const compras = editForm.ComprasPeriodo ?? updated[index].ComprasPeriodo;
    const ventas = editForm.VentasUnidades ?? updated[index].VentasUnidades;
    const costo = editForm.CostoUnitarioCompra ?? updated[index].CostoUnitarioCompra;
    const stockSeguridad = editForm.StockSeguridad ?? updated[index].StockSeguridad;
    const puntoReorden = editForm.PuntoReorden ?? updated[index].PuntoReorden;

    const stockFinal = initial + compras - ventas;
    const invProm = Math.max(1, (initial + stockFinal) / 2);
    const rotacion = Number((ventas / invProm).toFixed(2));
    const diasInventario = rotacion > 0 ? Number((180 / rotacion).toFixed(1)) : 0;
    const valorTotal = stockFinal * costo;

    let estado: 'Optimo' | 'Alerta' | 'Critico' | 'Sobreinventario' = 'Optimo';
    if (stockFinal <= stockSeguridad * 0.8) estado = 'Critico';
    else if (stockFinal <= puntoReorden) estado = 'Alerta';
    else if (stockFinal > puntoReorden * 1.8) estado = 'Sobreinventario';

    updated[index] = {
      ...updated[index],
      ...editForm,
      StockInicial: initial,
      ComprasPeriodo: compras,
      VentasUnidades: ventas,
      StockFinal: stockFinal,
      CostoUnitarioCompra: costo,
      CostoPromedio: costo,
      StockSeguridad: stockSeguridad,
      PuntoReorden: puntoReorden,
      Rotacion: rotacion,
      DiasInventario: diasInventario,
      ValorInventarioTotal: valorTotal,
      EstadoAbastecimiento: estado,
    };

    onUpdateInventario(updated);
    setEditingIndex(null);
  };

  const handleDeleteItem = (index: number) => {
    const updated = inventario.filter((_, idx) => idx !== index);
    onUpdateInventario(updated);
  };

  const handleAddNewItem = () => {
    if (!newItemForm.Codigo || !newItemForm.Nombre) return;

    const initial = Number(newItemForm.StockInicial) || 0;
    const compras = Number(newItemForm.ComprasPeriodo) || 0;
    const ventas = Number(newItemForm.VentasUnidades) || 0;
    const costo = Number(newItemForm.CostoUnitarioCompra) || 0;
    const stockSeguridad = Number(newItemForm.StockSeguridad) || 0;
    const puntoReorden = Number(newItemForm.PuntoReorden) || 0;

    const stockFinal = initial + compras - ventas;
    const invProm = Math.max(1, (initial + stockFinal) / 2);
    const rotacion = Number((ventas / invProm).toFixed(2));
    const diasInventario = rotacion > 0 ? Number((180 / rotacion).toFixed(1)) : 0;
    const valorTotal = stockFinal * costo;

    let estado: 'Optimo' | 'Alerta' | 'Critico' | 'Sobreinventario' = 'Optimo';
    if (stockFinal <= stockSeguridad * 0.8) estado = 'Critico';
    else if (stockFinal <= puntoReorden) estado = 'Alerta';
    else if (stockFinal > puntoReorden * 1.8) estado = 'Sobreinventario';

    const item: InventarioItem = {
      Codigo: newItemForm.Codigo,
      Nombre: newItemForm.Nombre,
      Categoria: newItemForm.Categoria || 'General',
      StockInicial: initial,
      ComprasPeriodo: compras,
      CostoUnitarioCompra: costo,
      VentasUnidades: ventas,
      StockFinal: stockFinal,
      StockSeguridad: stockSeguridad,
      PuntoReorden: puntoReorden,
      CostoPromedio: costo,
      ValorInventarioTotal: valorTotal,
      Rotacion: rotacion,
      DiasInventario: diasInventario,
      EstadoAbastecimiento: estado,
    };

    onUpdateInventario([...inventario, item]);
    setIsAddingNew(false);
    setNewItemForm({
      Codigo: '',
      Nombre: '',
      Categoria: 'Insumos',
      StockInicial: 100,
      ComprasPeriodo: 300,
      CostoUnitarioCompra: 50000,
      VentasUnidades: 250,
      StockSeguridad: 50,
      PuntoReorden: 100,
    });
  };

  return (
    <div className="space-y-6">
      {/* KPI Top Strip for Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
          <span className="text-xs font-semibold text-slate-500 block">Valorización de Stock Final</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrencyCOP(kpis.inventarioFinalValor)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Inicial: {formatCurrencyCOP(kpis.inventarioInicialValor)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
          <span className="text-xs font-semibold text-slate-500 block">Compras Totales del Período</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrencyCOP(kpis.comprasTotales)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Inversión en reposición</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
          <span className="text-xs font-semibold text-slate-500 block">Rotación Promedio de Inventario</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {kpis.rotacionInventarioGlobal}x / Semestre
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            Fórmula: CMV / Inventario Promedio
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
          <span className="text-xs font-semibold text-slate-500 block">Días de Inventario (DSI)</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {kpis.diasInventarioGlobal} Días
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Tiempo de permanencia en bodega</span>
        </div>
      </div>

      {/* Main Table: Editable Inventory & Calculations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              Matriz de Control de Inventarios, Compras y Rotación
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cálculo avanzado de Stock Final = Inicial + Compras - Salidas, Rotación y Punto de Reorden
            </p>
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Cancelar' : 'Nuevo Artículo / Insumo'}</span>
          </button>
        </div>

        {/* New Item Form Drawer */}
        {isAddingNew && (
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Registrar Nuevo Artículo de Inventario
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Código</label>
                <input
                  type="text"
                  placeholder="INV-001"
                  value={newItemForm.Codigo || ''}
                  onChange={(e) => setNewItemForm({ ...newItemForm, Codigo: e.target.value })}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-500 mb-1">Descripción / Nombre</label>
                <input
                  type="text"
                  placeholder="Nombre del insumo o producto"
                  value={newItemForm.Nombre || ''}
                  onChange={(e) => setNewItemForm({ ...newItemForm, Nombre: e.target.value })}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Stock Inicial</label>
                <input
                  type="number"
                  value={newItemForm.StockInicial || 0}
                  onChange={(e) => setNewItemForm({ ...newItemForm, StockInicial: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Compras Período</label>
                <input
                  type="number"
                  value={newItemForm.ComprasPeriodo || 0}
                  onChange={(e) => setNewItemForm({ ...newItemForm, ComprasPeriodo: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Costo Compra Unit.</label>
                <input
                  type="number"
                  value={newItemForm.CostoUnitarioCompra || 0}
                  onChange={(e) => setNewItemForm({ ...newItemForm, CostoUnitarioCompra: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Ventas / Salidas</label>
                <input
                  type="number"
                  value={newItemForm.VentasUnidades || 0}
                  onChange={(e) => setNewItemForm({ ...newItemForm, VentasUnidades: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Pto. Reorden</label>
                <input
                  type="number"
                  value={newItemForm.PuntoReorden || 0}
                  onChange={(e) => setNewItemForm({ ...newItemForm, PuntoReorden: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNewItem}
                className="px-4 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
              >
                Guardar Artículo
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Artículo / Servicio</th>
                <th className="py-2.5 px-3 text-right">Stock Inicial</th>
                <th className="py-2.5 px-3 text-right">Compras</th>
                <th className="py-2.5 px-3 text-right">Salidas (Ventas)</th>
                <th className="py-2.5 px-3 text-right">Stock Final</th>
                <th className="py-2.5 px-3 text-right">Costo Unitario</th>
                <th className="py-2.5 px-3 text-right">Valor Total Stock</th>
                <th className="py-2.5 px-3 text-right">Rotación</th>
                <th className="py-2.5 px-3 text-right">Días (DSI)</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono tabular-nums">
              {inventario.map((item, index) => {
                const isEditing = editingIndex === index;

                return (
                  <tr
                    key={item.Codigo}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {item.Codigo}
                    </td>

                    <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.Nombre ?? item.Nombre}
                          onChange={(e) => setEditForm({ ...editForm, Nombre: e.target.value })}
                          className="w-full px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded"
                        />
                      ) : (
                        <div>
                          <span>{item.Nombre}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">{item.Categoria}</span>
                        </div>
                      )}
                    </td>

                    {/* Stock Inicial */}
                    <td className="py-2 px-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.StockInicial ?? item.StockInicial}
                          onChange={(e) => setEditForm({ ...editForm, StockInicial: Number(e.target.value) })}
                          className="w-16 px-1 py-0.5 text-right bg-white dark:bg-slate-800 border rounded"
                        />
                      ) : (
                        item.StockInicial
                      )}
                    </td>

                    {/* Compras */}
                    <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.ComprasPeriodo ?? item.ComprasPeriodo}
                          onChange={(e) => setEditForm({ ...editForm, ComprasPeriodo: Number(e.target.value) })}
                          className="w-16 px-1 py-0.5 text-right bg-white dark:bg-slate-800 border rounded"
                        />
                      ) : (
                        `+${item.ComprasPeriodo}`
                      )}
                    </td>

                    {/* Salidas / Ventas */}
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.VentasUnidades ?? item.VentasUnidades}
                          onChange={(e) => setEditForm({ ...editForm, VentasUnidades: Number(e.target.value) })}
                          className="w-16 px-1 py-0.5 text-right bg-white dark:bg-slate-800 border rounded"
                        />
                      ) : (
                        `-${item.VentasUnidades}`
                      )}
                    </td>

                    {/* Stock Final */}
                    <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {item.StockFinal}
                    </td>

                    {/* Costo Unitario */}
                    <td className="py-2 px-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.CostoUnitarioCompra ?? item.CostoUnitarioCompra}
                          onChange={(e) => setEditForm({ ...editForm, CostoUnitarioCompra: Number(e.target.value) })}
                          className="w-24 px-1 py-0.5 text-right bg-white dark:bg-slate-800 border rounded"
                        />
                      ) : (
                        formatCurrencyCOP(item.CostoUnitarioCompra)
                      )}
                    </td>

                    {/* Valor Total Stock */}
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrencyCOP(item.ValorInventarioTotal)}
                    </td>

                    {/* Rotacion */}
                    <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                      {item.Rotacion}x
                    </td>

                    {/* Dias Inventario */}
                    <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                      {item.DiasInventario} d
                    </td>

                    {/* Estado Abastecimiento */}
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`text-[11px] font-semibold ${
                          item.EstadoAbastecimiento === 'Optimo'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : item.EstadoAbastecimiento === 'Alerta'
                            ? 'text-amber-600 dark:text-amber-400'
                            : item.EstadoAbastecimiento === 'Critico'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {item.EstadoAbastecimiento}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-2 px-3 text-center">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(index)}
                          className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                          title="Guardar cambios"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(index)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="Editar valores"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Eliminar artículo"
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
    </div>
  );
};
