import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Supplier, 
  ProcurementItem, 
  Quotation, 
  PurchaseOrder,
  QuotationStatus,
  CTOSStatus
} from '../types/procurement';
import { 
  INITIAL_SUPPLIERS, 
  INITIAL_PROCUREMENT_ITEMS, 
  INITIAL_QUOTATIONS, 
  INITIAL_PURCHASE_ORDERS 
} from '../data/initialData';

export type NavigationTab = 'suppliers' | 'items' | 'quotations' | 'comparison';

interface ProcurementContextType {
  suppliers: Supplier[];
  items: ProcurementItem[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedComparisonItemId: string | null;
  setSelectedComparisonItemId: (id: string | null) => void;
  
  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'code' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  updateCTOSStatus: (
    supplierId: string, 
    status: CTOSStatus, 
    score: number, 
    notes: string,
    extra?: {
      litigationRecordCount?: number;
      bankruptcyFlag?: boolean;
      directorsVerification?: 'Verified' | 'Unverified';
      lastCheckedDate?: string;
    }
  ) => void;

  // Item Actions
  addProcurementItem: (item: Omit<ProcurementItem, 'id' | 'itemCode' | 'createdAt' | 'updatedAt'>) => ProcurementItem;
  updateProcurementItem: (id: string, updates: Partial<ProcurementItem>) => void;
  deleteProcurementItem: (id: string) => void;

  // Quotation Actions
  addQuotation: (quote: Omit<Quotation, 'id' | 'quoteNumber'>) => Quotation;
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;
  awardQuotation: (quotationId: string, authorizedSignatory?: string) => void;
  deleteQuotation: (id: string) => void;

  // Utilities
  resetToDemoData: () => void;
  startQuoteComparisonForItem: (itemId: string) => void;
}

const STORAGE_KEYS = {
  SUPPLIERS: 'procureflow_suppliers_v2',
  ITEMS: 'procureflow_items_v2',
  QUOTATIONS: 'procureflow_quotations_v2',
  PURCHASE_ORDERS: 'procureflow_pos_v2',
};

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [items, setItems] = useState<ProcurementItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_PROCUREMENT_ITEMS;
    } catch {
      return INITIAL_PROCUREMENT_ITEMS;
    }
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
    } catch {
      return INITIAL_QUOTATIONS;
    }
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
    } catch {
      return INITIAL_PURCHASE_ORDERS;
    }
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('suppliers');
  const [selectedComparisonItemId, setSelectedComparisonItemId] = useState<string | null>(
    INITIAL_PROCUREMENT_ITEMS[0]?.id || null
  );

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [quotations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [purchaseOrders]);

  // SUPPLIER ACTIONS
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'code' | 'createdAt'>): Supplier => {
    const nextIndex = suppliers.length + 1;
    const code = `SUP-${String(nextIndex).padStart(3, '0')}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      code,
      createdAt: new Date().toISOString().split('T')[0],
      activeContractsCount: 0,
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const updateCTOSStatus = (
    supplierId: string, 
    status: CTOSStatus, 
    score: number, 
    notes: string,
    extra?: {
      litigationRecordCount?: number;
      bankruptcyFlag?: boolean;
      directorsVerification?: 'Verified' | 'Unverified';
      lastCheckedDate?: string;
    }
  ) => {
    const riskLevel = score >= 700 ? 'Low' : score >= 600 ? 'Medium' : 'High';
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          ctos: {
            ...s.ctos,
            status,
            score,
            riskLevel,
            lastCheckedDate: extra?.lastCheckedDate || new Date().toISOString().split('T')[0],
            litigationRecordCount: extra?.litigationRecordCount !== undefined ? extra.litigationRecordCount : s.ctos.litigationRecordCount,
            bankruptcyFlag: extra?.bankruptcyFlag !== undefined ? extra.bankruptcyFlag : s.ctos.bankruptcyFlag,
            directorsVerification: extra?.directorsVerification || s.ctos.directorsVerification,
            summaryNotes: notes || s.ctos.summaryNotes,
          }
        };
      }
      return s;
    }));
  };

  // ITEM ACTIONS
  const addProcurementItem = (itemData: Omit<ProcurementItem, 'id' | 'itemCode' | 'createdAt' | 'updatedAt'>): ProcurementItem => {
    const nextNum = items.length + 1;
    const itemCode = `PR-2026-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];
    const newItem: ProcurementItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      itemCode,
      createdAt: now,
      updatedAt: now,
    };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateProcurementItem = (id: string, updates: Partial<ProcurementItem>) => {
    const now = new Date().toISOString().split('T')[0];
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: now } : item));
  };

  const deleteProcurementItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    // Also remove associated quotes
    setQuotations(prev => prev.filter(q => q.procurementItemId !== id));
  };

  // QUOTATION ACTIONS
  const addQuotation = (quoteData: Omit<Quotation, 'id' | 'quoteNumber'>): Quotation => {
    const nextNum = quotations.length + 101;
    const quoteNumber = `QT-2026-${nextNum}`;
    const newQuote: Quotation = {
      ...quoteData,
      id: `qt-${Date.now()}`,
      quoteNumber,
    };
    setQuotations(prev => [newQuote, ...prev]);

    // If item was in RFQ Issued or Draft, transition to Quotes Received
    const targetItem = items.find(i => i.id === quoteData.procurementItemId);
    if (targetItem && (targetItem.status === 'Draft' || targetItem.status === 'RFQ Issued')) {
      updateProcurementItem(targetItem.id, { status: 'Quotes Received' });
    }

    return newQuote;
  };

  const updateQuotationStatus = (id: string, status: QuotationStatus) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const awardQuotation = (quotationId: string, authorizedSignatory: string = 'Procurement Committee') => {
    const selectedQuote = quotations.find(q => q.id === quotationId);
    if (!selectedQuote) return;

    const targetItem = items.find(i => i.id === selectedQuote.procurementItemId);
    if (!targetItem) return;

    const poNumber = `PO-2026-${String(purchaseOrders.length + 90).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    // 1. Update quotation status to Awarded and others for this item to Rejected
    setQuotations(prev => prev.map(q => {
      if (q.procurementItemId === selectedQuote.procurementItemId) {
        if (q.id === quotationId) {
          return { ...q, status: 'Awarded', awardedDate: today };
        } else {
          return { ...q, status: 'Rejected' };
        }
      }
      return q;
    }));

    // 2. Update Procurement Item
    setItems(prev => prev.map(item => {
      if (item.id === selectedQuote.procurementItemId) {
        return {
          ...item,
          status: 'Awarded',
          awardedQuotationId: quotationId,
          awardedSupplierId: selectedQuote.supplierId,
          purchaseOrderNumber: poNumber,
          updatedAt: today
        };
      }
      return item;
    }));

    // 3. Create Purchase Order
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      procurementItemId: targetItem.id,
      procurementItemTitle: targetItem.title,
      supplierId: selectedQuote.supplierId,
      supplierName: selectedQuote.supplierName,
      quotationId: selectedQuote.id,
      quoteNumber: selectedQuote.quoteNumber,
      totalAmount: selectedQuote.totalAmount,
      issueDate: today,
      expectedDeliveryDate: selectedQuote.estimatedDeliveryDate || targetItem.targetDeliveryDate,
      status: 'Sent',
      paymentTerms: selectedQuote.proposedCreditTerms,
      deliveryAddress: targetItem.deliveryLocation || 'Main Logistics Warehouse',
      authorizedSignatory,
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  // UTILITIES
  const resetToDemoData = () => {
    setSuppliers(INITIAL_SUPPLIERS);
    setItems(INITIAL_PROCUREMENT_ITEMS);
    setQuotations(INITIAL_QUOTATIONS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.PURCHASE_ORDERS);
    localStorage.removeItem('procureflow_payments_v1');
  };

  const startQuoteComparisonForItem = (itemId: string) => {
    setSelectedComparisonItemId(itemId);
    setActiveTab('comparison');
  };

  return (
    <ProcurementContext.Provider value={{
      suppliers,
      items,
      quotations,
      purchaseOrders,
      activeTab,
      setActiveTab,
      selectedComparisonItemId,
      setSelectedComparisonItemId,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      updateCTOSStatus,
      addProcurementItem,
      updateProcurementItem,
      deleteProcurementItem,
      addQuotation,
      updateQuotationStatus,
      awardQuotation,
      deleteQuotation,
      resetToDemoData,
      startQuoteComparisonForItem,
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};
