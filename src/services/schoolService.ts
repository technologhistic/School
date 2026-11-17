import { AttendanceRecord, ResultRecord } from '../types/school';
import { SchoolState } from '../store/useSchoolStore';

/**
 * Service abstraction layer over the client store.
 * Future Firebase/Supabase/REST implementations can replace these functions
 * without changing UI page components.
 */
export function calculateAttendanceSummary(records: AttendanceRecord[]) {
  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;
  return { total, present, late, absent, percentage };
}

export function calculateTermAverage(records: ResultRecord[]) {
  if (records.length === 0) return { averagePct: 0, totalMarks: 0, totalMax: 0, gpa: '0.00' };
  const totalMarks = records.reduce((acc, r) => acc + r.marks, 0);
  const totalMax = records.reduce((acc, r) => acc + r.maxMarks, 0);
  const averagePct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 1000) / 10 : 0;
  const gpa = (Math.min(4, (averagePct / 100) * 4)).toFixed(2);
  return { averagePct, totalMarks, totalMax, gpa };
}

export function getClassLabel(state: Pick<SchoolState, 'classes'>, classId: string): string {
  const cls = state.classes.find((c) => c.id === classId);
  return cls ? `${cls.grade} – ${cls.section}` : classId;
}

export function getSubjectName(state: Pick<SchoolState, 'subjects'>, subjectId: string): string {
  const sub = state.subjects.find((s) => s.id === subjectId);
  return sub ? sub.name : subjectId;
}

export function getTeacherName(state: Pick<SchoolState, 'teachers'>, teacherId: string): string {
  const tch = state.teachers.find((t) => t.id === teacherId);
  return tch ? tch.name : 'Faculty Member';
}
