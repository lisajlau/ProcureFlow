import React, { useState, useEffect } from 'react';
import { X, FileText, Building2, Package, DollarSign, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { Quotation, QuotationStatus, CreditTerm, ProcurementItem, Supplier } from '../../types/procurement';
import { useProcurement } from '../../context/ProcurementContext';
import { formatCurrency, getCTOSColor } from '../../utils/formatters';

interface QuotationFormModalProps {
  preselectedItem?: ProcurementItem | null;
  onClose: () => void;
  onSave: (quoteData: Omit<Quotation, 'id' | 'quoteNumber'>) => void;
}

const CREDIT_TERM_OPTIONS: CreditTerm[] = [
  'COD',
  'Net 7',
  'Net 14',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
  '30% Advance / 70% Delivery',
  '50% Advance / 50% Delivery'
];

export const QuotationFormModal: React.FC<QuotationFormModalProps> = ({
  preselectedItem,
  onClose,
  onSave
}) => {
  const { items, suppliers } = useProcurement();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItem?.id || items[0]?.id || ''
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    suppliers[0]?.id || ''
  );

  const selectedItem = items.find(i => i.id === selectedItemId);
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const [basePrice, setBasePrice] = useState<number>(50000);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(6); // 6% SST
  const [offeredLeadTime, setOfferedLeadTime] = useState<string>(
    selectedSupplier?.standardLeadTime || '7 business days'
  );
  const [proposedCreditTerms, setProposedCreditTerms] = useState<CreditTerm>(
    selectedSupplier?.creditTerms || 'Net 30'
  );
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>('12 Months Standard Warranty');
  const [submissionDate, setSubmissionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [specCompliance, setSpecCompliance] = useState<'Fully Compliant' | 'Partially Compliant' | 'Alternate Spec Offered'>(
    'Fully Compliant'
  );
  const [complianceScore, setComplianceScore] = useState<number>(95);
  const [discountOffered, setDiscountOffered] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [status, setStatus] = useState<QuotationStatus>('Received');

  // Sync supplier terms when supplier selection changes
  useEffect(() => {
    if (selectedSupplier) {
      setProposedCreditTerms(selectedSupplier.creditTerms);
      setOfferedLeadTime(selectedSupplier.standardLeadTime);
    }
  }, [selectedSupplierId]);

  const discountAmount = (basePrice * (discountOffered || 0)) / 100;
  const netSubtotal = basePrice - discountAmount;
  const taxAmount = Number(((netSubtotal * taxRate) / 100).toFixed(2));
  const totalAmount = Number((netSubtotal + taxAmount + (Number(shippingFee) || 0)).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedSupplier) return;

    const quoteData: Omit<Quotation, 'id' | 'quoteNumber'> = {
      procurementItemId: selectedItem.id,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      submissionDate,
      validUntil,
      unitPrice: Number(basePrice),
      quantity: 1,
      subtotal: Number(netSubtotal.toFixed(2)),
      taxAmount,
      shippingFee: Number(shippingFee) || 0,
      totalAmount,
      currency: 'MYR',
      offeredLeadTime,
      estimatedDeliveryDate,
      proposedCreditTerms,
      warrantyPeriod,
      complianceScore,
      status,
      remarks: remarks || `Standard official quotation submitted by ${selectedSupplier.name}`,
      specCompliance,
      discountOffered: Number(discountOffered) || 0,
    };

    onSave(quoteData);
    onClose();
  };

  const supplierCTOS = selectedSupplier ? getCTOSColor(selectedSupplier.ctos.status, selectedSupplier.ctos.riskLevel) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold">Log Received Supplier Quotation</h2>
              <p className="text-[11px] text-slate-400">Record quoted pricing, lead times, warranties, and commercial terms</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Linked Item & Linked Supplier Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Choose Item */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Procurement Requisition *</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
              >
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.itemCode}: {item.title}
                  </option>
                ))}
              </select>
              {selectedItem && (
                <div className="mt-1 text-[11px] text-slate-500">
                  Category: <strong>{selectedItem.category}</strong> • Dept: <strong>{selectedItem.department}</strong>
                </div>
              )}
            </div>

            {/* Choose Supplier */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Bidding Supplier *</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name} ({s.ctos.status} - Score: {s.ctos.score})
                  </option>
                ))}
              </select>
              {selectedSupplier && supplierCTOS && (
                <div className="mt-1 text-[11px] flex items-center gap-1.5">
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${supplierCTOS.badge}`}>
                    CTOS: {selectedSupplier.ctos.status} ({selectedSupplier.ctos.score})
                  </span>
                  <span className="text-slate-500">• {selectedSupplier.location.city}</span>
                </div>
              )}
            </div>

          </div>

          {/* Pricing & Commercial Structure */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Pricing Breakdown (MYR)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quoted Price / Subtotal *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discount Offered (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={discountOffered}
                  onChange={(e) => setDiscountOffered(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sales Tax / SST (%)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shipping / Freight Fee</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            {/* Calculated Total Banner */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Calculated Bid Value</span>
                <p className="text-xs text-slate-600">
                  {formatCurrency(basePrice)} {discountOffered > 0 ? `(-${discountOffered}%)` : ''} + SST ({formatCurrency(taxAmount)}) + Shipping ({formatCurrency(shippingFee)})
                </p>
              </div>
              <strong className="text-lg font-bold text-indigo-700">{formatCurrency(totalAmount)}</strong>
            </div>
          </div>

          {/* Lead Times & Commercial Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quoted Lead Time *</label>
              <input
                type="text"
                required
                placeholder="e.g. 7 business days"
                value={offeredLeadTime}
                onChange={(e) => setOfferedLeadTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposed Credit Terms *</label>
              <select
                value={proposedCreditTerms}
                onChange={(e) => setProposedCreditTerms(e.target.value as CreditTerm)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
              >
                {CREDIT_TERM_OPTIONS.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Warranty Period</label>
              <input
                type="text"
                placeholder="e.g. 36 Months On-Site"
                value={warrantyPeriod}
                onChange={(e) => setWarrantyPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Technical Compliance & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specification Compliance</label>
              <select
                value={specCompliance}
                onChange={(e) => setSpecCompliance(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
              >
                <option value="Fully Compliant">Fully Compliant (100% Match)</option>
                <option value="Partially Compliant">Partially Compliant (Minor variance)</option>
                <option value="Alternate Spec Offered">Alternate Spec Offered</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Delivery Date</label>
              <input
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quotation Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Remarks & Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quotation Scope & Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Price includes free delivery, setup, and 1 complimentary maintenance visit..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-sm transition-colors"
            >
              Save Quotation
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
