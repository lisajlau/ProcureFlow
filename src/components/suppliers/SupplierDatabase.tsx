import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  FileText,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Supplier, CTOSStatus } from '../../types/procurement';
import { useProcurement } from '../../context/ProcurementContext';
import { formatDate, getCTOSColor, formatCurrency } from '../../utils/formatters';
import { SupplierDetailModal } from './SupplierDetailModal';
import { SupplierFormModal } from './SupplierFormModal';
import { CTOSAuditModal } from './CTOSAuditModal';

interface SupplierDatabaseProps {
  onOpenNewSupplierModal: () => void;
}

export const SupplierDatabase: React.FC<SupplierDatabaseProps> = ({ onOpenNewSupplierModal }) => {
  const { 
    suppliers, 
    quotations, 
    purchaseOrders, 
    deleteSupplier, 
    addSupplier, 
    updateSupplier, 
    updateCTOSStatus,
    setActiveTab 
  } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCTOSStatus, setSelectedCTOSStatus] = useState<string>('All');
  const [selectedCreditTerm, setSelectedCreditTerm] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [activeDetailSupplier, setActiveDetailSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [auditingSupplier, setAuditingSupplier] = useState<Supplier | null>(null);

  // Extract unique categories & credit terms
  const allCategories = Array.from(new Set(suppliers.flatMap(s => s.categories)));
  const allCreditTerms = Array.from(new Set(suppliers.map(s => s.creditTerms)));

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.companyRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contact.picName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.productsAndServices.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || s.categories.includes(selectedCategory);
    const matchesCTOS = selectedCTOSStatus === 'All' || s.ctos.status === selectedCTOSStatus;
    const matchesCredit = selectedCreditTerm === 'All' || s.creditTerms === selectedCreditTerm;

    return matchesSearch && matchesCategory && matchesCTOS && matchesCredit;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Module Title & Stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Centralised Supplier Database
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of vetted vendors with manual CTOS credit records, products catalog, credit terms, and lead times.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewSupplierModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Supplier</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search bar */}
          <div className="md:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by vendor, product, PIC, SSM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Categories ({allCategories.length})</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* CTOS Status Filter */}
          <div>
            <select
              value={selectedCTOSStatus}
              onChange={(e) => setSelectedCTOSStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All CTOS Statuses</option>
              <option value="Verified">Verified Only (Low Risk)</option>
              <option value="Pending">Pending Audit</option>
              <option value="Flagged">Flagged / High Risk</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>

          {/* Credit Terms Filter */}
          <div>
            <select
              value={selectedCreditTerm}
              onChange={(e) => setSelectedCreditTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Credit Terms</option>
              {allCreditTerms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Active Filter Chips & View Mode Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing <strong>{filteredSuppliers.length}</strong> of {suppliers.length} vendors</span>
            {(selectedCategory !== 'All' || selectedCTOSStatus !== 'All' || selectedCreditTerm !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedCTOSStatus('All');
                  setSelectedCreditTerm('All');
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
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map((supplier) => {
            const ctosTheme = getCTOSColor(supplier.ctos.status, supplier.ctos.riskLevel);
            const quoteCount = quotations.filter(q => q.supplierId === supplier.id).length;

            return (
              <div
                key={supplier.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-5 space-y-3.5">
                  
                  {/* Supplier Header & CTOS Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {supplier.code}
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 mt-1 leading-snug group-hover:text-indigo-600 transition-colors">
                        {supplier.name}
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">SSM: {supplier.companyRegistration}</p>
                    </div>

                    {/* CTOS Score Badge */}
                    <div 
                      onClick={() => setAuditingSupplier(supplier)}
                      title="Click to edit CTOS credit record"
                      className={`px-2.5 py-1 rounded-lg border text-right cursor-pointer hover:opacity-90 transition-opacity ${ctosTheme.bg}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${ctosTheme.dot}`} />
                        <span className="text-[10px] uppercase font-bold">{supplier.ctos.status}</span>
                      </div>
                      <span className="text-xs font-bold block">{supplier.ctos.score} <span className="text-[9px] font-normal">/ 850</span></span>
                    </div>
                  </div>

                  {/* Location & Contact Info */}
                  <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{supplier.location.city}, {supplier.location.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{supplier.contact.email} ({supplier.contact.picName})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{supplier.contact.phone}</span>
                    </div>
                  </div>

                  {/* Commercial Specifications: Credit Terms & Lead Times */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium block">Credit Terms</span>
                      <strong className="text-slate-800 text-[11px] flex items-center gap-1 mt-0.5">
                        <CreditCard className="w-3 h-3 text-indigo-500" />
                        {supplier.creditTerms}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium block">Standard Lead Time</span>
                      <strong className="text-slate-800 text-[11px] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {supplier.standardLeadTime}
                      </strong>
                    </div>
                  </div>

                  {/* Products & Services Tags */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Products & Services</span>
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto scrollbar-none">
                      {supplier.productsAndServices.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {item}
                        </span>
                      ))}
                      {supplier.productsAndServices.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                          +{supplier.productsAndServices.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDetailSupplier(supplier)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => setAuditingSupplier(supplier)}
                      title="Edit CTOS Credit Record"
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>CTOS</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingSupplier(supplier)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete supplier ${supplier.name}?`)) {
                          deleteSupplier(supplier.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Supplier"
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
        /* Dense Table View */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Supplier & Code</th>
                  <th className="py-3 px-4">CTOS Status</th>
                  <th className="py-3 px-4">Products & Services</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Credit Terms</th>
                  <th className="py-3 px-4">Lead Time</th>
                  <th className="py-3 px-4">Contact (PIC)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map(supplier => {
                  const ctosTheme = getCTOSColor(supplier.ctos.status, supplier.ctos.riskLevel);
                  return (
                    <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{supplier.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{supplier.code} • {supplier.companyRegistration}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span 
                          onClick={() => setAuditingSupplier(supplier)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${ctosTheme.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${ctosTheme.dot}`} />
                          {supplier.ctos.status} ({supplier.ctos.score})
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="line-clamp-1 text-slate-600">{supplier.productsAndServices.join(', ')}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {supplier.location.city}, {supplier.location.state}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {supplier.creditTerms}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {supplier.standardLeadTime}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{supplier.contact.picName}</div>
                        <div className="text-[11px] text-slate-400">{supplier.contact.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActiveDetailSupplier(supplier)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSupplier(supplier)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete supplier ${supplier.name}?`)) {
                                deleteSupplier(supplier.id);
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
      {activeDetailSupplier && (
        <SupplierDetailModal
          supplier={activeDetailSupplier}
          onClose={() => setActiveDetailSupplier(null)}
          quotations={quotations}
          purchaseOrders={purchaseOrders}
          onOpenCTOSAudit={(sup) => {
            setActiveDetailSupplier(null);
            setAuditingSupplier(sup);
          }}
        />
      )}

      {editingSupplier && (
        <SupplierFormModal
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onSave={() => {}}
          onUpdate={updateSupplier}
        />
      )}

      {auditingSupplier && (
        <CTOSAuditModal
          supplier={auditingSupplier}
          onClose={() => setAuditingSupplier(null)}
          onUpdateCTOS={updateCTOSStatus}
        />
      )}

    </div>
  );
};
