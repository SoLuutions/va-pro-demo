
import React, { useState } from "react";
import { FileText, Clock, CheckCircle, ListChecks } from "lucide-react";
import { jsPDF } from "jspdf";

export default function Billing({ clients, tasks, timeEntries, formatCurrency }) {
  const [invoiceClient, setInvoiceClient] = useState(clients[0]?.id || null);

  const generateInvoiceData = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    const entries = timeEntries.filter((e) => e.clientId === clientId && e.billable);
    const hours = entries.reduce((s, e) => s + e.duration, 0);
    const rate = client?.rate || 0;
    const currency = client?.currency || 'USD';
    const total = +(hours * rate).toFixed(2);
    return { client, entries, hours, rate, currency, total };
  };

  const data = invoiceClient ? generateInvoiceData(invoiceClient) : null;

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('TIME INVOICE', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Virtual Assistant - Time Report', 20, 35);
    doc.text('PH • Asia/Manila', 20, 42);
    doc.text('Invoice Date: ' + new Date().toLocaleDateString(), 20, 49);
    
    doc.setFont(undefined, 'bold');
    doc.text('For:', 20, 65);
    doc.setFont(undefined, 'normal');
    doc.text(data.client.name, 20, 72);
    doc.text(data.client.email, 20, 79);
    doc.text(data.client.location, 20, 86);
    
    doc.setFont(undefined, 'bold');
    doc.text('Description', 20, 105);
    doc.text('Hours', 120, 105);
    doc.text('Rate', 150, 105);
    doc.text('Amount', 180, 105);
    
    doc.setFont(undefined, 'normal');
    let yPos = 115;
    
    data.entries.forEach((entry, i) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(entry.description.substring(0, 50), 20, yPos);
      const amount = +(entry.duration * data.rate).toFixed(2);
      doc.text(entry.duration.toFixed(2) + 'h', 120, yPos);
      doc.text(`${data.currency} ${data.rate}`, 150, yPos);
      doc.text(`${data.currency} ${amount.toFixed(2)}`, 180, yPos);
      yPos += 7;
    });
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total Hours:', 110, yPos);
    doc.text(data.hours.toFixed(2) + 'h', 140, yPos);
    yPos += 7;
    doc.text('Rate:', 110, yPos);
    doc.text(`${data.currency} ${data.rate}`, 140, yPos);
    yPos += 7;
    doc.text('Total Amount:', 110, yPos);
    doc.text(`${data.currency} ${data.total.toFixed(2)}`, 160, yPos);
    
    doc.save(`Time-Invoice-${data.client.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Time Invoice & Billing</h2>
        <button onClick={generatePDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={Clock} 
          label="Total Hours Logged" 
          value={`${timeEntries.reduce((sum, e) => sum + e.duration, 0).toFixed(1)}h`} 
          color="green" 
        />
        <StatCard 
          icon={FileText} 
          label="Billable Entries" 
          value={timeEntries.filter(e => e.billable).length} 
          color="blue" 
        />
        <StatCard 
          icon={ListChecks} 
          label="Completed Tasks" 
          value={tasks.filter(t => t.status === 'Completed').length} 
          color="yellow" 
        />
        <StatCard 
          icon={CheckCircle} 
          label="Active Clients" 
          value={clients.length} 
          color="purple" 
        />
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
              <Row label="Total Hours" value={<span className="font-bold text-lg">{data.hours.toFixed(2)}h</span>} />
            </div>

            <div className="flex space-x-4">
              <button onClick={generatePDF} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate PDF</button>
              <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Generate QR</button>
            </div>
          </div>
        </div>
      )}

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
