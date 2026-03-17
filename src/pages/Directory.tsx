import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, Users, Phone, MapPin, X, Truck } from 'lucide-react';
import db from '../db/db';

export default function Directory() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newType, setNewType] = useState<'Client' | 'Driver' | 'Vehicle' | 'Broker'>('Client');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTruckNo, setNewTruckNo] = useState('');
  const [newRto, setNewRto] = useState('');
  
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.directory.add({
      type: newType,
      name: newName,
      phone: newPhone,
      address: newAddress,
      truckNo: newTruckNo,
      rto: newRto,
      notes: ''
    });
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewTruckNo('');
    setNewRto('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Directory</h1>
          <button
            onClick={() => setShowAddModal(true)}
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
              
              {(entry.truckNo || entry.rto) && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>{entry.truckNo} {entry.rto ? `(${entry.rto})` : ''}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add Contact</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Client">Client</option>
                  <option value="Driver">Driver</option>
                  <option value="Broker">Broker</option>
                  <option value="Vehicle">Vehicle</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name / Vehicle Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {(newType === 'Client' || newType === 'Driver' || newType === 'Broker') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {(newType === 'Client' || newType === 'Broker') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {(newType === 'Driver' || newType === 'Vehicle') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Truck / Vehicle No.</label>
                    <input
                      type="text"
                      value={newTruckNo}
                      onChange={(e) => setNewTruckNo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RTO</label>
                    <input
                      type="text"
                      value={newRto}
                      onChange={(e) => setNewRto(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
