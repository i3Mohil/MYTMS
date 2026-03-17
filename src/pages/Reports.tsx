import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart2, TrendingUp, Clock, FileText, X, CheckCircle } from 'lucide-react';
import db from '../db/db';

export default function Reports() {
  const [timeFilter, setTimeFilter] = useState<'Today' | 'This Week' | 'This Month' | 'This Year' | 'All Time'>('This Month');
  const [showModal, setShowModal] = useState<'Freight' | 'Pending' | null>(null);

  const allDocuments = useLiveQuery(() => db.documents.toArray());
  const allLedger = useLiveQuery(() => db.ledger.toArray());

  const filteredDocuments = useMemo(() => {
    if (!allDocuments) return [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return allDocuments.filter(doc => {
      const [year, month, day] = doc.date.split('-').map(Number);
      const docDate = new Date(year, month - 1, day);
      switch (timeFilter) {
        case 'Today':
          return docDate >= today;
        case 'This Week':
          return docDate >= startOfWeek;
        case 'This Month':
          return docDate >= startOfMonth;
        case 'This Year':
          return docDate >= startOfYear;
        case 'All Time':
        default:
          return true;
      }
    });
  }, [allDocuments, timeFilter]);

  const totalFreight = filteredDocuments.reduce((sum, doc) => sum + (doc.freight || 0), 0);
  
  const pendingDocs = filteredDocuments.filter(doc => (doc.remainingToPay || 0) > 0 && doc.paymentType === 'To Pay');
  const totalPendingAmount = pendingDocs.reduce((sum, doc) => sum + (doc.remainingToPay || 0), 0);
  
  const totalDocs = filteredDocuments.length;

  const handleMarkAsPaid = async (docId: number) => {
    await db.documents.update(docId, {
      paymentType: 'Paid',
      remainingToPay: 0
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['Today', 'This Week', 'This Month', 'This Year', 'All Time'].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                timeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setShowModal('Freight')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
          >
            <div className="bg-indigo-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg">₹{totalFreight}</span>
            <span className="text-xs text-gray-500">Total Freight</span>
          </button>
          
          <button 
            onClick={() => setShowModal('Pending')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
          >
            <div className="bg-amber-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg">₹{totalPendingAmount}</span>
            <span className="text-xs text-gray-500">Pending Amount</span>
          </button>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2">
            <div className="bg-emerald-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg">{totalDocs}</span>
            <span className="text-xs text-gray-500">Total LRs</span>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2">
            <div className="bg-blue-100 p-3 rounded-full">
              <BarChart2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg">{allLedger?.length || 0}</span>
            <span className="text-xs text-gray-500">Ledger Entries</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {showModal === 'Freight' ? 'Freight History' : 'Pending Amounts'}
              </h2>
              <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {showModal === 'Freight' && filteredDocuments.length === 0 && (
                <p className="text-center text-gray-500 py-4">No transactions found.</p>
              )}
              {showModal === 'Freight' && filteredDocuments.map(doc => (
                <div key={doc.id} className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900">{doc.lrNumber}</div>
                    <div className="text-xs text-gray-500">{doc.date}</div>
                  </div>
                  <div className="font-bold text-indigo-600">₹{doc.freight}</div>
                </div>
              ))}

              {showModal === 'Pending' && pendingDocs.length === 0 && (
                <p className="text-center text-gray-500 py-4">No pending amounts.</p>
              )}
              {showModal === 'Pending' && pendingDocs.map(doc => (
                <div key={doc.id} className="bg-amber-50 p-3 rounded-xl flex flex-col gap-2 border border-amber-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900">{doc.lrNumber}</div>
                      <div className="text-xs text-gray-500">{doc.date}</div>
                    </div>
                    <div className="font-bold text-amber-600">₹{doc.remainingToPay}</div>
                  </div>
                  <button
                    onClick={() => handleMarkAsPaid(doc.id!)}
                    className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors mt-1"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Mark as Paid
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
