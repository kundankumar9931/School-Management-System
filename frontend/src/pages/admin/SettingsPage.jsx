import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { School, Award, Shield, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const [gradingRules, setGradingRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradingRules = async () => {
      try {
        const res = await api.get('/grading-rules');
        setGradingRules(res.data);
      } catch (err) {
        toast.error('Failed to load grading scale');
      } finally {
        setLoading(false);
      }
    };
    fetchGradingRules();
  }, []);

  const gradingColumns = [
    {
      header: 'Grade Symbol',
      accessor: 'grade',
      render: (row) => (
        <span className="font-bold text-sm px-3 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
          {row.grade}
        </span>
      ),
    },
    {
      header: 'Score Range (%)',
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.minPercentage}% – {row.maxPercentage}%
        </span>
      ),
    },
    {
      header: 'Grade Point',
      accessor: 'gradePoint',
      render: (row) => <span className="font-mono text-xs">{row.gradePoint?.toFixed(1)}</span>,
    },
    {
      header: 'Passing Threshold',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.isPassing
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {row.isPassing ? 'Passing Grade' : 'Failing Grade'}
        </span>
      ),
    },
    {
      header: 'Descriptor',
      accessor: 'description',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Global academic thresholds, institution metadata, and grading boundary parameters.
        </p>
      </div>

      {/* Academy Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-subtle">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Algions International Academy</h2>
            <p className="text-xs text-slate-400">Accredited Academic Institution • System ID: SMS-ALG-2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Active Academic Year</span>
            <span className="font-bold text-slate-800 text-sm">2025–2026</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Grading Policy</span>
            <span className="font-bold text-slate-800 text-sm">6-Tier Standard Scale</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Payment Settlement</span>
            <span className="font-bold text-emerald-600 text-sm">Simulated Instant Reconciliation</span>
          </div>
        </div>
      </div>

      {/* Grading Rules Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Dynamic Grading Scale Rules</h3>
            <p className="text-xs text-slate-400">
              Evaluations dynamically cross-reference these active boundary thresholds.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
            <Check className="w-3.5 h-3.5" />
            Config Active
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100">
          <DataTable
            columns={gradingColumns}
            data={gradingRules}
            loading={loading}
            emptyMessage="No grading scale defined."
          />
        </div>
      </div>
    </div>
  );
};
