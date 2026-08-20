import React, { useState } from 'react';
import { X, Building2, MapPin, User, ShieldCheck, CreditCard, Clock, Plus, Trash2 } from 'lucide-react';
import { Supplier, CreditTerm, CTOSStatus } from '../../types/procurement';

interface SupplierFormModalProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSave: (supplierData: Omit<Supplier, 'id' | 'code' | 'createdAt'>) => void;
  onUpdate?: (id: string, updates: Partial<Supplier>) => void;
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

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  supplier,
  onClose,
  onSave,
  onUpdate
}) => {
  const isEdit = !!supplier;

  const [name, setName] = useState(supplier?.name || '');
  const [companyRegistration, setCompanyRegistration] = useState(supplier?.companyRegistration || '');
  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>(supplier?.categories || ['IT Hardware']);
  
  const [productInput, setProductInput] = useState('');
  const [productsAndServices, setProductsAndServices] = useState<string[]>(
    supplier?.productsAndServices || ['Hardware Supplies', 'Maintenance Support']
  );

  const [address, setAddress] = useState(supplier?.location.address || '');
  const [city, setCity] = useState(supplier?.location.city || 'Kuala Lumpur');
  const [state, setState] = useState(supplier?.location.state || 'Wilayah Persekutuan Kuala Lumpur');
  const [country, setCountry] = useState(supplier?.location.country || 'Malaysia');
  const [postalCode, setPostalCode] = useState(supplier?.location.postalCode || '50000');

  const [picName, setPicName] = useState(supplier?.contact.picName || '');
  const [designation, setDesignation] = useState(supplier?.contact.designation || 'Sales Manager');
  const [email, setEmail] = useState(supplier?.contact.email || '');
  const [phone, setPhone] = useState(supplier?.contact.phone || '+60 3-');
  const [alternatePhone, setAlternatePhone] = useState(supplier?.contact.alternatePhone || '');

  const [ctosStatus, setCtosStatus] = useState<CTOSStatus>(supplier?.ctos.status || 'Verified');
  const [ctosScore, setCtosScore] = useState<number>(supplier?.ctos.score || 750);
  const [creditTerms, setCreditTerms] = useState<CreditTerm>(supplier?.creditTerms || 'Net 30');
  const [standardLeadTime, setStandardLeadTime] = useState(supplier?.standardLeadTime || '5-7 business days');
  const [minimumOrderValue, setMinimumOrderValue] = useState<number>(supplier?.minimumOrderValue || 2000);
  const [notes, setNotes] = useState(supplier?.notes || '');

  const handleAddCategory = () => {
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      setCategories([...categories, categoryInput.trim()]);
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleAddProduct = () => {
    if (productInput.trim() && !productsAndServices.includes(productInput.trim())) {
      setProductsAndServices([...productsAndServices, productInput.trim()]);
      setProductInput('');
    }
  };

  const handleRemoveProduct = (prod: string) => {
    setProductsAndServices(productsAndServices.filter(p => p !== prod));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const riskLevel = ctosScore >= 700 ? 'Low' : ctosScore >= 600 ? 'Medium' : 'High';

    const supplierData: Omit<Supplier, 'id' | 'code' | 'createdAt'> = {
      name,
      companyRegistration: companyRegistration || 'Pending SSM',
      categories: categories.length > 0 ? categories : ['General Supplies'],
      productsAndServices: productsAndServices.length > 0 ? productsAndServices : ['Standard Procurement Item'],
      location: {
        address,
        city,
        state,
        country,
        postalCode,
      },
      contact: {
        picName,
        designation,
        email,
        phone,
        alternatePhone,
      },
      ctos: {
        status: ctosStatus,
        score: ctosScore,
        riskLevel,
        lastCheckedDate: new Date().toISOString().split('T')[0],
        registrationNumber: companyRegistration || 'N/A',
        litigationRecordCount: ctosStatus === 'Flagged' ? 2 : 0,
        bankruptcyFlag: ctosStatus === 'Flagged',
        directorsVerification: ctosStatus === 'Flagged' ? 'Unverified' : 'Verified',
        summaryNotes: supplier?.ctos.summaryNotes || 'Registered vendor profile. Passed initial vendor onboarding compliance.',
      },
      creditTerms,
      standardLeadTime,
      minimumOrderValue,
      rating: supplier?.rating || 4.5,
      notes,
    };

    if (isEdit && supplier && onUpdate) {
      onUpdate(supplier.id, supplierData);
    } else {
      onSave(supplierData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold">
                {isEdit ? `Edit Supplier: ${supplier?.name}` : 'Enrol New Supplier into Database'}
              </h2>
              <p className="text-[11px] text-slate-400">Capture supplier profile, CTOS compliance, and commercial credit terms</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Company Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Building2 className="w-4 h-4 text-indigo-600" /> 1. Company Identity & Registration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Registered Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Infotech Solutions Sdn Bhd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SSM / Business Reg. No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 201401029482 (1095568-X)"
                  value={companyRegistration}
                  onChange={(e) => setCompanyRegistration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <User className="w-4 h-4 text-emerald-600" /> 2. Person In Charge (PIC) & Contacts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIC Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Tan"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Corporate Sales Lead"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. m.tan@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Office / Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +60 3-2181 9900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile / Alternate Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +60 12-345 6789"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Supplier Location */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <MapPin className="w-4 h-4 text-rose-500" /> 3. Supplier Location & Facility Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Level 14, Menara Horizon, Jalan Bukit Bintang"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* CTOS & Commercial Credit Terms */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 4. CTOS Status & Commercial Terms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">CTOS Status</label>
                <select
                  value={ctosStatus}
                  onChange={(e) => setCtosStatus(e.target.value as CTOSStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Verified">Verified (Low Risk)</option>
                  <option value="Pending">Pending (Medium Risk)</option>
                  <option value="Flagged">Flagged (High Risk)</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">CTOS Score (300-850)</label>
                <input
                  type="number"
                  min="300"
                  max="850"
                  value={ctosScore}
                  onChange={(e) => setCtosScore(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credit Terms</label>
                <select
                  value={creditTerms}
                  onChange={(e) => setCreditTerms(e.target.value as CreditTerm)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {CREDIT_TERM_OPTIONS.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Lead Time</label>
                <input
                  type="text"
                  placeholder="e.g. 5-7 business days"
                  value={standardLeadTime}
                  onChange={(e) => setStandardLeadTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Products & Services Tagging */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs">5. Products & Services Catalog</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type product/service item and press Enter (e.g. Cisco Routers, Pallet Racks)"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProduct();
                  }
                }}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddProduct}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {productsAndServices.map((prod, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                  <span>{prod}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(prod)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
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
              {isEdit ? 'Save Changes' : 'Register Supplier'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
