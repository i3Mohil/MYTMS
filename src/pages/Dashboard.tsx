import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, TrendingUp, Clock } from 'lucide-react';
import db, { Document } from '../db/db';
import { generatePDF } from '../lib/pdfGenerator';

export default function Dashboard() {
  const company = useLiveQuery(() => db.company.toArray());
  const recentDocs = useLiveQuery(() => db.documents.orderBy('id').reverse().limit(5).toArray());
  const pendingDocs = useLiveQuery(() => db.documents.where('status').notEqual('Delivered').count());

  const handlePreviewPDF = (doc: Document) => {
    if (!company || !company[0]) return;
    const pdf = generatePDF(doc, company[0]);
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (!company || !company[0]) return null;

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center bg-indigo-600 text-white p-6 -mx-4 -mt-4 rounded-b-3xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold">{company[0].name}</h1>
          <p className="text-indigo-100 text-sm">{company[0].tagline || 'Transport Management'}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/documents/create"
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
        >
          <div className="bg-indigo-100 p-3 rounded-full">
            <PlusCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="font-medium text-gray-900">Create LR</span>
        </Link>
        <Link
          to="/documents"
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
        >
          <div className="bg-emerald-100 p-3 rounded-full">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="font-medium text-gray-900">All Docs</span>
        </Link>
        <Link
          to="/reports"
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
        >
          <div className="bg-amber-100 p-3 rounded-full">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <span className="font-medium text-gray-900">Pending: {pendingDocs || 0}</span>
        </Link>
        <Link
          to="/ledger"
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
        >
          <div className="bg-blue-100 p-3 rounded-full">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">Ledger</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Recent Documents</h2>
          <Link to="/documents" className="text-sm text-indigo-600 font-medium">View All</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentDocs?.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No documents created yet.
            </div>
          ) : (
            recentDocs?.map(doc => (
              <div key={doc.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <div 
                    className="font-medium text-indigo-600 cursor-pointer hover:underline"
                    onClick={() => handlePreviewPDF(doc)}
                  >
                    {doc.lrNumber}
                  </div>
                  <div className="text-xs text-gray-500">{doc.date} • {doc.pickup} to {doc.delivery}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">₹{doc.freight}</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    doc.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                    doc.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {doc.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
