import React, { useRef } from 'react';
import { 
  Award, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode,
  GraduationCap
} from 'lucide-react';
import { Course } from '../../types';

interface CourseCertificateModalProps {
  course: Course;
  studentName: string;
  rollNumber: string;
  completionPercentage: number;
  issueDate?: string;
  onClose: () => void;
}

export const CourseCertificateModal: React.FC<CourseCertificateModalProps> = ({
  course,
  studentName,
  rollNumber,
  completionPercentage,
  issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  onClose
}) => {
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const certId = `SC-CERT-${course.code.replace(/[^a-zA-Z0-9]/g, '')}-${rollNumber.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8 my-8 text-white">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">
              Official Institutional Certificate of Academic Completion
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Display Canvas */}
        <div
          ref={certificateRef}
          className="relative bg-gradient-to-br from-[#04130e] via-[#08221a] to-[#04130e] border-8 border-[#d4af37]/60 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl overflow-hidden print:border-black print:text-black print:bg-white"
        >
          {/* Subtle Decorative Guilloche Border Accents */}
          <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#d4af37]/80 pointer-events-none" />
          <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#d4af37]/80 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#d4af37]/80 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#d4af37]/80 pointer-events-none" />

          {/* Institutional Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <GraduationCap className="w-8 h-8" />
              <span className="font-extrabold text-xl tracking-tight text-white uppercase font-serif">
                SC EduSense AI
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-300/80 font-medium">
              Autonomous Academic Institution of Engineering & Technology
            </p>
          </div>

          <div className="space-y-1 pt-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5d77f] tracking-wide">
              CERTIFICATE OF COMPLETION
            </h1>
            <p className="text-xs text-slate-300 italic">
              This is to formally certify that
            </p>
          </div>

          {/* Student Name */}
          <div className="py-2 border-b border-[#d4af37]/40 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
              {studentName}
            </h2>
            <p className="text-xs text-emerald-300 font-mono pt-1">
              Roll No: {rollNumber}
            </p>
          </div>

          {/* Course Name and Details */}
          <div className="space-y-2 max-w-xl mx-auto text-xs text-slate-300 leading-relaxed">
            <p>
              has successfully completed all curricular lectures, laboratory assessments, quizzes, and examinations for the accredited course
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif text-emerald-200">
              {course.code}: {course.name}
            </h3>
            <p className="text-[11px] text-slate-400">
              Department of {course.department} • {course.credits} Academic Credits Earned
            </p>
          </div>

          {/* Verification Badge & Footer Signatures */}
          <div className="pt-8 grid grid-cols-3 items-center gap-4 text-xs border-t border-slate-800/80">
            <div className="text-left space-y-1">
              <div className="h-8 flex items-end font-serif italic text-emerald-300 text-sm">
                Prof. Alan Turing
              </div>
              <div className="border-t border-slate-600 pt-1">
                <span className="font-bold text-[11px] text-slate-300 block">Course Instructor</span>
                <span className="text-[10px] text-slate-500">Dept. of Computer Science</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-14 h-14 rounded-full border-2 border-[#d4af37] bg-emerald-950/80 flex items-center justify-center text-center p-1 shadow-lg">
                <ShieldCheck className="w-7 h-7 text-[#d4af37]" />
              </div>
              <span className="text-[9px] font-mono text-emerald-300 tracking-wider font-bold uppercase">
                VERIFIED CREDENTIAL
              </span>
            </div>

            <div className="text-right space-y-1">
              <div className="h-8 flex items-end justify-end font-serif italic text-emerald-300 text-sm">
                Dr. Margaret Hamilton
              </div>
              <div className="border-t border-slate-600 pt-1">
                <span className="font-bold text-[11px] text-slate-300 block">Dean of Academic Affairs</span>
                <span className="text-[10px] text-slate-500">SC EduSense AI</span>
              </div>
            </div>
          </div>

          {/* Certificate ID & Metadata Footer */}
          <div className="pt-4 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/50">
            <span>Certificate ID: {certId}</span>
            <span>Issue Date: {issueDate}</span>
            <span>Final Grade Score: {completionPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
