import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Download } from 'lucide-react';
import db from '../db/db';
import { generatePDF } from '../lib/pdfGenerator';

export default function Documents() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  const documents = useLiveQuery(
    () => {
      let collection = db.documents.orderBy('id').reverse();
      if (filter !== 'All') {
        collection = db.documents.where('status').equals(filter).reverse();
      }
      return collection.toArray();
    },
    [filter]
  );

  const company = useLiveQuery(() => db.company.toArray());
  const user = useLiveQuery(() => db.users.toArray());

  const filteredDocs = documents?.filter(doc => 
    doc.lrNumber.toLowerCase().includes(search.toLowerCase()) ||
    doc.pickup.toLowerCase().includes(search.toLowerCase()) ||
    doc.delivery.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (doc: any) => {
    if (!company || !company[0]) return;
    try {
      const userEmail = user?.[0]?.email;
      const pdf = generatePDF(doc, company[0], userEmail);
      pdf.save(`${doc.lrNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Documents</h1>
          <Link
            to="/documents/create"
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search LR, City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Booked', 'In Transit', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredDocs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mb-4 text-gray-300" />
            <p>No documents found.</p>
          </div>
        ) : (
          filteredDocs?.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-900 text-lg">{doc.lrNumber}</div>
                  <div className="text-xs text-gray-500">
                    {doc.date ? doc.date.split('-').reverse().join('-') : ''}
                  </div>
                </div>
                <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  doc.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                  doc.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {doc.status}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <div className="flex-1 truncate">{doc.pickup}</div>
                <div className="text-gray-400">→</div>
                <div className="flex-1 truncate text-right">{doc.delivery}</div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="font-bold text-gray-900">₹{doc.freight} <span className="text-xs font-normal text-gray-500">({doc.paymentType})</span></div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
