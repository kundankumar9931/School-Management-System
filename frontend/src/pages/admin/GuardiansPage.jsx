import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { SearchBar } from '../../components/common/Pagination.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { FormInput, SelectInput } from '../../components/common/FormInput.jsx';
import { Plus, Edit2, Users, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export const GuardiansPage = () => {
  const [guardians, setGuardians] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    relationship: 'Father',
    address: '',
    occupation: '',
    createAccount: true,
    password: 'Guardian@123',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [guardRes, studRes] = await Promise.all([
        api.get('/guardians', { params: { search } }),
        api.get('/students', { params: { limit: 100 } }),
      ]);
      setGuardians(guardRes.data);
      setStudents(studRes.data.students || []);
    } catch (err) {
      toast.error('Failed to load guardians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const openCreateModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      relationship: 'Father',
      address: '',
      occupation: '',
      createAccount: true,
      password: 'Guardian@123',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (guardian) => {
    setIsEdit(true);
    setCurrentId(guardian._id);
    setFormData({
      fullName: guardian.fullName,
      email: guardian.email,
      phone: guardian.phone,
      relationship: guardian.relationship,
      address: guardian.address || '',
      occupation: guardian.occupation || '',
      createAccount: false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/guardians/${currentId}`, formData);
        toast.success('Guardian updated successfully');
      } else {
        await api.post('/guardians', formData);
        toast.success('Guardian added successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const columns = [
    {
      header: 'Guardian Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.fullName}</span>
          <span className="text-xs text-brand-600 font-medium">{row.relationship}</span>
        </div>
      ),
    },
    {
      header: 'Contact Information',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Linked Students',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.linkedStudentIds && row.linkedStudentIds.length > 0 ? (
            row.linkedStudentIds.map((s) => (
              <span
                key={s._id}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"
              >
                <Users className="w-3 h-3 text-slate-400" />
                {s.firstName} {s.lastName} ({s.admissionNumber})
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No linked children</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => openEditModal(row)}
          title="Edit Guardian"
          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Guardian Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student parent profiles, contact details, and account access.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Guardian
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-subtle">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search guardians by name, email, phone..."
          className="w-full sm:w-80"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <DataTable
          columns={columns}
          data={guardians}
          loading={loading}
          emptyMessage="No guardians found."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Edit Guardian Profile' : 'Register New Guardian'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <SelectInput
              label="Relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            >
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Legal Guardian">Legal Guardian</option>
              <option value="Relative">Relative</option>
              <option value="Other">Other</option>
            </SelectInput>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <FormInput
            label="Home Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          {!isEdit && (
            <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.createAccount}
                  onChange={(e) => setFormData({ ...formData, createAccount: e.target.checked })}
                  className="rounded text-brand-600"
                />
                Create Portal Login Credentials
              </label>
              {formData.createAccount && (
                <FormInput
                  label="Initial Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  helperText="Default: Guardian@123"
                />
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              {isEdit ? 'Update Profile' : 'Save Guardian'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
