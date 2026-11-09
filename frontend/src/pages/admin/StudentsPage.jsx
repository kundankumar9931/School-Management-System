import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { SearchBar, Pagination } from '../../components/common/Pagination.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Modal, ConfirmationDialog } from '../../components/common/Modal.jsx';
import { FormInput, SelectInput } from '../../components/common/FormInput.jsx';
import { Plus, Edit2, Trash2, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    admissionNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '2010-01-01',
    gender: 'male',
    email: '',
    phone: '',
    classId: '',
    sectionId: '',
    guardianId: '',
    status: 'active',
  });

  const navigate = useNavigate();

  const fetchDependencies = async () => {
    try {
      const [classRes, guardRes] = await Promise.all([
        api.get('/classes'),
        api.get('/guardians'),
      ]);
      setClasses(classRes.data);
      setGuardians(guardRes.data);
    } catch (err) {
      console.error('Failed to load classes or guardians:', err.message);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        classId: selectedClass,
        sectionId: selectedSection,
      };
      const res = await api.get('/students', { params });
      setStudents(res.data.students);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, selectedClass, selectedSection]);

  const handleClassChange = async (clsId) => {
    setSelectedClass(clsId);
    setSelectedSection('');
    if (clsId) {
      try {
        const res = await api.get('/sections', { params: { classId: clsId } });
        setSections(res.data);
      } catch (err) {
        setSections([]);
      }
    } else {
      setSections([]);
    }
  };

  const handleFormClassChange = async (clsId) => {
    setFormData({ ...formData, classId: clsId, sectionId: '' });
    if (clsId) {
      try {
        const res = await api.get('/sections', { params: { classId: clsId } });
        setSections(res.data);
      } catch (err) {
        setSections([]);
      }
    }
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({
      admissionNumber: `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      firstName: '',
      lastName: '',
      dateOfBirth: '2010-01-01',
      gender: 'male',
      email: '',
      phone: '',
      classId: classes[0]?._id || '',
      sectionId: '',
      guardianId: guardians[0]?._id || '',
      status: 'active',
    });
    if (classes[0]?._id) {
      handleFormClassChange(classes[0]._id);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setIsEdit(true);
    setCurrentId(student._id);
    setFormData({
      admissionNumber: student.admissionNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '2010-01-01',
      gender: student.gender,
      email: student.email || '',
      phone: student.phone || '',
      classId: student.classId?._id || '',
      sectionId: student.sectionId?._id || '',
      guardianId: student.guardianId?._id || '',
      status: student.status,
    });
    if (student.classId?._id) {
      handleFormClassChange(student.classId._id);
    }
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/students/${currentId}`, formData);
        toast.success('Student updated successfully');
      } else {
        await api.post('/students', formData);
        toast.success('Student registered successfully');
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/students/${studentToDelete._id}`);
      toast.success('Student removed successfully');
      setDeleteConfirmOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Failed to delete student');
    }
  };

  const columns = [
    {
      header: 'Admission #',
      accessor: 'admissionNumber',
      render: (row) => <span className="font-semibold text-slate-800">{row.admissionNumber}</span>,
    },
    {
      header: 'Full Name',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 block">
            {row.firstName} {row.lastName}
          </span>
          <span className="text-xs text-slate-400">{row.email || 'No email registered'}</span>
        </div>
      ),
    },
    {
      header: 'Class & Section',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
          {row.classId?.name} - Sec {row.sectionId?.name}
        </span>
      ),
    },
    {
      header: 'Guardian',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.guardianId?.fullName || <span className="text-slate-400 italic">Unlinked</span>}
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
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/students/${row._id}`)}
            title="View Details"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            title="Edit Student"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setStudentToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            title="Delete Student"
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
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Roster</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student admissions, personal biodata, and academic records.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register Student
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-100 shadow-subtle">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name, admission #, email..."
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => {
              handleClassChange(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>

          {selectedClass && (
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  Section {sec.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table & Pagination */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <DataTable
          columns={columns}
          data={students}
          loading={loading}
          onRowClick={(row) => navigate(`/admin/students/${row._id}`)}
          emptyMessage="No students match the current filters."
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={total}
        />
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Edit Student Details' : 'Register New Student'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Admission Number"
              value={formData.admissionNumber}
              onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
              required
            />
            <FormInput
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <FormInput
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectInput
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </SelectInput>
            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <FormInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectInput
              label="Class"
              value={formData.classId}
              onChange={(e) => handleFormClassChange(e.target.value)}
              required
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              label="Section"
              value={formData.sectionId}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              required
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  Section {sec.name}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              label="Guardian"
              value={formData.guardianId}
              onChange={(e) => setFormData({ ...formData, guardianId: e.target.value })}
            >
              <option value="">No Guardian Linked</option>
              {guardians.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.fullName} ({g.relationship})
                </option>
              ))}
            </SelectInput>
          </div>

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
              {isEdit ? 'Update Student' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Student Deletion"
        message={`Are you sure you want to remove student "${studentToDelete?.firstName} ${studentToDelete?.lastName}" (${studentToDelete?.admissionNumber})? This will remove all linked associations.`}
        isDestructive={true}
      />
    </div>
  );
};
