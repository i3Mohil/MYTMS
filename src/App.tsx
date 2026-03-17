/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import db from './db/db';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Documents from './pages/Documents';
import CreateLR from './pages/CreateLR';
import Ledger from './pages/Ledger';
import Directory from './pages/Directory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  const users = useLiveQuery(() => db.users.toArray());
  const company = useLiveQuery(() => db.company.toArray());

  if (users === undefined || company === undefined) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const isAuthenticated = users.length > 0;
  const hasCompany = company.length > 0;

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!hasCompany) {
    return <Onboarding />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          <Route path="documents/create" element={<CreateLR />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="directory" element={<Directory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

