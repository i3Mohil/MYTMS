import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LogOut, Building2, Download, Upload, Shield, Plus, Trash2 } from 'lucide-react';
import db, { Company, CustomFieldDef } from '../db/db';

export default function Settings() {
  const company = useLiveQuery(() => db.company.toArray());
  const user = useLiveQuery(() => db.users.toArray());

  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number'>('text');

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await db.users.clear();
      window.location.href = '/';
    }
  };

  const handleExport = async () => {
    const data = {
      users: await db.users.toArray(),
      company: await db.company.toArray(),
      directory: await db.directory.toArray(),
      documents: await db.documents.toArray(),
      ledger: await db.ledger.toArray(),
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TransportDB_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const updateCompanyField = async (field: keyof Company, value: any) => {
    if (!company || !company[0] || !company[0].id) return;
    await db.company.update(company[0].id, { [field]: value });
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCompanyField(field, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomField = async () => {
    if (!newFieldLabel.trim() || !company || !company[0] || !company[0].id) return;
    
    const newField: CustomFieldDef = {
      id: `custom_${Date.now()}`,
      label: newFieldLabel.trim(),
      type: newFieldType
    };

    const currentFields = company[0].customFields || [];
    await db.company.update(company[0].id, {
      customFields: [...currentFields, newField]
    });

    setNewFieldLabel('');
  };

  const handleDeleteCustomField = async (id: string) => {
    if (!company || !company[0] || !company[0].id) return;
    const currentFields = company[0].customFields || [];
    await db.company.update(company[0].id, {
      customFields: currentFields.filter(f => f.id !== id)
    });
  };

  const customFields = company?.[0]?.customFields || [];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Profile Section */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl overflow-hidden">
            {company?.[0]?.logo ? (
              <img src={company[0].logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              user?.[0]?.name?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900">{user?.[0]?.name || 'User'}</div>
            <div className="text-sm text-gray-500">{user?.[0]?.email || 'No email'}</div>
          </div>
        </div>

        {/* Company Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-gray-900">Company Profile</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Company Logo</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:bg-gray-50 transition-colors cursor-pointer h-16 flex items-center justify-center">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {company?.[0]?.logo ? (
                    <img src={company[0].logo} alt="Logo" className="h-10 mx-auto object-contain" />
                  ) : (
                    <span className="text-xs text-gray-500">Upload Logo</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Recommended size: 400x200 pixels (2:1 ratio)</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Signature</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:bg-gray-50 transition-colors cursor-pointer h-16 flex items-center justify-center">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'signature')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {company?.[0]?.signature ? (
                    <img src={company[0].signature} alt="Signature" className="h-10 mx-auto object-contain" />
                  ) : (
                    <span className="text-xs text-gray-500">Upload Sign</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Company Name</label>
              <input 
                type="text" 
                value={company?.[0]?.name || ''} 
                onChange={(e) => updateCompanyField('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Phone</label>
              <input 
                type="text" 
                value={company?.[0]?.phone || ''} 
                onChange={(e) => updateCompanyField('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Address</label>
              <textarea 
                value={company?.[0]?.address || ''} 
                onChange={(e) => updateCompanyField('address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Default GST No.</label>
              <input 
                type="text" 
                value={company?.[0]?.gstNo || ''} 
                onChange={(e) => updateCompanyField('gstNo', e.target.value)}
                placeholder="e.g. 1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Default PAN No.</label>
              <input 
                type="text" 
                value={company?.[0]?.panNo || ''} 
                onChange={(e) => updateCompanyField('panNo', e.target.value)}
                placeholder="e.g. 1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Custom LR Fields */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-gray-900">Custom LR Fields</h2>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-500">Add custom fields to your Create LR form.</p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Field Name (e.g. E-Way Bill)" 
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <select 
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as 'text' | 'number')}
                className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
              </select>
              <button 
                onClick={handleAddCustomField}
                className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>

            {customFields.length > 0 && (
              <div className="mt-4 space-y-2">
                {customFields.map(field => (
                  <div key={field.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{field.label}</div>
                      <div className="text-xs text-gray-500 capitalize">{field.type} Field</div>
                    </div>
                    <button 
                      onClick={() => handleDeleteCustomField(field.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-gray-900">Data Management</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <button onClick={handleExport} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
              <div>
                <div className="font-medium text-gray-900">Backup Data</div>
                <div className="text-xs text-gray-500">Export database to JSON</div>
              </div>
              <Download className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
              <div>
                <div className="font-medium text-gray-900">Restore Data</div>
                <div className="text-xs text-gray-500">Import database from JSON</div>
              </div>
              <Upload className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white p-4 rounded-2xl shadow-sm border border-red-100 flex items-center justify-center gap-2 text-red-600 font-bold hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>

      </div>
    </div>
  );
}
