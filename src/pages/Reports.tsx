import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart2, TrendingUp, Clock, FileText } from 'lucide-react';
import db from '../db/db';

export default function Reports() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const allDocuments = useLiveQuery(() => db.documents.toArray());
  const allLedger = useLiveQuery(() => db.ledger.toArray());

  // Generate available years from documents, default to current year
  const availableYears = Array.from(new Set([
    currentYear.toString(),
    ...(allDocuments?.map(doc => doc.date.substring(0, 4)) || [])
  ])).sort().reverse();

  const documents = allDocuments?.filter(doc => doc.date.startsWith(selectedYear));
  const ledger = allLedger?.filter(entry => entry.date.startsWith(selectedYear));

  const totalFreight = documents?.reduce((sum, doc) => sum + (doc.freight || 0), 0) || 0;
  const pendingDocs = documents?.filter(doc => doc.status !== 'Delivered').length || 0;
  const totalDocs = documents?.length || 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="bg-gray-100 border-transparent rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2">
            <div className="bg-indigo-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg">₹{totalFreight}</span>
            <span className="text-xs text-gray-500">Total Freight</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2">
            <div className="bg-amber-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg">{pendingDocs}</span>
            <span className="text-xs text-gray-500">Pending Deliveries</span>
          </div>
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
            <span className="font-bold text-gray-900 text-lg">{ledger?.length || 0}</span>
            <span className="text-xs text-gray-500">Ledger Entries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
