import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Scale, 
  FileText, 
  Tag,
  Building2,
  MapPin
} from 'lucide-react';
import { ProcurementItem, ProcurementStatus, ProcurementPriority } from '../../types/procurement';
import { useProcurement } from '../../context/ProcurementContext';
import { formatDate, getStatusColor, getPriorityColor } from '../../utils/formatters';
import { ProcurementItemFormModal } from './ProcurementItemFormModal';
import { ProcurementItemDetailModal } from './ProcurementItemDetailModal';

interface ProcurementItemsProps {
  onOpenNewItemModal: () => void;
  onOpenNewQuoteModal: (item?: ProcurementItem) => void;
}

export const ProcurementItems: React.FC<ProcurementItemsProps> = ({
  onOpenNewItemModal,
  onOpenNewQuoteModal
}) => {
  const { 
    items, 
    quotations, 
    purchaseOrders, 
    deleteProcurementItem, 
    updateProcurementItem,
    startQuoteComparisonForItem 
  } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [activeDetailItem, setActiveDetailItem] = useState<ProcurementItem | null>(null);
  const [editingItem, setEditingItem] = useState<ProcurementItem | null>(null);

  const categories = Array.from(new Set(items.map(i => i.category)));

  // Filtered items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specifications.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deliveryLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || item.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Procurement Requisitions & Items
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture required items, technical specifications, departments, and linked vendor quotations.
          </p>
        </div>

        <button
          onClick={onOpenNewItemModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Requisition</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, title, department, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Workflow Statuses</option>
              <option value="Draft">Draft</option>
              <option value="RFQ Issued">RFQ Issued</option>
              <option value="Quotes Received">Quotes Received</option>
              <option value="Under Evaluation">Under Evaluation</option>
              <option value="Awarded">Awarded</option>
              <option value="PO Issued">PO Issued</option>
              <option value="Delivered">Delivered</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Bar Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            <span>Showing <strong>{filteredItems.length}</strong> items</span>
            {(selectedStatus !== 'All' || selectedPriority !== 'All' || selectedCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedPriority('All');
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold underline ml-2"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const itemQuotes = quotations.filter(q => q.procurementItemId === item.id);

            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3.5">
                  
                  {/* Top Bar: Code, Priority, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.itemCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.category}</span>
                    <h2 
                      onClick={() => setActiveDetailItem(item)}
                      className="text-sm font-bold text-slate-900 leading-snug mt-0.5 line-clamp-2 cursor-pointer group-hover:text-blue-600 transition-colors"
                    >
                      {item.title}
                    </h2>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                    )}
                  </div>

                  {/* Department & Location */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Department:</span>
                      <strong className="text-slate-800 font-medium">{item.department}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Requester:</span>
                      <span className="text-slate-700 font-medium truncate max-w-[170px]">{item.requesterName}</span>
                    </div>
                    {item.deliveryLocation && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{item.deliveryLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Specifications snippet */}
                  <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-600 line-clamp-2 border border-slate-100">
                    {item.specifications}
                  </div>

                </div>

                {/* Card Footer with Quotation Actions */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {itemQuotes.length > 0 ? (
                      <button
                        onClick={() => startQuoteComparisonForItem(item.id)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{itemQuotes.length} Quotes (Compare)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenNewQuoteModal(item)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                        <span>+ Log Quote</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveDetailItem(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete procurement requisition ${item.itemCode}?`)) {
                          deleteProcurementItem(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code & Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Department & Requester</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Quotes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  const itemQuotes = quotations.filter(q => q.procurementItemId === item.id);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] text-slate-400 block">{item.itemCode}</span>
                        <strong 
                          onClick={() => setActiveDetailItem(item)}
                          className="text-slate-900 hover:text-indigo-600 cursor-pointer block line-clamp-1"
                        >
                          {item.title}
                        </strong>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{item.department}</div>
                        <div className="text-[10px] text-slate-400">{item.requesterName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {itemQuotes.length > 0 ? (
                          <button
                            onClick={() => startQuoteComparisonForItem(item.id)}
                            className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] border border-indigo-200 inline-flex items-center gap-1"
                          >
                            <Scale className="w-3 h-3" />
                            <span>{itemQuotes.length} quotes</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">0 quotes</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActiveDetailItem(item)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete item ${item.itemCode}?`)) {
                                deleteProcurementItem(item.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {activeDetailItem && (
        <ProcurementItemDetailModal
          item={activeDetailItem}
          onClose={() => setActiveDetailItem(null)}
          quotations={quotations}
          purchaseOrders={purchaseOrders}
          onStartComparison={startQuoteComparisonForItem}
          onLogQuoteForItem={onOpenNewQuoteModal}
        />
      )}

      {editingItem && (
        <ProcurementItemFormModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={() => {}}
          onUpdate={updateProcurementItem}
        />
      )}

    </div>
  );
};
