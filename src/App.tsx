import React, { useState } from 'react';
import { ProcurementProvider, useProcurement } from './context/ProcurementContext';
import { Header } from './components/Header';
import { SupplierDatabase } from './components/suppliers/SupplierDatabase';
import { SupplierFormModal } from './components/suppliers/SupplierFormModal';
import { ProcurementItems } from './components/items/ProcurementItems';
import { ProcurementItemFormModal } from './components/items/ProcurementItemFormModal';
import { QuotationsHub } from './components/quotations/QuotationsHub';
import { QuotationFormModal } from './components/quotations/QuotationFormModal';
import { QuotationComparison } from './components/quotations/QuotationComparison';
import { ProcurementItem } from './types/procurement';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    addSupplier, 
    addProcurementItem, 
    addQuotation 
  } = useProcurement();

  // Top-level modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quotePreselectedItem, setQuotePreselectedItem] = useState<ProcurementItem | null>(null);

  const handleOpenQuoteForSpecificItem = (item?: ProcurementItem) => {
    setQuotePreselectedItem(item || null);
    setShowQuoteModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Header */}
      <Header 
        onOpenNewSupplier={() => setShowSupplierModal(true)}
        onOpenNewItem={() => setShowItemModal(true)}
        onOpenNewQuote={() => {
          setQuotePreselectedItem(null);
          setShowQuoteModal(true);
        }}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'suppliers' && (
          <SupplierDatabase 
            onOpenNewSupplierModal={() => setShowSupplierModal(true)}
          />
        )}

        {activeTab === 'items' && (
          <ProcurementItems 
            onOpenNewItemModal={() => setShowItemModal(true)}
            onOpenNewQuoteModal={handleOpenQuoteForSpecificItem}
          />
        )}

        {activeTab === 'quotations' && (
          <QuotationsHub 
            onOpenNewQuoteModal={() => {
              setQuotePreselectedItem(null);
              setShowQuoteModal(true);
            }}
          />
        )}

        {activeTab === 'comparison' && (
          <QuotationComparison />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">ProcureFlow</span>
            <span>•</span>
            <span>Digital Procurement & CTOS Supplier Verification Pilot</span>
          </div>
          <div>
            ISO-compliant audit logging, quotation comparison & supplier intelligence
          </div>
        </div>
      </footer>

      {/* GLOBAL MODALS */}
      {showSupplierModal && (
        <SupplierFormModal
          onClose={() => setShowSupplierModal(false)}
          onSave={addSupplier}
        />
      )}

      {showItemModal && (
        <ProcurementItemFormModal
          onClose={() => setShowItemModal(false)}
          onSave={addProcurementItem}
        />
      )}

      {showQuoteModal && (
        <QuotationFormModal
          preselectedItem={quotePreselectedItem}
          onClose={() => {
            setShowQuoteModal(false);
            setQuotePreselectedItem(null);
          }}
          onSave={addQuotation}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <ProcurementProvider>
      <MainLayout />
    </ProcurementProvider>
  );
}
