export type CTOSStatus = 'Verified' | 'Pending' | 'Flagged' | 'Under Review';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type CreditTerm = 
  | 'COD'
  | 'Net 7'
  | 'Net 14'
  | 'Net 30'
  | 'Net 45'
  | 'Net 60'
  | 'Net 90'
  | '30% Advance / 70% Delivery'
  | '50% Advance / 50% Delivery';

export type ProcurementPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ProcurementStatus = 
  | 'Draft'
  | 'RFQ Issued'
  | 'Quotes Received'
  | 'Under Evaluation'
  | 'Awarded'
  | 'PO Issued'
  | 'Delivered'
  | 'Closed';

export type QuotationStatus = 'Received' | 'Under Review' | 'Shortlisted' | 'Awarded' | 'Rejected';

export interface SupplierContact {
  picName: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone?: string;
}

export interface CTOSReport {
  status: CTOSStatus;
  score: number; // e.g., 300 - 850
  riskLevel: RiskLevel;
  lastCheckedDate: string;
  registrationNumber: string; // SSM / Business reg
  litigationRecordCount: number;
  bankruptcyFlag: boolean;
  directorsVerification: 'Verified' | 'Unverified';
  summaryNotes: string;
}

export interface Supplier {
  id: string;
  code: string; // e.g. SUP-001
  name: string;
  companyRegistration: string;
  categories: string[];
  productsAndServices: string[];
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: SupplierContact;
  ctos: CTOSReport;
  creditTerms: CreditTerm;
  standardLeadTime: string; // e.g., "5-7 business days"
  minimumOrderValue?: number;
  rating: number; // 1-5
  notes?: string;
  activeContractsCount?: number;
  createdAt: string;
}

export interface ProcurementItem {
  id: string;
  itemCode: string; // e.g., PR-2026-001
  title: string;
  category: string;
  description: string;
  specifications: string;
  priority: ProcurementPriority;
  status: ProcurementStatus;
  department: string;
  requesterName: string;
  deliveryLocation: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  awardedQuotationId?: string;
  awardedSupplierId?: string;
  purchaseOrderNumber?: string;
}

export interface QuotationLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string; // e.g., QT-2026-882
  procurementItemId: string;
  supplierId: string;
  supplierName: string;
  submissionDate: string;
  validUntil: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  taxAmount: number; // e.g. 6% or 8% SST
  shippingFee: number;
  totalAmount: number;
  currency: string;
  offeredLeadTime: string; // e.g., "3 business days"
  estimatedDeliveryDate: string;
  proposedCreditTerms: CreditTerm;
  warrantyPeriod: string; // e.g. "12 Months On-Site"
  complianceScore?: number; // 0-100%
  status: QuotationStatus;
  remarks: string;
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
  specCompliance: 'Fully Compliant' | 'Partially Compliant' | 'Alternate Spec Offered';
  discountOffered?: number;
  evaluatorNotes?: string;
  awardedDate?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  procurementItemId: string;
  procurementItemTitle: string;
  supplierId: string;
  supplierName: string;
  quotationId: string;
  quoteNumber: string;
  totalAmount: number;
  issueDate: string;
  expectedDeliveryDate: string;
  status: 'Draft' | 'Sent' | 'Acknowledged' | 'Partially Received' | 'Fulfilled' | 'Cancelled';
  paymentTerms: CreditTerm;
  deliveryAddress: string;
  authorizedSignatory: string;
}
