import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Modal, ConfirmationDialog } from '../../components/common/Modal.jsx';
import { FormInput, SelectInput } from '../../components/common/FormInput.jsx';
import { Plus, BookOpen, Layers, Users, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ClassesPage = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Forms
  const [classForm, setClassForm] = useState({ name: '', academicYear: '2025-2026', classTeacherId: '', description: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', classId: '', capacity: 35, roomNumber: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', description: '', maxMarks: 100, passingMarks: 40 });
  const [assignForm, setAssignForm] = useState({ teacherId: '', classId: '', sectionId: '', subjectId: '', academicYear: '2025-2026' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, secRes, subRes, assignRes, tchRes] = await Promise.all([
        api.get('/classes'),
        api.get('/sections'),
        api.get('/subjects'),
        api.get('/assignments'),
        api.get('/teachers'),
      ]);
      setClasses(clsRes.data);
      setSections(secRes.data);
      setSubjects(subRes.data);
      setAssignments(assignRes.data);
      setTeachers(tchRes.data);
    } catch (err) {
      toast.error('Failed to load academic structure data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await api.post('/classes', classForm);
      toast.success('Class created successfully');
      setClassModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create class');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sections', sectionForm);
      toast.success('Section created successfully');
      setSectionModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create section');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', subjectForm);
      toast.success('Subject created successfully');
      setSubjectModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create subject');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', assignForm);
      toast.success('Teacher assigned successfully');
      setAssignModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment removed');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete assignment');
    }
  };

  const classColumns = [
    {
      header: 'Class Name',
      accessor: 'name',
      render: (row) => <span className="font-semibold text-slate-800">{row.name}</span>,
    },
    {
      header: 'Academic Year',
      accessor: 'academicYear',
    },
    {
      header: 'Class In-Charge Teacher',
      render: (row) => row.classTeacherId?.fullName || <span className="text-slate-400 italic">Unassigned</span>,
    },
    {
      header: 'Sections',
      render: (row) => {
        const clsSecs = sections.filter((s) => s.classId?._id === row._id || s.classId === row._id);
        return (
          <div className="flex gap-1">
            {clsSecs.map((s) => (
              <span key={s._id} className="px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-700">
                Sec {s.name} ({s.capacity})
              </span>
            ))}
          </div>
        );
      },
    },
  ];

  const subjectColumns = [
    {
      header: 'Subject Code',
      accessor: 'code',
      render: (row) => <span className="font-semibold text-slate-800">{row.code}</span>,
    },
    {
      header: 'Subject Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 block">{row.name}</span>
          <span className="text-xs text-slate-400">{row.description}</span>
        </div>
      ),
    },
    {
      header: 'Max Marks',
      accessor: 'maxMarks',
    },
    {
      header: 'Passing Marks',
      accessor: 'passingMarks',
    },
  ];

  const assignmentColumns = [
    {
      header: 'Teacher',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.teacherId?.fullName}</span>
          <span className="text-xs text-slate-400">{row.teacherId?.employeeId}</span>
        </div>
      ),
    },
    {
      header: 'Class & Section',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
          {row.classId?.name} - Section {row.sectionId?.name}
        </span>
      ),
    },
    {
      header: 'Subject',
      render: (row) => (
        <span className="text-xs font-semibold text-brand-600">
          {row.subjectId?.name} ({row.subjectId?.code})
        </span>
      ),
    },
    {
      header: 'Academic Year',
      accessor: 'academicYear',
    },
    {
      header: 'Action',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => handleDeleteAssignment(row._id)}
          title="Delete Assignment"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Architecture</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Classes, Sections, Course Catalog, and Teacher Assignments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeTab === 'classes' && (
            <>
              <button
                onClick={() => setClassModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Class
              </button>
              <button
                onClick={() => setSectionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Section
              </button>
            </>
          )}
          {activeTab === 'subjects' && (
            <button
              onClick={() => setSubjectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subject
            </button>
          )}
          {activeTab === 'assignments' && (
            <button
              onClick={() => setAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Teacher
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ${
              activeTab === 'classes'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Classes & Sections ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ${
              activeTab === 'subjects'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Subject Catalog ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ${
              activeTab === 'assignments'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Faculty Assignments ({assignments.length})
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        {activeTab === 'classes' && (
          <DataTable columns={classColumns} data={classes} loading={loading} />
        )}
        {activeTab === 'subjects' && (
          <DataTable columns={subjectColumns} data={subjects} loading={loading} />
        )}
        {activeTab === 'assignments' && (
          <DataTable columns={assignmentColumns} data={assignments} loading={loading} />
        )}
      </div>

      {/* Class Modal */}
      <Modal isOpen={classModalOpen} onClose={() => setClassModalOpen(false)} title="Create Class">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <FormInput
            label="Class Name"
            placeholder="e.g. Grade 12"
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
            required
          />
          <FormInput
            label="Academic Year"
            value={classForm.academicYear}
            onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
            required
          />
          <SelectInput
            label="Class Teacher In-Charge"
            value={classForm.classTeacherId}
            onChange={(e) => setClassForm({ ...classForm, classTeacherId: e.target.value })}
          >
            <option value="">No Teacher Assigned</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.fullName} ({t.employeeId})
              </option>
            ))}
          </SelectInput>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setClassModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
              Save Class
            </button>
          </div>
        </form>
      </Modal>

      {/* Section Modal */}
      <Modal isOpen={sectionModalOpen} onClose={() => setSectionModalOpen(false)} title="Add Section to Class">
        <form onSubmit={handleCreateSection} className="space-y-4">
          <SelectInput
            label="Target Class"
            value={sectionForm.classId}
            onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })}
            required
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </SelectInput>
          <FormInput
            label="Section Name / Code"
            placeholder="e.g. A, B, C"
            value={sectionForm.name}
            onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
            required
          />
          <FormInput
            label="Student Capacity"
            type="number"
            value={sectionForm.capacity}
            onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
            required
          />
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setSectionModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
              Save Section
            </button>
          </div>
        </form>
      </Modal>

      {/* Subject Modal */}
      <Modal isOpen={subjectModalOpen} onClose={() => setSubjectModalOpen(false)} title="Add Subject to Catalog">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <FormInput
            label="Subject Name"
            placeholder="e.g. Physics"
            value={subjectForm.name}
            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            required
          />
          <FormInput
            label="Subject Code"
            placeholder="e.g. PHY101"
            value={subjectForm.code}
            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Maximum Marks"
              type="number"
              value={subjectForm.maxMarks}
              onChange={(e) => setSubjectForm({ ...subjectForm, maxMarks: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Passing Marks"
              type="number"
              value={subjectForm.passingMarks}
              onChange={(e) => setSubjectForm({ ...subjectForm, passingMarks: Number(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setSubjectModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
              Save Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* Assignment Modal */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Create Teaching Assignment">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <SelectInput
            label="Teacher"
            value={assignForm.teacherId}
            onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.fullName} ({t.employeeId})
              </option>
            ))}
          </SelectInput>
          <SelectInput
            label="Class"
            value={assignForm.classId}
            onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })}
            required
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            label="Section"
            value={assignForm.sectionId}
            onChange={(e) => setAssignForm({ ...assignForm, sectionId: e.target.value })}
            required
          >
            <option value="">Select Section</option>
            {sections
              .filter((s) => s.classId?._id === assignForm.classId || s.classId === assignForm.classId)
              .map((s) => (
                <option key={s._id} value={s._id}>
                  Section {s.name}
                </option>
              ))}
          </SelectInput>
          <SelectInput
            label="Subject"
            value={assignForm.subjectId}
            onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </SelectInput>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
              Save Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
