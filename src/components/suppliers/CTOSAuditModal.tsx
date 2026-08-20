import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle2, Building, Calendar, FileText } from 'lucide-react';
import { Supplier, CTOSStatus } from '../../types/procurement';
import { getCTOSColor } from '../../utils/formatters';

interface CTOSAuditModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onUpdateCTOS: (
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
}

export const CTOSAuditModal: React.FC<CTOSAuditModalProps> = ({
  supplier,
  onClose,
  onUpdateCTOS
}) => {
  if (!supplier) return null;

  const [score, setScore] = useState<number>(supplier.ctos.score);
  const [status, setStatus] = useState<CTOSStatus>(supplier.ctos.status);
  const [notes, setNotes] = useState<string>(supplier.ctos.summaryNotes);
  const [litigationCount, setLitigationCount] = useState<number>(supplier.ctos.litigationRecordCount || 0);
  const [bankruptcyFlag, setBankruptcyFlag] = useState<boolean>(supplier.ctos.bankruptcyFlag || false);
  const [directorsVerification, setDirectorsVerification] = useState<'Verified' | 'Unverified'>(
    supplier.ctos.directorsVerification || 'Verified'
  );
  const [lastCheckedDate, setLastCheckedDate] = useState<string>(
    supplier.ctos.lastCheckedDate || new Date().toISOString().split('T')[0]
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCTOS(supplier.id, status, score, notes, {
      litigationRecordCount: litigationCount,
      bankruptcyFlag,
      directorsVerification,
      lastCheckedDate
    });
    onClose();
  };

  const currentTheme = getCTOSColor(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">Manual CTOS Credit Record Entry</h2>
              <p className="text-[11px] text-slate-400">{supplier.name} ({supplier.code}) • SSM: {supplier.companyRegistration}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          
          {/* Information Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>CTOS Report Manual Entry</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Manually record the credit score, litigation records, and KYC compliance details from the vendor's physical or electronic CTOS report.
            </p>
          </div>

          {/* Current Score Gauge Preview */}
          <div className={`p-4 rounded-xl border ${currentTheme.bg} flex items-center justify-between`}>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Assessed Standing</span>
              <p className="text-xl font-bold">{score} / 850</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${currentTheme.badge}`}>
              {status} • {score >= 700 ? 'Low Risk' : score >= 600 ? 'Medium Risk' : 'High Risk'}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5">
            
            {/* Status & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">CTOS Verification Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CTOSStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Verified">Verified (Low Risk)</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="Flagged">Flagged / High Risk</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Date</label>
                <input
                  type="date"
                  value={lastCheckedDate}
                  onChange={(e) => setLastCheckedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Score slider & input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">CTOS Score (300 - 850)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="300"
                    max="850"
                    value={score}
                    onChange={(e) => setScore(Math.max(300, Math.min(850, Number(e.target.value))))}
                    className="w-16 px-2 py-0.5 border border-slate-300 rounded font-bold text-center text-slate-900"
                  />
                  <span className="text-slate-400 font-normal">/ 850</span>
                </div>
              </div>
              <input
                type="range"
                min="300"
                max="850"
                step="5"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>300 (High Risk)</span>
                <span>650 (Satisfactory)</span>
                <span>850 (Exceptional)</span>
              </div>
            </div>

            {/* Litigation & Bankruptcy */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Litigation Cases Count</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={litigationCount}
                  onChange={(e) => setLitigationCount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bankruptcy Record</label>
                <select
                  value={bankruptcyFlag ? 'true' : 'false'}
                  onChange={(e) => setBankruptcyFlag(e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="false">Clear (No Active Bankruptcy)</option>
                  <option value="true">Flagged (Active Bankruptcy Alert)</option>
                </select>
              </div>
            </div>

            {/* Directors Verification */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Directors & Shareholders KYC</label>
              <select
                value={directorsVerification}
                onChange={(e) => setDirectorsVerification(e.target.value as 'Verified' | 'Unverified')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Verified">Verified (Pass SSM and NRIC/Passport check)</option>
                <option value="Unverified">Unverified (Pending identity documentation)</option>
              </select>
            </div>

            {/* Audit notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manual Evaluation Notes & Findings</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter credit evaluation findings, trade bureau records, report reference numbers, or remarks..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              Save CTOS Record
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
