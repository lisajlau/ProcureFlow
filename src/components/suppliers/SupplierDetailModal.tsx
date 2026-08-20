import React from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  FileText, 
  CheckCircle2,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { Supplier, Quotation, PurchaseOrder } from '../../types/procurement';
import { formatDate, formatCurrency, getCTOSColor } from '../../utils/formatters';

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  onOpenCTOSAudit: (supplier: Supplier) => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplier,
  onClose,
  quotations,
  purchaseOrders,
  onOpenCTOSAudit
}) => {
  if (!supplier) return null;

  const supplierQuotes = quotations.filter(q => q.supplierId === supplier.id);
  const supplierPOs = purchaseOrders.filter(po => po.supplierId === supplier.id);
  const ctosTheme = getCTOSColor(supplier.ctos.status, supplier.ctos.riskLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
              {supplier.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{supplier.name}</h2>
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded">{supplier.code}</span>
              </div>
              <p className="text-xs text-slate-500">SSM Reg: {supplier.companyRegistration}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* CTOS Deep-Dive Card */}
          <div className={`p-4 rounded-xl border ${ctosTheme.bg} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold text-sm">CTOS Comprehensive Credit Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ctosTheme.badge}`}>
                  {supplier.ctos.status} • {supplier.ctos.riskLevel} Risk
                </span>
                <button
                  onClick={() => onOpenCTOSAudit(supplier)}
                  className="px-2.5 py-1 rounded-lg bg-white shadow-2xs border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-slate-500" />
                  <span>Edit CTOS</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-current/20">
              <div>
                <span className="text-slate-500 block">Credit Score:</span>
                <strong className="text-base font-bold">{supplier.ctos.score} / 850</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Litigation Records:</span>
                <strong className={`text-base font-bold ${supplier.ctos.litigationRecordCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {supplier.ctos.litigationRecordCount} Cases
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Bankruptcy Flag:</span>
                <strong className="text-base font-bold">{supplier.ctos.bankruptcyFlag ? 'Yes (Flagged)' : 'None (Clear)'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Directors KYC:</span>
                <strong className="text-base font-bold">{supplier.ctos.directorsVerification}</strong>
              </div>
            </div>

            <div className="text-[11px] pt-1">
              <strong>CTOS Summary:</strong> {supplier.ctos.summaryNotes}
            </div>
            <div className="text-[10px] text-slate-400">
              Last verified on: {formatDate(supplier.ctos.lastCheckedDate)}
            </div>
          </div>

          {/* Supplier Commercial & Location Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Commercial Profile */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" /> Commercial & Lead Time Terms
              </h3>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard Credit Terms:</span>
                  <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{supplier.creditTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard Lead Time:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> {supplier.standardLeadTime}
                  </span>
                </div>
                {supplier.minimumOrderValue && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Minimum Order Value (MOV):</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(supplier.minimumOrderValue)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Vendor Rating:</span>
                  <span className="font-semibold text-amber-600">★ {supplier.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>
            </div>

            {/* Contact Person Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" /> Person In Charge (PIC)
              </h3>
              <div className="space-y-1.5 pt-1">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Name & Designation:</span>
                  <p className="font-semibold text-slate-800">{supplier.contact.picName} ({supplier.contact.designation})</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${supplier.contact.email}`} className="text-indigo-600 hover:underline">{supplier.contact.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-700">{supplier.contact.phone}</span>
                  {supplier.contact.alternatePhone && (
                    <span className="text-slate-400">({supplier.contact.alternatePhone})</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Location & Address */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" /> Supplier Location & Warehouse
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {supplier.location.address}, {supplier.location.postalCode} {supplier.location.city}, {supplier.location.state}, {supplier.location.country}
            </p>
          </div>

          {/* Products & Services Offered */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900">Products & Services Catalog</h3>
            <div className="flex flex-wrap gap-2">
              {supplier.productsAndServices.map((prod, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-medium">
                  {prod}
                </span>
              ))}
            </div>
          </div>

          {/* History of Quotations & Purchase Orders with this Supplier */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" /> Interaction History ({supplierQuotes.length} Quotes, {supplierPOs.length} POs)
            </h3>
            {supplierQuotes.length === 0 ? (
              <p className="text-slate-400 italic">No quotations logged yet for this supplier.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {supplierQuotes.map(q => (
                  <div key={q.id} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{q.quoteNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.status === 'Awarded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Submitted: {formatDate(q.submissionDate)} • Lead time: {q.offeredLeadTime}</p>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(q.totalAmount, q.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
