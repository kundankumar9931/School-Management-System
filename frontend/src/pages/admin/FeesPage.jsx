import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { FormInput, SelectInput } from '../../components/common/FormInput.jsx';
import { Plus, CreditCard, DollarSign, Users, Layers, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const FeesPage = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Forms
  const [structureForm, setStructureForm] = useState({
    name: '',
    classId: '',
    academicYear: '2025-2026',
    amount: 1000,
    dueDate: '2025-12-31',
    feeType: 'Tuition',
    description: '',
  });

  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    feeStructureId: '',
    totalAmount: '',
    dueDate: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'UPI',
    transactionReference: '',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, structRes, sumRes, clsRes, studRes] = await Promise.all([
        api.get('/fees/invoices'),
        api.get('/fees/structures'),
        api.get('/fees/summary'),
        api.get('/classes'),
        api.get('/students', { params: { limit: 100 } }),
      ]);
      setInvoices(invRes.data);
      setStructures(structRes.data);
      setSummary(sumRes.data);
      setClasses(clsRes.data);
      setStudents(studRes.data.students || []);

      if (clsRes.data.length > 0 && !structureForm.classId) {
        setStructureForm((prev) => ({ ...prev, classId: clsRes.data[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/structures', structureForm);
      toast.success('Fee structure template created');
      setStructureModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create fee structure');
    }
  };

  const handleGenerateBulkInvoices = async (structureId) => {
    try {
      const res = await api.post('/fees/invoices/bulk', { feeStructureId: structureId });
      toast.success(res.data.message || 'Invoices generated');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to generate bulk invoices');
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.outstandingAmount,
      paymentMethod: 'UPI',
      transactionReference: `TXN-₹{Date.now().toString().slice(-6)}`,
      notes: 'Simulated fee clearance',
    });
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }
    if (amount > selectedInvoice.outstandingAmount) {
      toast.error(`Payment cannot exceed outstanding balance of ₹{selectedInvoice.outstandingAmount}`);
      return;
    }

    try {
      await api.post('/fees/payments', {
        invoiceId: selectedInvoice._id,
        amount,
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        notes: paymentForm.notes,
      });
      toast.success('Payment recorded and ledger reconciled successfully!');
      setPaymentModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Payment recording failed');
    }
  };

  const invoiceColumns = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      render: (row) => <span className="font-semibold text-slate-800">{row.invoiceNumber}</span>,
    },
    {
      header: 'Student',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 block">
            {row.studentId?.firstName} {row.studentId?.lastName}
          </span>
          <span className="text-xs text-slate-400">{row.studentId?.admissionNumber}</span>
        </div>
      ),
    },
    {
      header: 'Fee Structure',
      render: (row) => row.feeStructureId?.name || 'Tuition Fee',
    },
    {
      header: 'Total Due',
      render: (row) => `₹${row.totalAmount}`,
    },
    {
      header: 'Paid',
      render: (row) => <span className="font-semibold text-emerald-600">₹{row.paidAmount}</span>,
    },
    {
      header: 'Outstanding',
      render: (row) => (
        <span className={`font-semibold ₹{row.outstandingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          ₹{row.outstandingAmount}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Action',
      align: 'right',
      render: (row) =>
        row.outstandingAmount > 0 ? (
          <button
            onClick={() => openPaymentModal(row)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-semibold rounded-lg transition"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Pay
          </button>
        ) : (
          <span className="text-xs text-emerald-600 font-semibold">Settled</span>
        ),
    },
  ];

  const structureColumns = [
    {
      header: 'Fee Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.name}</span>
          <span className="text-xs text-slate-400">{row.description}</span>
        </div>
      ),
    },
    {
      header: 'Class',
      render: (row) => row.classId?.name,
    },
    {
      header: 'Amount',
      render: (row) => <span className="font-bold text-slate-900">₹{row.amount}</span>,
    },
    {
      header: 'Due Date',
      render: (row) => new Date(row.dueDate).toLocaleDateString(),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => handleGenerateBulkInvoices(row._id)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition"
        >
          <Users className="w-3.5 h-3.5" />
          Generate Invoices for Class
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fee Management & Billing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage fee structures, student invoice ledger, and simulated payment reconciliation.
          </p>
        </div>
        <button
          onClick={() => setStructureModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Fee Structure
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Invoiced
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            ₹{(summary?.totalGenerated || 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">{summary?.invoiceCounts?.total || 0} total invoices</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Collected
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            ₹{(summary?.totalCollected || 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">{summary?.invoiceCounts?.paid || 0} paid in full</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Outstanding
          </span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            ₹{(summary?.totalOutstanding || 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">
            {summary?.invoiceCounts?.unpaid || 0} unpaid • {summary?.invoiceCounts?.overdue || 0} overdue
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ₹{
              activeTab === 'invoices'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Student Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('structures')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ₹{
              activeTab === 'structures'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Fee Structures ({structures.length})
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        {activeTab === 'invoices' && (
          <DataTable columns={invoiceColumns} data={invoices} loading={loading} />
        )}
        {activeTab === 'structures' && (
          <DataTable columns={structureColumns} data={structures} loading={loading} />
        )}
      </div>

      {/* Create Fee Structure Modal */}
      <Modal isOpen={structureModalOpen} onClose={() => setStructureModalOpen(false)} title="Create Fee Structure">
        <form onSubmit={handleCreateStructure} className="space-y-4">
          <FormInput
            label="Structure Name"
            placeholder="e.g. Annual Tuition Fee - Grade 10"
            value={structureForm.name}
            onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              label="Target Class"
              value={structureForm.classId}
              onChange={(e) => setStructureForm({ ...structureForm, classId: e.target.value })}
              required
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              label="Fee Category"
              value={structureForm.feeType}
              onChange={(e) => setStructureForm({ ...structureForm, feeType: e.target.value })}
            >
              <option value="Tuition">Tuition</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Library">Library</option>
              <option value="Sports">Sports</option>
              <option value="Examination">Examination</option>
              <option value="Admission">Admission</option>
            </SelectInput>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Amount (₹)"
              type="number"
              value={structureForm.amount}
              onChange={(e) => setStructureForm({ ...structureForm, amount: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Due Date"
              type="date"
              value={structureForm.dueDate}
              onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setStructureModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
              Save Structure
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Simulated Payment Modal */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Record Fee Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice:</span>
              <span className="font-semibold">{selectedInvoice?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-semibold">{selectedInvoice?.studentId?.firstName} {selectedInvoice?.studentId?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Outstanding Due:</span>
              <span className="font-bold text-rose-600">₹{selectedInvoice?.outstandingAmount}</span>
            </div>
          </div>

          <FormInput
            label="Payment Amount (₹)"
            type="number"
            min="1"
            max={selectedInvoice?.outstandingAmount}
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            helperText={`Maximum payable: ₹{selectedInvoice?.outstandingAmount}`}
            required
          />

          <SelectInput
            label="Payment Method"
            value={paymentForm.paymentMethod}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
          >
            <option value="UPI">UPI Digital Payment (Simulated)</option>
            <option value="Card">Debit / Credit Card (Simulated)</option>
            <option value="Cash">Cash at Bursar Counter</option>
            <option value="Bank Transfer">Direct Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </SelectInput>

          <FormInput
            label="Transaction Reference"
            value={paymentForm.transactionReference}
            onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
            required
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold">
              Reconcile & Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
