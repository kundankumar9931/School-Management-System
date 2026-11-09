import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { FormInput, SelectInput } from '../../components/common/FormInput.jsx';
import { Plus, FileText, School, Calendar, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    examType: 'Midterm',
    academicYear: '2025-2026',
    classId: '',
    startDate: '2025-10-10',
    endDate: '2025-10-20',
    status: 'Scheduled',
    description: '',
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examRes, clsRes, subRes] = await Promise.all([
        api.get('/examinations'),
        api.get('/classes'),
        api.get('/subjects'),
      ]);
      setExams(examRes.data);
      setClasses(clsRes.data);
      setSubjects(subRes.data);
      if (clsRes.data.length > 0 && !formData.classId) {
        setFormData((prev) => ({ ...prev, classId: clsRes.data[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load examinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      // Automatically include all standard subjects for this exam
      const examSubjects = subjects.map((s) => ({
        subjectId: s._id,
        examDate: formData.startDate,
        maxMarks: s.maxMarks || 100,
        passingMarks: s.passingMarks || 40,
      }));

      await api.post('/examinations', {
        ...formData,
        subjects: examSubjects,
      });

      toast.success('Examination created with subject schedules');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create exam');
    }
  };

  const columns = [
    {
      header: 'Examination Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.name}</span>
          <span className="text-xs text-slate-400">{row.academicYear} • {row.examType}</span>
        </div>
      ),
    },
    {
      header: 'Class',
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {row.classId?.name}
        </span>
      ),
    },
    {
      header: 'Exam Window',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {new Date(row.startDate).toLocaleDateString()} – {new Date(row.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Subjects Scheduled',
      render: (row) => (
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
          {row.subjects?.length || 0} Subjects
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
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/marks?examId=${row._id}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Enter Marks
          </button>
          <button
            onClick={() => navigate(`/admin/report-cards?examId=${row._id}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <School className="w-3.5 h-3.5" />
            Report Cards
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Examinations Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule academic exams, manage subject assessments, and record student grades.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Schedule Examination
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <DataTable
          columns={columns}
          data={exams}
          loading={loading}
          emptyMessage="No examinations scheduled yet."
        />
      </div>

      {/* Add Exam Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule New Examination">
        <form onSubmit={handleCreateExam} className="space-y-4">
          <FormInput
            label="Examination Title"
            placeholder="e.g. Midterm Comprehensive 2025"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              label="Exam Type"
              value={formData.examType}
              onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
            >
              <option value="Midterm">Midterm Examination</option>
              <option value="Final">Final Examination</option>
              <option value="Quarterly">Quarterly Assessment</option>
              <option value="Unit Test">Unit Test</option>
              <option value="Practical">Practical Evaluation</option>
            </SelectInput>
            <SelectInput
              label="Target Class"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              required
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <FormInput
            label="Academic Year"
            value={formData.academicYear}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
              Create & Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
