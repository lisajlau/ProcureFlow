import React, { useState } from 'react';
import { 
  Scale, 
  Package, 
  Building2, 
  DollarSign, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  TrendingDown, 
  Calendar,
  Layers,
  FileText,
  MapPin,
  Check,
  Zap,
  Info,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import { formatCurrency, formatDate, getDaysRemaining, getCTOSColor, getStatusColor } from '../../utils/formatters';
import { Quotation, ProcurementItem, Supplier } from '../../types/procurement';

export const QuotationComparison: React.FC = () => {
  const { 
    items, 
    quotations, 
    suppliers, 
    selectedComparisonItemId, 
    setSelectedComparisonItemId,
    awardQuotation,
    setActiveTab 
  } = useProcurement();

  const [viewFormat, setViewFormat] = useState<'matrix' | 'cards'>('matrix');

  // Find selected item or fall back to first item that has quotes, or first item
  const itemWithQuotes = items.find(i => quotations.some(q => q.procurementItemId === i.id)) || items[0];
  const activeItemId = selectedComparisonItemId || itemWithQuotes?.id || '';
  const currentItem = items.find(i => i.id === activeItemId);

  // Quotes for this item
  const competingQuotes = quotations.filter(q => q.procurementItemId === activeItemId);

  // Award Modal state
  const [awardingQuote, setAwardingQuote] = useState<Quotation | null>(null);
  const [signatoryName, setSignatoryName] = useState('Procurement Tender Board');

  if (!currentItem) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <Package className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">No Procurement Items Available</h2>
        <p className="text-xs text-slate-500">Create a procurement requisition first to start comparing supplier quotations.</p>
      </div>
    );
  }

  // Calculate lowest price, fastest lead time, best CTOS for quick insights
  const minPrice = competingQuotes.length > 0 ? Math.min(...competingQuotes.map(q => q.totalAmount)) : 0;
  const lowestPriceQuote = competingQuotes.find(q => q.totalAmount === minPrice);

  // Find best CTOS
  const quotesWithSuppliers = competingQuotes.map(q => ({
    quote: q,
    supplier: suppliers.find(s => s.id === q.supplierId)
  }));

  const bestCTOSQuote = quotesWithSuppliers.length > 0 
    ? [...quotesWithSuppliers].sort((a, b) => (b.supplier?.ctos.score || 0) - (a.supplier?.ctos.score || 0))[0]
    : null;

  const handleConfirmAward = () => {
    if (awardingQuote) {
      awardQuotation(awardingQuote.id, signatoryName);
      setAwardingQuote(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Requisition Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              Supplier Quotation Comparison
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Side-by-Side Evaluation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare vendor bids side-by-side across commercial pricing, CTOS creditworthiness, lead times, and warranty terms.
          </p>
        </div>

        {/* Item Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Evaluating Requisition:</label>
          <select
            value={activeItemId}
            onChange={(e) => setSelectedComparisonItemId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-indigo-200 bg-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs text-slate-900 max-w-[280px] sm:max-w-xs truncate"
          >
            {items.map(item => {
              const count = quotations.filter(q => q.procurementItemId === item.id).length;
              return (
                <option key={item.id} value={item.id}>
                  {item.itemCode}: {item.title} ({count} {count === 1 ? 'quote' : 'quotes'})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Target Requisition Context Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                {currentItem.itemCode}
              </span>
              <span className="text-xs text-slate-300 font-medium">Category: {currentItem.category}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">Dept: {currentItem.department}</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusColor(currentItem.status)}`}>
                {currentItem.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-white leading-snug">{currentItem.title}</h2>
            {currentItem.description && (
              <p className="text-xs text-slate-300 line-clamp-1">{currentItem.description}</p>
            )}
            {currentItem.deliveryLocation && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Destination: {currentItem.deliveryLocation}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-slate-800/90 p-3.5 rounded-xl border border-slate-700/80 text-xs shrink-0">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Competing Bids</span>
              <strong className="text-indigo-400 text-base font-bold">{competingQuotes.length} Received</strong>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Requester</span>
              <strong className="text-slate-200 text-xs font-semibold block truncate max-w-[140px]">{currentItem.requesterName}</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Comparison Highlights Banner (When quotes exist) */}
      {competingQuotes.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Highlight 1: Lowest Price */}
          {lowestPriceQuote && (
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Lowest Quoted Bid</span>
                <strong className="text-sm font-bold text-slate-900 block truncate">{lowestPriceQuote.supplierName}</strong>
                <span className="text-xs font-bold text-emerald-700">{formatCurrency(lowestPriceQuote.totalAmount, lowestPriceQuote.currency)}</span>
              </div>
            </div>
          )}

          {/* Highlight 2: Best CTOS Standing */}
          {bestCTOSQuote?.supplier && (
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">Best CTOS Standing</span>
                <strong className="text-sm font-bold text-slate-900 block truncate">{bestCTOSQuote.supplier.name}</strong>
                <span className="text-xs font-bold text-blue-700">
                  CTOS {bestCTOSQuote.supplier.ctos.status} (Score {bestCTOSQuote.supplier.ctos.score})
                </span>
              </div>
            </div>
          )}

          {/* Highlight 3: Fastest Lead Time */}
          {competingQuotes[0] && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">Fastest Quoted Lead Time</span>
                <strong className="text-sm font-bold text-slate-900 block truncate">{competingQuotes[0].supplierName}</strong>
                <span className="text-xs font-bold text-amber-800">{competingQuotes[0].offeredLeadTime}</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* View Mode Toolbar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Scale className="w-4 h-4 text-indigo-600" />
          <span>Showing <strong>{competingQuotes.length}</strong> competing quotation{competingQuotes.length === 1 ? '' : 's'}</span>
        </div>

        {competingQuotes.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewFormat('matrix')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewFormat === 'matrix' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Comparison Table</span>
            </button>
            <button
              onClick={() => setViewFormat('cards')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewFormat === 'cards' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards View</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Comparison Section */}
      {competingQuotes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <Scale className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-800">No Quotations Received Yet for this Requisition</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Log quotations from suppliers in the Quotations Hub to view a clean side-by-side comparison.
          </p>
          <button
            onClick={() => setActiveTab('quotations')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Go to Quotations Hub
          </button>
        </div>
      ) : viewFormat === 'matrix' ? (
        
        /* 1. DIRECT SIDE-BY-SIDE MATRIX TABLE (Clean, Intuitive, No Confusing Math) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Header: Suppliers */}
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 w-52 min-w-[200px] text-slate-500 font-bold uppercase text-[10px] tracking-wider border-r border-slate-200 bg-slate-100/70">
                    Evaluation Criteria
                  </th>
                  {competingQuotes.map(quote => {
                    const supplier = suppliers.find(s => s.id === quote.supplierId);
                    const isLowest = quote.totalAmount === minPrice && competingQuotes.length > 1;
                    const isAwarded = quote.status === 'Awarded';

                    return (
                      <th 
                        key={quote.id} 
                        className={`p-4 min-w-[240px] text-slate-900 align-top border-r border-slate-200 last:border-r-0 ${
                          isAwarded ? 'bg-emerald-50/50' : isLowest ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                              {quote.quoteNumber}
                            </span>
                            {isAwarded ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                                <Award className="w-3 h-3" /> Awarded
                              </span>
                            ) : isLowest ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> Lowest Bid
                              </span>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(quote.status)}`}>
                                {quote.status}
                              </span>
                            )}
                          </div>
                          
                          <strong className="text-sm font-bold text-slate-900 block leading-tight">
                            {quote.supplierName}
                          </strong>
                          {supplier && (
                            <span className="text-[11px] text-slate-500 block">
                              {supplier.location.city}, {supplier.location.state}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                
                {/* Row 1: Quoted Total Price */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Quoted Price</span>
                  </td>
                  {competingQuotes.map(quote => {
                    const isLowest = quote.totalAmount === minPrice && competingQuotes.length > 1;
                    return (
                      <td key={quote.id} className="p-4 border-r border-slate-200 last:border-r-0">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <strong className="text-base font-bold text-slate-900">
                              {formatCurrency(quote.totalAmount, quote.currency)}
                            </strong>
                            {isLowest && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                Lowest
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <div>Base Subtotal: <strong>{formatCurrency(quote.subtotal, quote.currency)}</strong></div>
                            {quote.taxAmount > 0 && <div>SST Tax: {formatCurrency(quote.taxAmount, quote.currency)}</div>}
                            {quote.shippingFee > 0 && <div>Shipping: {formatCurrency(quote.shippingFee, quote.currency)}</div>}
                            {quote.discountOffered ? <div>Discount: -{quote.discountOffered}%</div> : null}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 2: CTOS Standing & Risk */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>CTOS Standing</span>
                  </td>
                  {competingQuotes.map(quote => {
                    const supplier = suppliers.find(s => s.id === quote.supplierId);
                    const ctos = supplier ? getCTOSColor(supplier.ctos.status, supplier.ctos.riskLevel) : null;

                    return (
                      <td key={quote.id} className="p-4 border-r border-slate-200 last:border-r-0">
                        {supplier && ctos ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${ctos.bg}`}>
                                {supplier.ctos.status}
                              </span>
                              <strong className="text-slate-900 text-xs">Score: {supplier.ctos.score}</strong>
                              <span className="text-[10px] text-slate-400">/ 850</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>Risk: <strong className="text-slate-700">{supplier.ctos.riskLevel}</strong></span>
                              <span>•</span>
                              <span>Litigation: <strong>{supplier.ctos.litigationRecordCount || 0}</strong></span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              KYC: <span className="font-semibold text-slate-600">{supplier.ctos.directorsVerification || 'Verified'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Not recorded</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 3: Delivery & Lead Time */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Offered Lead Time</span>
                  </td>
                  {competingQuotes.map(quote => (
                    <td key={quote.id} className="p-4 border-r border-slate-200 last:border-r-0">
                      <div className="space-y-1">
                        <strong className="text-slate-900 font-bold text-xs block">
                          {quote.offeredLeadTime}
                        </strong>
                        <div className="text-[11px] text-slate-500">
                          Est. Delivery: <strong>{formatDate(quote.estimatedDeliveryDate)}</strong>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row 4: Commercial Terms */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Credit / Payment Terms</span>
                  </td>
                  {competingQuotes.map(quote => (
                    <td key={quote.id} className="p-4 border-r border-slate-200 last:border-r-0">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs inline-block">
                        {quote.proposedCreditTerms}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Row 5: Warranty & Support */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Warranty & Support</span>
                  </td>
                  {competingQuotes.map(quote => (
                    <td key={quote.id} className="p-4 border-r border-slate-200 last:border-r-0 text-slate-800 font-medium">
                      {quote.warrantyPeriod}
                    </td>
                  ))}
                </tr>

                {/* Row 6: Spec Compliance */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Spec Compliance</span>
                  </td>
                  {competingQuotes.map(quote => (
                    <td key={quote.id} className="p-4 border-r border-slate-200 last:border-r-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          quote.specCompliance === 'Fully Compliant' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : quote.specCompliance === 'Partially Compliant'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {quote.specCompliance}
                        </span>
                        {quote.complianceScore && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            ({quote.complianceScore}%)
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row 7: Remarks & Scope Notes */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Remarks & Scope</span>
                  </td>
                  {competingQuotes.map(quote => (
                    <td key={quote.id} className="p-4 border-r border-slate-200 last:border-r-0 text-[11px] text-slate-600 leading-relaxed">
                      {quote.remarks || <span className="text-slate-400 italic">None provided</span>}
                    </td>
                  ))}
                </tr>

                {/* Row 8: Action - Award & PO */}
                <tr className="bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900 border-r border-slate-200 bg-slate-100/80">
                    Decision Action
                  </td>
                  {competingQuotes.map(quote => {
                    const isAwarded = quote.status === 'Awarded';
                    return (
                      <td key={quote.id} className="p-4 border-r border-slate-200 last:border-r-0">
                        {isAwarded ? (
                          <div className="py-2 px-3 text-center text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4" />
                            <span>Awarded (PO Active)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAwardingQuote(quote)}
                            className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20"
                          >
                            <Award className="w-4 h-4" />
                            <span>Award & Issue PO</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      ) : (

        /* 2. CARD VIEW (For alternative card-based comparison) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {competingQuotes.map(quote => {
            const supplier = suppliers.find(s => s.id === quote.supplierId);
            const ctos = supplier ? getCTOSColor(supplier.ctos.status, supplier.ctos.riskLevel) : null;
            const isLowest = quote.totalAmount === minPrice && competingQuotes.length > 1;
            const isAwarded = quote.status === 'Awarded';

            return (
              <div 
                key={quote.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs ${
                  isAwarded 
                    ? 'ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/10'
                    : isLowest
                    ? 'ring-2 ring-blue-500 border-blue-300'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Header ribbon */}
                {isAwarded ? (
                  <div className="bg-emerald-600 text-white text-center py-1 text-[11px] font-bold flex items-center justify-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>AWARDED CONTRACT</span>
                  </div>
                ) : isLowest ? (
                  <div className="bg-blue-600 text-white text-center py-1 text-[11px] font-bold flex items-center justify-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>LOWEST PRICE BID</span>
                  </div>
                ) : null}

                <div className="p-5 space-y-4">
                  {/* Supplier Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {quote.quoteNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                        {quote.supplierName}
                      </h3>
                      {supplier && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{supplier.location.city}, {supplier.location.state}</p>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Quoted Amount</span>
                    <strong className="text-lg font-bold text-slate-900 block">
                      {formatCurrency(quote.totalAmount, quote.currency)}
                    </strong>
                    <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/80">
                      <span>Subtotal: {formatCurrency(quote.subtotal, quote.currency)}</span>
                      <span>SST + Ship: {formatCurrency(quote.taxAmount + quote.shippingFee, quote.currency)}</span>
                    </div>
                  </div>

                  {/* CTOS Standing */}
                  {supplier && ctos && (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${ctos.bg}`}>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <div>
                          <span className="font-bold block text-[11px]">CTOS: {supplier.ctos.status}</span>
                          <span className="text-[10px] opacity-80">{supplier.ctos.riskLevel} Risk • Score {supplier.ctos.score}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold">{supplier.ctos.directorsVerification || 'Verified'}</span>
                    </div>
                  )}

                  {/* Terms & Delivery */}
                  <div className="space-y-1.5 text-xs">
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
                      <strong className="text-slate-800 truncate max-w-[170px]">{quote.warrantyPeriod}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Spec Compliance:</span>
                      <span className="font-semibold text-indigo-700">{quote.specCompliance}</span>
                    </div>
                  </div>

                  {/* Remarks */}
                  {quote.remarks && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {quote.remarks}
                    </p>
                  )}

                </div>

                {/* Footer Action */}
                <div className="p-5 bg-slate-50/80 border-t border-slate-100">
                  {isAwarded ? (
                    <div className="w-full text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-xl flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Awarded Quotation (PO Active)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAwardingQuote(quote)}
                      className="w-full py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                    >
                      <Award className="w-4 h-4" />
                      <span>Award & Issue PO</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Award & Generate PO Modal */}
      {awardingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-slate-100 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5" />
                <div>
                  <h2 className="text-sm font-bold">Award Quotation & Generate Purchase Order</h2>
                  <p className="text-[11px] text-emerald-100">Final tender board contract award sign-off</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Supplier:</span>
                  <strong className="text-slate-900 font-bold">{awardingQuote.supplierName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Contract Value:</span>
                  <strong className="text-emerald-800 font-bold text-sm">
                    {formatCurrency(awardingQuote.totalAmount, awardingQuote.currency)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credit Terms:</span>
                  <span className="font-semibold text-slate-800">{awardingQuote.proposedCreditTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Offered Lead Time:</span>
                  <span className="font-semibold text-slate-800">{awardingQuote.offeredLeadTime}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authorized Signatory / Committee Sign-Off</label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                />
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                ⚡ <strong>Automated Next Steps:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>Changes Procurement Requisition status to <strong>Awarded</strong>.</li>
                  <li>Generates official Purchase Order with delivery schedule and credit terms ({awardingQuote.proposedCreditTerms}).</li>
                  <li>Marks other competing vendor quotations as Rejected.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAwardingQuote(null)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAward}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-sm transition-colors"
                >
                  Confirm Award & Issue PO
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
