import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { SearchBar, Pagination } from '../../components/common/Pagination.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { ShieldCheck, Eye, Terminal, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  // Inspector Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', {
        params: {
          page,
          limit: 15,
          search,
          entityType,
          userRole,
        },
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, entityType, userRole]);

  const openInspector = (log) => {
    setSelectedLog(log);
    setInspectModalOpen(true);
  };

  const columns = [
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Operator',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{row.userEmail}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.userRole}</span>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-100 text-slate-800">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Entity',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.entityType} ({row.entityId ? row.entityId.slice(0, 10) + '...' : 'N/A'})
        </span>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      render: (row) => <span className="text-xs font-mono text-slate-400">{row.ipAddress || '127.0.0.1'}</span>,
    },
    {
      header: 'Payload',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => openInspector(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          Inspect
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Audit Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking trail of student modifications, faculty assignments, attendance, marks, and billing actions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-100 shadow-subtle">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by action, email..."
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="">All Entity Types</option>
            <option value="Student">Student</option>
            <option value="Attendance">Attendance</option>
            <option value="Result">Result</option>
            <option value="Payment">Payment</option>
            <option value="FeeInvoice">FeeInvoice</option>
            <option value="Teacher">Teacher</option>
            <option value="User">User</option>
          </select>

          <select
            value={userRole}
            onChange={(e) => {
              setUserRole(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="teacher">Teacher</option>
            <option value="guardian">Guardian</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyMessage="No audit logs recorded for the selected criteria."
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={total}
        />
      </div>

      {/* Inspector Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title="Audit Log Event Inspector"
        maxWidth="max-w-2xl"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Action</span>
                <span className="font-bold text-slate-800">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedLog.createdAt).toUTCString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Operator</span>
                <span className="font-semibold text-slate-800">
                  {selectedLog.userEmail} ({selectedLog.userRole})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Target Entity</span>
                <span className="font-semibold text-slate-800">
                  {selectedLog.entityType}: {selectedLog.entityId || 'None'}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Sanitized Change Summary Payload
              </span>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-72">
                {JSON.stringify(selectedLog.changeSummary, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
