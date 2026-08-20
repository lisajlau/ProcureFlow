import React, { useState } from 'react';
import { X, Package, Tag, Layers, MapPin, AlignLeft, Flag } from 'lucide-react';
import { ProcurementItem, ProcurementPriority, ProcurementStatus } from '../../types/procurement';

interface ProcurementItemFormModalProps {
  item?: ProcurementItem | null;
  onClose: () => void;
  onSave: (data: Omit<ProcurementItem, 'id' | 'itemCode' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<ProcurementItem>) => void;
}

const CATEGORIES = [
  'IT Hardware',
  'Enterprise Computing',
  'Warehouse Equipment',
  'Office Furniture',
  'Packaging & Supplies',
  'Data Center & Power',
  'Facilities & Maintenance',
  'Professional Services',
  'Safety & Security'
];

export const ProcurementItemFormModal: React.FC<ProcurementItemFormModalProps> = ({
  item,
  onClose,
  onSave,
  onUpdate
}) => {
  const isEdit = !!item;

  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState(item?.category || 'IT Hardware');
  const [description, setDescription] = useState(item?.description || '');
  const [specifications, setSpecifications] = useState(item?.specifications || '');
  const [priority, setPriority] = useState<ProcurementPriority>(item?.priority || 'Medium');
  const [status, setStatus] = useState<ProcurementStatus>(item?.status || 'RFQ Issued');
  const [department, setDepartment] = useState(item?.department || 'Operations');
  const [requesterName, setRequesterName] = useState(item?.requesterName || 'Procurement Team');
  const [deliveryLocation, setDeliveryLocation] = useState(
    item?.deliveryLocation || 'Cyberjaya Operations Facility, Level 2'
  );
  const [specialInstructions, setSpecialInstructions] = useState(item?.specialInstructions || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const itemData: Omit<ProcurementItem, 'id' | 'itemCode' | 'createdAt' | 'updatedAt'> = {
      title,
      category,
      description,
      specifications,
      priority,
      status,
      department,
      requesterName,
      deliveryLocation,
      specialInstructions,
    };

    if (isEdit && item && onUpdate) {
      onUpdate(item.id, itemData);
    } else {
      onSave(itemData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold">
                {isEdit ? `Edit Requisition: ${item?.itemCode}` : 'Create New Procurement Item / Requisition'}
              </h2>
              <p className="text-[11px] text-slate-400">Specify item requirements, category, and technical specifications</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Section 1: Item Title & Category */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Item Title / Requirement Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise Workstation Laptops for Engineering Team"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. IT & Infrastructure"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requester Name</label>
                <input
                  type="text"
                  placeholder="e.g. Adeline Foo (Head of IT)"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Procurement Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProcurementPriority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent / Critical</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProcurementStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="RFQ Issued">RFQ Issued</option>
                <option value="Quotes Received">Quotes Received</option>
                <option value="Under Evaluation">Under Evaluation</option>
                <option value="Awarded">Awarded</option>
                <option value="PO Issued">PO Issued</option>
                <option value="Delivered">Delivered</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Section 3: Detailed Description & Technical Specifications */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <AlignLeft className="w-4 h-4 text-slate-600" /> Item Descriptions & Technical Specifications
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">General Description</label>
              <textarea
                rows={2}
                placeholder="Describe the business justification and overview of the item..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Technical Specifications *</label>
              <textarea
                rows={4}
                required
                placeholder="Include exact model codes, dimensions, performance specs, tolerances, requirements..."
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Section 4: Delivery Location & Instructions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Destination / Warehouse</label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Handling / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Forklift required, on-site assembly included"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
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
              {isEdit ? 'Update Requisition' : 'Create Requisition'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
