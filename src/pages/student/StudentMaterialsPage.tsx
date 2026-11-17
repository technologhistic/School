import React, { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { getSubjectName, getTeacherName } from '../../services/schoolService';
import { DateDisplay } from '../../components/common/DateDisplay';
import { ModalDialog } from '../../components/common/ModalDialog';
import { DataStateShell } from '../../components/common/DataStateShell';
import { LearningMaterial } from '../../types/school';
import { downloadSampleNoticePdf } from '../../utils/pdfDownload';
import { formatSchoolDate } from '../../utils/bsDate';

export const StudentMaterialsPage: React.FC = () => {
  const state = useSchoolStore();
  const student = state.students.find((s) => s.id === state.activeStudentId) ?? state.students[0];
  const [preview, setPreview] = useState<LearningMaterial | null>(null);

  const materials = state.materials.filter((m) => m.classId === student?.classId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Study guides, worksheets, and laboratory notes shared for your class.
        </p>
        <span className="text-xs text-slate-500 tabular-nums">{materials.length} resources</span>
      </div>

      <DataStateShell
        isEmpty={materials.length === 0}
        emptyTitle="No study materials uploaded"
        emptyDescription="Teachers can add study resources from the Teacher Portal."
      >
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60"
            >
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-[#2B548A]">{mat.resourceType}</span>
                  {' · '}
                  <span>{getSubjectName(state, mat.subjectId)}</span>
                  {' · '}
                  <DateDisplay date={mat.uploadedDate} />
                  {' · '}
                  <span className="tabular-nums">{mat.fileSize}</span>
                </div>
                <h2 className="font-display text-base font-bold text-slate-900">{mat.title}</h2>
                <p className="text-xs text-slate-600">{mat.summary}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreview(mat)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadSampleNoticePdf({
                      schoolName: state.config.schoolName,
                      address: state.config.address,
                      title: mat.title,
                      category: mat.resourceType,
                      dateLabel: formatSchoolDate(mat.uploadedDate, state.calendarMode, 'en'),
                      body: `${getSubjectName(state, mat.subjectId)} — ${mat.summary}\n\nPrepared by: ${getTeacherName(state, mat.teacherId)}`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F2544] rounded-lg hover:bg-[#16345E]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </DataStateShell>

      <ModalDialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title ?? ''}
        description={
          preview
            ? `${preview.resourceType} · ${getSubjectName(state, preview.subjectId)}`
            : ''
        }
      >
        {preview && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#F6F7F9] border border-slate-200 text-sm text-slate-700 leading-relaxed">
              {preview.summary}
            </div>
            <div className="text-xs text-slate-500">
              Shared by {getTeacherName(state, preview.teacherId)} · Size {preview.fileSize}
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
};
