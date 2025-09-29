
import React, { useState } from "react";
import { DollarSign, FileText, Clock, CheckCircle } from "lucide-react";

export default function Billing({ clients, timeEntries, formatCurrency }) {
  const [invoiceClient, setInvoiceClient] = useState(clients[0]?.id || null);

  const generateInvoiceData = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    const entries = timeEntries.filter((e) => e.clientId === clientId && e.billable);
    const hours = entries.reduce((s, e) => s + e.duration, 0);
    const subtotal = hours * (client?.rate || 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    return { client, entries, hours, subtotal, tax, total };
  };

  const data = invoiceClient ? generateInvoiceData(invoiceClient) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Invoice & Billing</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label="Pending Amount" value="$2,156.50" color="green" />
        <StatCard icon={FileText} label="Invoices Sent" value="8" color="blue" />
        <StatCard icon={Clock} label="Overdue" value="$320.00" color="yellow" />
        <StatCard icon={CheckCircle} label="Paid This Month" value="$4,280.75" color="purple" />
      </div>

      {data && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Quick Invoice Generator</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
                <select
                  value={invoiceClient}
                  onChange={(e) => setInvoiceClient(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Billing Period</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Current Period</option>
                  <option>Last 2 Weeks</option>
                  <option>Last Month</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-900 mb-2">Invoice Preview</h4>
              <Row label="Client" value={data.client.name} />
              <Row label="Total Hours" value={`${data.hours.toFixed(2)}h`} />
              <Row label="Rate" value={formatCurrency(data.client.rate)} />
              <Row label="Subtotal" value={formatCurrency(data.subtotal)} />
              <Row label="VAT (12%)" value={formatCurrency(data.tax)} />
              <Row label="Total" value={<span className="font-bold text-lg">{formatCurrency(data.total)}</span>} />
            </div>

            <div className="flex space-x-4">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate PDF</button>
              <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Generate QR</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
        </div>
        <div className="divide-y">
          {[
            { id: "INV-001", client: "TechStart Solutions", amount: 675.0, status: "Paid", date: "2025-09-20" },
            { id: "INV-002", client: "E-commerce Plus", amount: 1123.2, status: "Pending", date: "2025-09-25" },
            { id: "INV-003", client: "Digital Marketing Hub", amount: 896.0, status: "Overdue", date: "2025-09-15" },
          ].map((inv) => (
            <div key={inv.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h4 className="font-medium text-gray-900">{inv.id}</h4>
                <p className="text-sm text-gray-500">{inv.client} • {inv.date}</p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-semibold text-gray-900">{formatCurrency(inv.amount)}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  inv.status === "Paid" ? "bg-green-100 text-green-800" :
                  inv.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
