import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, ShieldAlert, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { UserRole } from '../../types/school';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole, students, teachers, parents } = useSchoolStore();

  const demoStudent = students[0];
  const demoTeacher = teachers[0];
  const demoParent = parents[0];

  const roles: Array<{
    role: UserRole;
    title: string;
    demoAccount: string;
    summary: string;
    route: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    {
      role: 'student',
      title: 'Student Portal',
      demoAccount: demoStudent ? `${demoStudent.name} · Grade 10-A` : 'Aarav Adhikari',
      summary: 'View weekly timetable, attendance summary, terminal results, homework, and downloadable study guides.',
      route: '/student/dashboard',
      icon: GraduationCap,
    },
    {
      role: 'teacher',
      title: 'Teacher Portal',
      demoAccount: demoTeacher ? `${demoTeacher.name} · ${demoTeacher.department}` : 'Sunita Shrestha',
      summary: 'Inspect assigned class rosters, mark daily attendance, create homework assignments, and enter sample marks.',
      route: '/teacher/dashboard',
      icon: BookOpen,
    },
    {
      role: 'parent',
      title: 'Parent / Guardian Portal',
      demoAccount: demoParent ? `${demoParent.name} · ${demoParent.linkedStudentIds.length} Linked Children` : 'Ramesh Adhikari',
      summary: 'Switch between linked children, review attendance history, examine marks, and track pending homework.',
      route: '/parent/dashboard',
      icon: Users,
    },
    {
      role: 'admin',
      title: 'Administrator Portal',
      demoAccount: 'Prakash Gurung · School Admin',
      summary: 'Manage demo students, teachers, parents, classes, notices, admissions workflow, and public site settings.',
      route: '/admin/dashboard',
      icon: ShieldCheck,
    },
  ];

  const handleSelectRole = (role: UserRole, route: string) => {
    setRole(role);
    navigate(route);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2 max-w-2xl">
        <div className="text-xs font-medium text-[#2B548A]">Frontend MVP Role Selector</div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Select a Demo Portal Role
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Choose any role below to explore its dedicated dashboard and workflows. All data shown is fictional sample data stored locally in your browser.
        </p>
      </div>

      {/* Explicit Security & Limitation Callout per PRD Section 2 & 8 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-[#2B548A] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-900">Demonstration Mode Notice:</span> Role selection in this frontend MVP is strictly for interactive demonstration and does not verify identity, store passwords, or enforce server-side authorization. Production deployment requires verified backend authentication and access rules.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.role}
              type="button"
              onClick={() => handleSelectRole(item.role, item.route)}
              className="text-left bg-white border border-slate-200 rounded-xl p-6 hover:border-[#0F2544] transition-colors flex flex-col justify-between gap-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-[#F6F7F9] border border-slate-200 text-[#0F2544]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2B548A]">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Demo Entry</span>
                  </span>
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#0F2544]">
                    {item.title}
                  </h2>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{item.demoAccount}</div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-[#0F2544]">
                <span>Enter {item.title}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
