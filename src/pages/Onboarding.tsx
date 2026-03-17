import { useState } from 'react';
import db from '../db/db';
import { Building2, Upload } from 'lucide-react';

export default function Onboarding() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tagline, setTagline] = useState('');
  const [logo, setLogo] = useState<string>('');
  const [signature, setSignature] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.company.add({
      name,
      phone,
      address,
      tagline,
      logo,
      signature,
      footerText: 'Subject to local jurisdiction.',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Company Setup
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          Let's set up your transport business profile.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Sharma Roadlines"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline (Optional)</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Safe & Fast Transport"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, setLogo)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {logo ? (
                  <img src={logo} alt="Logo" className="h-12 mx-auto object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Upload Logo</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, setSignature)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {signature ? (
                  <img src={signature} alt="Signature" className="h-12 mx-auto object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Upload Sign</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors mt-6"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
}
