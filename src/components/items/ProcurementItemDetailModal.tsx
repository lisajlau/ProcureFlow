import React from 'react';
import { 
  X, 
  Package, 
  Layers, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Scale, 
  Plus
} from 'lucide-react';
import { ProcurementItem, Quotation, PurchaseOrder } from '../../types/procurement';
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from '../../utils/formatters';

interface ProcurementItemDetailModalProps {
  item: ProcurementItem | null;
  onClose: () => void;
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  onStartComparison: (itemId: string) => void;
  onLogQuoteForItem: (item: ProcurementItem) => void;
}

export const ProcurementItemDetailModal: React.FC<ProcurementItemDetailModalProps> = ({
  item,
  onClose,
  quotations,
  purchaseOrders,
  onStartComparison,
  onLogQuoteForItem
}) => {
  if (!item) return null;

  const itemQuotes = quotations.filter(q => q.procurementItemId === item.id);
  const linkedPO = purchaseOrders.find(po => po.procurementItemId === item.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mt-0.5 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {item.itemCode}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                  {item.priority} Priority
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{item.title}</h2>
              <p className="text-xs text-slate-500">Category: {item.category} • Dept: {item.department} • Requester: {item.requesterName}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Requisition Meta Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
              <strong className="text-sm font-bold text-slate-900">{item.category}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
              <strong className="text-sm font-bold text-slate-900">{item.department}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Quotations Received</span>
              <strong className="text-sm font-bold text-indigo-600">{itemQuotes.length} Vendor Quotes</strong>
            </div>
          </div>

          {/* Description & Technical Specifications */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            {item.description && (
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Item Description</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/80">
              <h3 className="font-bold text-slate-900 mb-1">Technical Specifications</h3>
              <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                {item.specifications}
              </div>
            </div>

            {item.specialInstructions && (
              <div className="pt-2 border-t border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-0.5">Special Instructions:</span>
                <p className="text-slate-600 italic">{item.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Delivery Location */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Delivery Destination: <strong>{item.deliveryLocation}</strong></span>
          </div>

          {/* Awarded PO Status if any */}
          {item.purchaseOrderNumber && linkedPO && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Awarded Purchase Order Issued: {linkedPO.poNumber}</span>
                </div>
                <span className="text-xs font-bold text-emerald-800">{formatCurrency(linkedPO.totalAmount)}</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Awarded to <strong>{linkedPO.supplierName}</strong> on {formatDate(linkedPO.issueDate)} • Expected Delivery: {formatDate(linkedPO.expectedDeliveryDate)}
              </p>
            </div>
          )}

          {/* Linked Received Quotations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" /> Competing Supplier Quotations ({itemQuotes.length})
              </h3>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onLogQuoteForItem(item);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Log Quote
                </button>
                {itemQuotes.length >= 2 && (
                  <button
                    onClick={() => {
                      onClose();
                      onStartComparison(item.id);
                    }}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Scale className="w-3.5 h-3.5" /> Compare in Matrix
                  </button>
                )}
              </div>
            </div>

            {itemQuotes.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                No quotations submitted yet for this item. Click "+ Log Quote" to record a vendor quotation.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {itemQuotes.map(q => (
                  <div key={q.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{q.supplierName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{q.quoteNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.status === 'Awarded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Lead Time: <strong>{q.offeredLeadTime}</strong></span>
                        <span>•</span>
                        <span>Terms: <strong>{q.proposedCreditTerms}</strong></span>
                        <span>•</span>
                        <span>Warranty: <strong>{q.warrantyPeriod}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block">{formatCurrency(q.totalAmount, q.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Created: {formatDate(item.createdAt)}</span>
          <div className="flex items-center gap-2">
            {itemQuotes.length >= 1 && (
              <button
                onClick={() => {
                  onClose();
                  onStartComparison(item.id);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Open Comparison Matrix</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
