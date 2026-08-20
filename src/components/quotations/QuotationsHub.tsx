import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Building2, 
  Package, 
  DollarSign, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Scale, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2,
  Calendar,
  Award
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../../types/procurement';
import { useProcurement } from '../../context/ProcurementContext';
import { formatDate, formatCurrency, getDaysRemaining, getCTOSColor, getStatusColor } from '../../utils/formatters';
import { QuotationFormModal } from './QuotationFormModal';

interface QuotationsHubProps {
  onOpenNewQuoteModal: () => void;
}

export const QuotationsHub: React.FC<QuotationsHubProps> = ({ onOpenNewQuoteModal }) => {
  const { 
    quotations, 
    items, 
    suppliers, 
    updateQuotationStatus, 
    awardQuotation, 
    deleteQuotation, 
    startQuoteComparisonForItem,
    setActiveTab 
  } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('All');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedQuoteForDetail, setSelectedQuoteForDetail] = useState<Quotation | null>(null);

  // Filtered quotations
  const filteredQuotations = quotations.filter(q => {
    const item = items.find(i => i.id === q.procurementItemId);
    const matchesSearch = 
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.remarks.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesItem = selectedItemId === 'All' || q.procurementItemId === selectedItemId;
    const matchesSupplier = selectedSupplierId === 'All' || q.supplierId === selectedSupplierId;
    const matchesStatus = selectedStatus === 'All' || q.status === selectedStatus;

    return matchesSearch && matchesItem && matchesSupplier && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Quotations Intake & Bids Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log, track, and manage all received supplier quotations for procurement requisitions.
          </p>
        </div>

        <button
          onClick={onOpenNewQuoteModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Received Quotation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quote #, supplier, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Procurement Items</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.itemCode}: {item.title}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Quotation Statuses</option>
              <option value="Received">Received</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Awarded">Awarded</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing <strong>{filteredQuotations.length}</strong> quotations</span>
          {(selectedItemId !== 'All' || selectedSupplierId !== 'All' || selectedStatus !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedItemId('All');
                setSelectedSupplierId('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Quotations List */}
      <div className="space-y-4">
        {filteredQuotations.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-slate-600 font-semibold text-sm">No quotations found matching the filters.</p>
            <button
              onClick={onOpenNewQuoteModal}
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              + Log New Quotation
            </button>
          </div>
        ) : (
          filteredQuotations.map(quote => {
            const item = items.find(i => i.id === quote.procurementItemId);
            const supplier = suppliers.find(s => s.id === quote.supplierId);
            const ctos = supplier ? getCTOSColor(supplier.ctos.status, supplier.ctos.riskLevel) : null;
            const validRemaining = getDaysRemaining(quote.validUntil);

            return (
              <div 
                key={quote.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-5 space-y-4"
              >
                {/* Top Quote Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                      {quote.quoteNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-slate-900">{quote.supplierName}</strong>
                        {ctos && (
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${ctos.bg}`}>
                            CTOS: {supplier?.ctos.status} ({supplier?.ctos.score})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">Submitted on: {formatDate(quote.submissionDate)} • Valid until: {formatDate(quote.validUntil)} ({validRemaining.label})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                    {item && (
                      <button
                        onClick={() => startQuoteComparisonForItem(item.id)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Compare in Matrix</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Middle Info: Requisition Linked & Commercial Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Column 1: Procurement Item Requirement */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Item to Procure</span>
                    <strong className="text-slate-900 block font-semibold">{item?.itemCode}: {item?.title}</strong>
                    <div className="text-[11px] text-slate-600 flex justify-between pt-1">
                      <span>Category: {item?.category || 'General'}</span>
                      <span>Dept: {item?.department || 'Operations'}</span>
                    </div>
                  </div>

                  {/* Column 2: Commercial & Delivery Terms */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Offered Terms</span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lead Time:</span>
                      <strong className="text-slate-800">{quote.offeredLeadTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Credit Terms:</span>
                      <strong className="text-slate-800">{quote.proposedCreditTerms}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Warranty:</span>
                      <strong className="text-slate-800 truncate max-w-[150px]">{quote.warrantyPeriod}</strong>
                    </div>
                  </div>

                  {/* Column 3: Pricing Summary */}
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-900 uppercase">Quotation Pricing</span>
                    <div className="flex justify-between text-slate-600">
                      <span>Unit Price:</span>
                      <strong>{formatCurrency(quote.unitPrice, quote.currency)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SST + Shipping:</span>
                      <span>{formatCurrency(quote.taxAmount + quote.shippingFee, quote.currency)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-indigo-200 text-sm font-bold text-indigo-900">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(quote.totalAmount, quote.currency)}</span>
                    </div>
                  </div>

                </div>

                {/* Remarks & Technical Notes */}
                {quote.remarks && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Remarks: </span> {quote.remarks}
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Mark Status:</span>
                    <button
                      onClick={() => updateQuotationStatus(quote.id, 'Shortlisted')}
                      className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                        quote.status === 'Shortlisted' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => updateQuotationStatus(quote.id, 'Under Review')}
                      className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                        quote.status === 'Under Review' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => updateQuotationStatus(quote.id, 'Rejected')}
                      className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                        quote.status === 'Rejected' ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Reject
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {quote.status !== 'Awarded' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Award quotation ${quote.quoteNumber} from ${quote.supplierName} and generate Purchase Order?`)) {
                            awardQuotation(quote.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Award & Issue PO</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete quote ${quote.quoteNumber}?`)) {
                          deleteQuotation(quote.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Quote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
