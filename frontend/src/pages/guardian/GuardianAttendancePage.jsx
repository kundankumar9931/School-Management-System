import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { CalendarCheck, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export const GuardianAttendancePage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await api.get('/guardians/my-children');
        setChildren(res.data);
        if (res.data.length > 0) setSelectedChild(res.data[0]);
      } catch (err) {
        toast.error('Failed to load linked children');
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedChild) return;
      setLoading(true);
      try {
        const res = await api.get(`/students/₹{selectedChild._id}/attendance`);
        setAttendance(res.data);
      } catch (err) {
        toast.error('Failed to load child attendance');
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [selectedChild]);

  const columns = [
    {
      header: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      header: 'Session',
      accessor: 'session',
    },
    {
      header: 'Attendance Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Remarks / Reason',
      render: (row) => row.remarks || <span className="text-slate-400 italic">None</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Record</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor daily attendance sessions and cumulative attendance percentage.
          </p>
        </div>

        {/* Child Selector */}
        <select
          value={selectedChild?._id || ''}
          onChange={(e) => setSelectedChild(children.find((c) => c._id === e.target.value))}
          className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold"
        >
          {children.map((c) => (
            <option key={c._id} value={c._id}>
              {c.firstName} {c.lastName} ({c.admissionNumber})
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Sessions
          </span>
          <span className="text-2xl font-bold text-slate-800 mt-1 block">
            {attendance?.totalDays || 0}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Present Sessions
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {attendance?.presentDays || 0}
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Attendance Rate
          </span>
          <span className="text-2xl font-bold text-brand-600 mt-1 block">
            {attendance?.percentage || 0}%
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <DataTable
          columns={columns}
          data={attendance?.history || []}
          loading={loading}
          emptyMessage="No attendance sessions recorded."
        />
      </div>
    </div>
  );
};

export const GuardianFeesPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await api.get('/guardians/my-children');
        setChildren(res.data);
        if (res.data.length > 0) setSelectedChild(res.data[0]);
      } catch (err) {
        toast.error('Failed to load linked children');
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    const loadFees = async () => {
      if (!selectedChild) return;
      setLoading(true);
      try {
        const res = await api.get(`/students/₹{selectedChild._id}/fees`);
        setInvoices(res.data);
      } catch (err) {
        toast.error('Failed to load child fee invoices');
      } finally {
        setLoading(false);
      }
    };
    loadFees();
  }, [selectedChild]);

  const columns = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      render: (row) => <span className="font-semibold text-slate-800">{row.invoiceNumber}</span>,
    },
    {
      header: 'Fee Description',
      render: (row) => row.feeStructureId?.name || 'Tuition Fee',
    },
    {
      header: 'Total Invoiced',
      render: (row) => `
      ₹{row.totalAmount}`,
    },
    {
      header: 'Paid Amount',
      render: (row) => <span className="font-semibold text-emerald-600">₹{row.paidAmount}</span>,
    },
    {
      header: 'Outstanding Balance',
      render: (row) => (
        <span className={`font-semibold ₹{row.outstandingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          ₹{row.outstandingAmount}
        </span>
      ),
    },
    {
      header: 'Due Date',
      render: (row) => new Date(row.dueDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.outstandingAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fee Invoices & Statements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View invoiced tuition dues, payment receipts, and balance statuses.
          </p>
        </div>

        <select
          value={selectedChild?._id || ''}
          onChange={(e) => setSelectedChild(children.find((c) => c._id === e.target.value))}
          className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold"
        >
          {children.map((c) => (
            <option key={c._id} value={c._id}>
              {c.firstName} {c.lastName} ({c.admissionNumber})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Outstanding Balance
          </span>
          <span className={`text-2xl font-bold mt-1 block ₹{totalOutstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₹{totalOutstanding.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">
            {totalOutstanding === 0 ? 'Account is in good standing' : 'Pending payment clearance'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Simulated Payments Notice
          </span>
          <p className="text-xs text-slate-600 mt-2">
            In compliance with institutional assessment rules, all fee payments are recorded securely via simulated digital transactions without external payment processors.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <DataTable
          columns={columns}
          data={invoices}
          loading={loading}
          emptyMessage="No fee invoices recorded for this child."
        />
      </div>
    </div>
  );
};
