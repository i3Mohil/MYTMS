import Dexie, { type EntityTable } from 'dexie';

export interface User {
  id?: number;
  email: string;
  passwordHash: string;
  name: string;
}

export interface CustomFieldDef {
  id: string;
  label: string;
  type: 'text' | 'number';
}

export interface Company {
  id?: number;
  name: string;
  address: string;
  phone: string;
  tagline: string;
  logo?: string;
  signature?: string;
  footerText?: string;
  gstNo?: string;
  panNo?: string;
  customFields?: CustomFieldDef[];
  lrSettings?: {
    showVehicleNo: boolean;
    showConsignor: boolean;
    showConsignee: boolean;
    showFreight: boolean;
    showPaymentType: boolean;
    showInvoiceValue: boolean;
    showRemarks: boolean;
  };
  // Persistent fields
  insuranceNote?: string;
  accountName?: string;
  bankName?: string;
  bankAcNo?: string;
  ifscCode?: string;
  termsNote?: string;
}

export interface DirectoryEntry {
  id?: number;
  type: 'Client' | 'Driver' | 'Vehicle' | 'Broker';
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Document {
  id?: number;
  type: 'LR' | 'Invoice' | 'Quotation' | 'LoadingSlip' | 'DeliverySlip' | 'CashVoucher' | 'PaymentReceipt';
  lrNumber: string;
  date: string;
  
  // Basic Details
  userName?: string;
  gstNo?: string;
  panNo?: string;
  
  // Consignor Details
  consignorName?: string;
  consignorGst?: string;
  consignorAddress?: string;
  consignorContact?: string;
  
  // Consignee Details
  consigneeName?: string;
  consigneeGst?: string;
  consigneeAddress?: string;
  consigneeContact?: string;
  
  pickup: string;
  delivery: string;
  
  // Driver Details
  vehicleNo?: string;
  driverName?: string;
  dlNo?: string;
  rto?: string;
  driverMobile?: string;
  
  // Payment Details
  freightRate?: number;
  freight: number;
  advancePaid?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  gstAmount?: number;
  remainingToPay?: number;
  paymentType: 'Paid' | 'To Pay' | 'TBB';
  
  // Goods Details
  ewayBill?: string;
  productMaterial?: string;
  packagingType?: string;
  packages: string;
  weight: number;
  totalWeight?: number;
  chargeWeight?: number;
  invoiceValue: number;
  remarks: string;
  
  // Bank & Terms
  insuranceNote?: string;
  accountName?: string;
  bankName?: string;
  bankAcNo?: string;
  ifscCode?: string;
  termsNote?: string;
  
  status: 'Booked' | 'In Transit' | 'Delivered';
  customFields?: Record<string, any>;
  
  pod?: {
    receiverName: string;
    signature: string;
    photo: string;
    date: string;
  };
  
  // Legacy fields for backward compatibility
  consignorId?: number;
  consigneeId?: number;
  vehicleId?: number;
  driverId?: number;
}

export interface LedgerEntry {
  id?: number;
  partyId: number;
  date: string;
  type: 'Debit' | 'Credit';
  amount: number;
  description: string;
  documentId?: number;
}

const db = new Dexie('TransportDB') as Dexie & {
  users: EntityTable<User, 'id'>;
  company: EntityTable<Company, 'id'>;
  directory: EntityTable<DirectoryEntry, 'id'>;
  documents: EntityTable<Document, 'id'>;
  ledger: EntityTable<LedgerEntry, 'id'>;
};

db.version(2).stores({
  users: '++id, email',
  company: '++id',
  directory: '++id, type, name, phone',
  documents: '++id, type, lrNumber, date, status',
  ledger: '++id, partyId, date, type'
});

export default db;
