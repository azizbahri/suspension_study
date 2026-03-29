import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Upload, Sliders, BarChart2, GitCompare, PlayCircle } from 'lucide-react';
import { getDemoStatus } from '../api/demo';
import logo from '../assets/logo.svg';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: status } = useQuery({
    queryKey: ['demo-status'],
    queryFn: getDemoStatus,
  });

  const stats = [
    { label: 'Sessions', value: status?.session_count ?? '—' },
    { label: 'Bike profiles', value: status?.bike_count ?? '—' },
    { label: 'Analyzed', value: status?.analyzed_count ?? '—' },
  ];

  const steps = [
    {
      icon: <Upload size={20} />,
      title: 'Import',
      desc: 'Register a DAQ CSV file and map its columns to the signal names the pipeline expects.',
      path: '/import',
    },
    {
      icon: <Sliders size={20} />,
      title: 'Calibrate',
      desc: 'Fit your sensor transfer functions and linkage polynomial, then apply them to a bike profile.',
      path: '/calibrate',
    },
    {
      icon: <BarChart2 size={20} />,
      title: 'Analyze',
      desc: 'Run the full signal processing pipeline and view travel histograms, velocity histograms, and pitch trace.',
      path: '/analyze',
    },
    {
      icon: <GitCompare size={20} />,
      title: 'Compare',
      desc: 'Overlay up to three sessions side-by-side to evaluate setup changes between rides.',
      path: '/compare',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-[#160C03] via-[#2C1808] to-[#4A2C0E] rounded-2xl p-8 overflow-hidden">
        {/* Decorative rings echoing the logo border */}
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full border-2 border-[#C8941A] opacity-10 pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full border border-[#D9B045] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-8">
          {/* Logo */}
          <div className="flex-shrink-0 drop-shadow-2xl">
            <img src={logo} alt="Suspension Study logo" className="w-40 h-40" />
          </div>

          {/* Text block */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-[#D4A843] tracking-tight leading-tight">
              Suspension Study
            </h1>
            <div className="w-14 h-0.5 bg-[#C8941A] mt-2 mb-3 rounded-full" />
            <p className="text-[#D4BF85] text-sm leading-relaxed">
              Adventure motorcycle suspension DAQ post-processor — import a ride CSV,
              calibrate your sensor transfer functions, and get data-driven tuning
              insights from travel histograms, velocity histograms, and pitch telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Demo session card */}
      {status?.demo_session_id && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-orange-900">Demo session ready</p>
            <p className="text-xs text-orange-700 mt-0.5">
              A 30-second simulated rough-terrain ride has been pre-loaded. Click Analyze to
              see histograms and diagnostic advice without needing real hardware.
            </p>
          </div>
          <button
            onClick={() => navigate(`/analyze?session=${status.demo_session_id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex-shrink-0"
          >
            <PlayCircle size={16} />
            Analyze Demo
          </button>
        </div>
      )}

      {/* Getting started steps */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Getting started
        </h2>
        <div className="space-y-3">
          {steps.map(({ icon, title, desc, path }, i) => (
            <button
              key={title}
              onClick={() => navigate(path)}
              className="w-full bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 text-left hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-orange-500 group-hover:text-orange-600">{icon}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
