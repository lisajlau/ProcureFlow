import React from 'react';
import { 
  Building2, 
  Package, 
  FileText, 
  Scale, 
  RotateCcw,
  Plus,
  Layers
} from 'lucide-react';
import { useProcurement, NavigationTab } from '../context/ProcurementContext';

interface HeaderProps {
  onOpenNewItemModal?: () => void;
  onOpenNewSupplierModal?: () => void;
  onOpenNewQuoteModal?: () => void;
  onOpenNewItem?: () => void;
  onOpenNewSupplier?: () => void;
  onOpenNewQuote?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewItemModal,
  onOpenNewSupplierModal,
  onOpenNewQuoteModal,
  onOpenNewItem,
  onOpenNewSupplier,
  onOpenNewQuote
}) => {
  const handleOpenItem = onOpenNewItemModal || onOpenNewItem || (() => {});
  const handleOpenSupplier = onOpenNewSupplierModal || onOpenNewSupplier || (() => {});
  const handleOpenQuote = onOpenNewQuoteModal || onOpenNewQuote || (() => {});

  const { 
    activeTab, 
    setActiveTab, 
    suppliers, 
    items, 
    quotations, 
    resetToDemoData 
  } = useProcurement();

  const [showQuickMenu, setShowQuickMenu] = React.useState(false);

  const activeItemsCount = items.filter(i => i.status !== 'Closed' && i.status !== 'Delivered').length;

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'suppliers', label: 'Supplier Database', icon: Building2, badge: suppliers.length },
    { id: 'items', label: 'Procurement Items', icon: Package, badge: activeItemsCount },
    { id: 'quotations', label: 'Quotations Hub', icon: FileText, badge: quotations.length },
    { id: 'comparison', label: 'Quote Comparison', icon: Scale },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Banner with Brand & Action Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/80">
          
          {/* Logo & System Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-inner shadow-white/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">ProcureFlow</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400">Procurement Requisitions, Quotation Comparison & Supplier Intelligence</p>
            </div>
          </div>

          {/* Quick Actions & Reset */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => {
                if (window.confirm('Reset all suppliers, procurement items, and quotes to clean demo data?')) {
                  resetToDemoData();
                }
              }}
              title="Reset to Initial Demo State"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                id="quick-create-btn"
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-indigo-600/30 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create New</span>
              </button>

              {showQuickMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowQuickMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setShowQuickMenu(false);
                        handleOpenItem();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <Package className="w-4 h-4 text-blue-400" />
                      <span>New Procurement Requisition</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowQuickMenu(false);
                        handleOpenQuote();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Log Received Quotation</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowQuickMenu(false);
                        handleOpenSupplier();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>Add New Supplier</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2.5 scrollbar-none" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
