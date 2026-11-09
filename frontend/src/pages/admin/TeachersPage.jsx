import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { SearchBar } from '../../components/common/Pagination.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Modal, ConfirmationDialog } from '../../components/common/Modal.jsx';
import { FormInput, SelectInput } from '../../components/common/FormInput.jsx';
import { Plus, Edit2, Trash2, BookOpen, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    experienceYears: 1,
    department: 'General Education',
    status: 'active',
    createAccount: true,
    password: 'Teacher@123',
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers', { params: { search } });
      setTeachers(res.data);
    } catch (err) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search]);

  const openCreateModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({
      employeeId: `TCH-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      email: '',
      phone: '',
      qualification: '',
      experienceYears: 1,
      department: 'General Education',
      status: 'active',
      createAccount: true,
      password: 'Teacher@123',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setIsEdit(true);
    setCurrentId(teacher._id);
    setFormData({
      employeeId: teacher.employeeId,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      qualification: teacher.qualification,
      experienceYears: teacher.experienceYears,
      department: teacher.department || 'General Education',
      status: teacher.status,
      createAccount: false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/teachers/${currentId}`, formData);
        toast.success('Teacher updated successfully');
      } else {
        await api.post('/teachers', formData);
        toast.success('Teacher registered successfully');
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/teachers/${teacherToDelete._id}`);
      toast.success('Teacher removed successfully');
      setDeleteConfirmOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error(err.message || 'Failed to remove teacher');
    }
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (row) => <span className="font-semibold text-slate-800">{row.employeeId}</span>,
    },
    {
      header: 'Full Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.fullName}</span>
          <span className="text-xs text-slate-400">{row.qualification}</span>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Assigned Classes',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
          <BookOpen className="w-3 h-3" />
          {row.assignments?.length || 0} Assignments
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            title="Edit Teacher"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setTeacherToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            title="Delete Teacher"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage teachers, departments, qualifications, and assignment matrices.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Member
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-subtle">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search teachers by name, ID, qualification..."
          className="w-full sm:w-80"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <DataTable
          columns={columns}
          data={teachers}
          loading={loading}
          emptyMessage="No faculty records found."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Edit Faculty Details' : 'Register Faculty Member'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
            />
            <FormInput
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Qualification"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g. M.Sc. Mathematics, B.Ed."
              required
            />
            <FormInput
              label="Experience (Years)"
              type="number"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <SelectInput
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectInput>
          </div>

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
                  helperText="Default: Teacher@123"
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
              {isEdit ? 'Update Details' : 'Register Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remove Faculty Member"
        message={`Are you sure you want to remove teacher "${teacherToDelete?.fullName}" (${teacherToDelete?.employeeId})? This will also remove their assignments.`}
        isDestructive={true}
      />
    </div>
  );
};
