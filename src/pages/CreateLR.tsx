import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Save, ChevronDown, ChevronUp } from 'lucide-react';
import db from '../db/db';

const AccordionSection = ({ title, isOpen, onToggle, children }: { title: string, isOpen: boolean, onToggle: () => void, children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
    <button
      type="button"
      onClick={onToggle}
      className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
    >
      <h2 className="font-bold text-gray-900 uppercase tracking-wider text-sm">{title}</h2>
      {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
    </button>
    {isOpen && (
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {children}
      </div>
    )}
  </div>
);

export default function CreateLR() {
  const navigate = useNavigate();
  const company = useLiveQuery(() => db.company.toArray());
  const user = useLiveQuery(() => db.users.toArray());

  const [openSection, setOpenSection] = useState<string>('basic');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  // Basic Details
  const [lrNumber, setLrNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [userName, setUserName] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [panNo, setPanNo] = useState('');

  // Consignor Details
  const [consignorName, setConsignorName] = useState('');
  const [consignorGst, setConsignorGst] = useState('');
  const [consignorAddress, setConsignorAddress] = useState('');
  const [consignorContact, setConsignorContact] = useState('');

  // Consignee Details
  const [consigneeName, setConsigneeName] = useState('');
  const [consigneeGst, setConsigneeGst] = useState('');
  const [consigneeAddress, setConsigneeAddress] = useState('');
  const [consigneeContact, setConsigneeContact] = useState('');

  // Invoice & E-Way Bill
  const [ewayBill, setEwayBill] = useState('');
  const [invoiceValue, setInvoiceValue] = useState('');

  // Route & Driver
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [dlNo, setDlNo] = useState('');
  const [rto, setRto] = useState('');
  const [driverMobile, setDriverMobile] = useState('');

  // Goods Details
  const [productMaterial, setProductMaterial] = useState('');
  const [packagingType, setPackagingType] = useState('');
  const [packages, setPackages] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [chargeWeight, setChargeWeight] = useState('');
  const [remarks, setRemarks] = useState('');

  // Payment Details
  const [freightRate, setFreightRate] = useState('');
  const [freight, setFreight] = useState('');
  const [cgst, setCgst] = useState('');
  const [sgst, setSgst] = useState('');
  const [igst, setIgst] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [paymentType, setPaymentType] = useState<'Paid' | 'To Pay' | 'TBB'>('To Pay');

  // Persistent Fields (Bank & Terms)
  const [insuranceNote, setInsuranceNote] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAcNo, setBankAcNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [termsNote, setTermsNote] = useState('');

  // Custom Fields
  const [customValues, setCustomValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const generateLrNumber = async () => {
      const dateObj = new Date();
      const year = dateObj.getFullYear().toString();
      
      const docs = await db.documents.where('type').equals('LR').toArray();
      const currentYearDocs = docs.filter(d => d.lrNumber.includes(`-${year}-`));
      const count = currentYearDocs.length + 1;
      setLrNumber(`LR-${year}-${count.toString().padStart(4, '0')}`);
    };
    generateLrNumber();
  }, []);

  useEffect(() => {
    if (company && company[0]) {
      if (!gstNo) setGstNo(company[0].gstNo || '');
      if (!panNo) setPanNo(company[0].panNo || '');
      
      // Load persistent fields
      setInsuranceNote(company[0].insuranceNote || '');
      setAccountName(company[0].accountName || '');
      setBankName(company[0].bankName || '');
      setBankAcNo(company[0].bankAcNo || '');
      setIfscCode(company[0].ifscCode || '');
      setTermsNote(company[0].termsNote || '');
    }
    if (user && user[0] && company && company[0]) {
      if (!userName) setUserName(`${user[0].name} (${company[0].phone})`);
    }
  }, [company, user]);

  const remainingToPay = (Number(freight) || 0) + (Number(cgst) || 0) + (Number(sgst) || 0) + (Number(igst) || 0) - (Number(advancePaid) || 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save persistent fields to company
      if (company && company[0] && company[0].id) {
        await db.company.update(company[0].id, {
          insuranceNote,
          accountName,
          bankName,
          bankAcNo,
          ifscCode,
          termsNote
        });
      }

      await db.documents.add({
        type: 'LR',
        lrNumber,
        date,
        userName,
        gstNo,
        panNo,
        
        consignorName,
        consignorGst,
        consignorAddress,
        consignorContact,
        
        consigneeName,
        consigneeGst,
        consigneeAddress,
        consigneeContact,
        
        ewayBill,
        pickup,
        delivery,
        vehicleNo,
        driverName,
        dlNo,
        rto,
        driverMobile,
        
        productMaterial,
        packagingType,
        packages,
        weight: Number(totalWeight) || 0,
        totalWeight: Number(totalWeight) || 0,
        chargeWeight: Number(chargeWeight) || 0,
        invoiceValue: Number(invoiceValue) || 0,
        remarks,
        
        freightRate: Number(freightRate) || 0,
        freight: Number(freight) || 0,
        cgst: Number(cgst) || 0,
        sgst: Number(sgst) || 0,
        igst: Number(igst) || 0,
        advancePaid: Number(advancePaid) || 0,
        remainingToPay,
        paymentType,
        
        insuranceNote,
        accountName,
        bankName,
        bankAcNo,
        ifscCode,
        termsNote,
        
        status: 'Booked',
        customFields: customValues
      });
      navigate('/documents');
    } catch (error) {
      console.error('Failed to save LR:', error);
      alert('Failed to save LR');
    }
  };

  const customFieldsDef = company?.[0]?.customFields || [];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Create LR</h1>
        <button type="button" onClick={handleSave} className="text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800 transition-colors">
          <Save className="w-4 h-4" /> Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <form id="lr-form" onSubmit={handleSave} className="space-y-2">
          
          <AccordionSection title="Basic Details" isOpen={openSection === 'basic'} onToggle={() => toggleSection('basic')}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LR Number</label>
                <input
                  type="text"
                  required
                  value={lrNumber}
                  onChange={(e) => setLrNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Our GST No.</label>
                <input
                  type="text"
                  value={gstNo}
                  onChange={(e) => setGstNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Our PAN No.</label>
                <input
                  type="text"
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Consignor Details" isOpen={openSection === 'consignor'} onToggle={() => toggleSection('consignor')}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={consignorName}
                  onChange={(e) => setConsignorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
                <input
                  type="text"
                  value={consignorGst}
                  onChange={(e) => setConsignorGst(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                <input
                  type="text"
                  value={consignorContact}
                  onChange={(e) => setConsignorContact(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={consignorAddress}
                  onChange={(e) => setConsignorAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Consignee Details" isOpen={openSection === 'consignee'} onToggle={() => toggleSection('consignee')}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={consigneeName}
                  onChange={(e) => setConsigneeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
                <input
                  type="text"
                  value={consigneeGst}
                  onChange={(e) => setConsigneeGst(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                <input
                  type="text"
                  value={consigneeContact}
                  onChange={(e) => setConsigneeContact(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={consigneeAddress}
                  onChange={(e) => setConsigneeAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Invoice & E-Way Bill" isOpen={openSection === 'invoice'} onToggle={() => toggleSection('invoice')}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Way Bill No.</label>
                <input
                  type="text"
                  value={ewayBill}
                  onChange={(e) => setEwayBill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Value (₹)</label>
                <input
                  type="number"
                  value={invoiceValue}
                  onChange={(e) => setInvoiceValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Truck Details" isOpen={openSection === 'truck'} onToggle={() => toggleSection('truck')}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                <input
                  type="text"
                  required
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                <input
                  type="text"
                  required
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Truck No.</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DL No.</label>
                <input
                  type="text"
                  value={dlNo}
                  onChange={(e) => setDlNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RTO</label>
                <input
                  type="text"
                  value={rto}
                  onChange={(e) => setRto(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
                <input
                  type="text"
                  value={driverMobile}
                  onChange={(e) => setDriverMobile(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Material Details" isOpen={openSection === 'material'} onToggle={() => toggleSection('material')}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product/Material</label>
                <input
                  type="text"
                  value={productMaterial}
                  onChange={(e) => setProductMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Packaging Type</label>
                <input
                  type="text"
                  value={packagingType}
                  onChange={(e) => setPackagingType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. of Packages</label>
                <input
                  type="text"
                  value={packages}
                  onChange={(e) => setPackages(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Ton)</label>
                <input
                  type="number"
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Charge Weight (Ton)</label>
                <input
                  type="number"
                  value={chargeWeight}
                  onChange={(e) => setChargeWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Freight Details" isOpen={openSection === 'freight'} onToggle={() => toggleSection('freight')}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Freight Rate</label>
                <input
                  type="number"
                  value={freightRate}
                  onChange={(e) => setFreightRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Freight (₹)</label>
                <input
                  type="number"
                  required
                  value={freight}
                  onChange={(e) => setFreight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CGST (₹)</label>
                <input
                  type="number"
                  value={cgst}
                  onChange={(e) => setCgst(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SGST (₹)</label>
                <input
                  type="number"
                  value={sgst}
                  onChange={(e) => setSgst(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IGST (₹)</label>
                <input
                  type="number"
                  value={igst}
                  onChange={(e) => setIgst(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid (₹)</label>
                <input
                  type="number"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="paymentType" value="To Pay" checked={paymentType === 'To Pay'} onChange={() => setPaymentType('To Pay')} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">To Pay</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="paymentType" value="Paid" checked={paymentType === 'Paid'} onChange={() => setPaymentType('Paid')} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">Paid</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="paymentType" value="TBB" checked={paymentType === 'TBB'} onChange={() => setPaymentType('TBB')} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">TBB</span>
                  </label>
                </div>
              </div>
              <div className="col-span-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex justify-between items-center">
                <span className="font-medium text-indigo-900">Remaining to be paid:</span>
                <span className="font-bold text-indigo-700 text-lg">₹ {remainingToPay}</span>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Bank & Terms (Saved)" isOpen={openSection === 'bank'} onToggle={() => toggleSection('bank')}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Note</label>
                <input
                  type="text"
                  value={insuranceNote}
                  onChange={(e) => setInsuranceNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank A/c No</label>
                <input
                  type="text"
                  value={bankAcNo}
                  onChange={(e) => setBankAcNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Note / Terms</label>
                <textarea
                  value={termsNote}
                  onChange={(e) => setTermsNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </AccordionSection>

          {customFieldsDef.length > 0 && (
            <AccordionSection title="Additional Fields" isOpen={openSection === 'custom'} onToggle={() => toggleSection('custom')}>
              <div className="grid grid-cols-2 gap-4">
                {customFieldsDef.map(field => (
                  <div key={field.id} className={field.type === 'text' ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      value={customValues[field.id] || ''}
                      onChange={(e) => setCustomValues({ ...customValues, [field.id]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>
                ))}
              </div>
            </AccordionSection>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 p-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Remarks</h2>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              placeholder="Any special instructions..."
            />
          </div>
          
          <div className="pt-4 pb-8">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Create Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
