import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, Users, Phone, MapPin } from 'lucide-react';
import db from '../db/db';

export default function Directory() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  const directory = useLiveQuery(
    () => {
      let collection = db.directory.orderBy('name');
      if (filter !== 'All') {
        collection = db.directory.where('type').equals(filter);
      }
      return collection.toArray();
    },
    [filter]
  );

  const filteredDirectory = directory?.filter(entry => 
    entry.name.toLowerCase().includes(search.toLowerCase()) ||
    entry.phone.includes(search)
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Directory</h1>
          <button
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Client', 'Driver', 'Vehicle', 'Broker'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredDirectory?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="w-12 h-12 mb-4 text-gray-300" />
            <p>No contacts found.</p>
          </div>
        ) : (
          filteredDirectory?.map(entry => (
            <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="font-bold text-gray-900 text-lg">{entry.name}</div>
                <div className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                  {entry.type}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${entry.phone}`} className="text-indigo-600 hover:underline">{entry.phone}</a>
              </div>

              {entry.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>{entry.address}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
