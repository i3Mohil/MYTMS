import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, BookOpen } from 'lucide-react';
import db from '../db/db';

export default function Ledger() {
  const [search, setSearch] = useState('');
  
  const ledgerEntries = useLiveQuery(() => db.ledger.orderBy('date').reverse().toArray());

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Ledger</h1>
          <button
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search party, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {ledgerEntries?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <BookOpen className="w-12 h-12 mb-4 text-gray-300" />
            <p>No ledger entries found.</p>
          </div>
        ) : (
          ledgerEntries?.map(entry => (
            <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <div className="font-bold text-gray-900">{entry.description}</div>
                <div className="text-xs text-gray-500">
                  {entry.date ? entry.date.split('-').reverse().join('-') : ''}
                </div>
              </div>
              <div className={`font-bold ${entry.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                {entry.type === 'Credit' ? '+' : '-'}₹{entry.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
