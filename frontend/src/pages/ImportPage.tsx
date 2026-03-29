import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBikes } from '../hooks/useBikes';
import { useImportSession, useUploadSession } from '../hooks/useSessions';
import BikeSelector from '../components/BikeSelector';
import type { ColumnMap } from '../types/session';

const DEFAULT_COLUMN_MAP: ColumnMap = {
  time_col: 'time',
  front_raw_col: 'front_raw',
  rear_raw_col: 'rear_raw',
  gyro_y_col: 'gyro_y',
  accel_x_col: 'accel_x',
  accel_y_col: 'accel_y',
  accel_z_col: 'accel_z',
  invert_front: false,
  invert_rear: false,
};

export default function ImportPage() {
  const navigate = useNavigate();
  const { data: bikes = [] } = useBikes();
  const { mutateAsync: importSession, isPending: isImporting } = useImportSession();
  const { mutateAsync: uploadSession, isPending: isUploading } = useUploadSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPath, setCsvPath] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [bikeSlug, setBikeSlug] = useState('');
  const [velocityQuantity, setVelocityQuantity] = useState<'wheel' | 'shaft'>('wheel');
  const [columnMap, setColumnMap] = useState<ColumnMap>(DEFAULT_COLUMN_MAP);
  const [importedId, setImportedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPending = isImporting || isUploading;

  const setCol = (key: keyof ColumnMap, value: string | boolean | null) => {
    setColumnMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) setCsvPath(file.name);
  };

  const handleImport = async () => {
    setError(null);
    setImportedId(null);
    try {
      let session;
      if (selectedFile) {
        session = await uploadSession({
          file: selectedFile,
          name: sessionName,
          bike_slug: bikeSlug,
          velocity_quantity: velocityQuantity,
          column_map: columnMap,
        });
      } else {
        session = await importSession({
          csv_path: csvPath,
          name: sessionName,
          bike_slug: bikeSlug,
          velocity_quantity: velocityQuantity,
          column_map: columnMap,
        });
      }
      setImportedId(session.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    }
  };

  const inputCls =
    'border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-orange-500';
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Import Session</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
        {/* CSV file — browse local machine or type a server path */}
        <div>
          <label className={labelCls}>CSV file</label>
          <div className="flex gap-2">
            <input
              className={inputCls}
              type="text"
              value={csvPath}
              readOnly={!!selectedFile}
              onChange={(e) => {
                setCsvPath(e.target.value);
                setSelectedFile(null);
              }}
              placeholder="/home/user/ride_data/session01.csv"
            />
            {/* Hidden native file picker — only .csv files */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              data-testid="csv-file-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Browse…
            </button>
          </div>
          {selectedFile && (
            <p className="mt-1 text-xs text-gray-500">
              Local file selected:{' '}
              <span className="font-medium text-gray-700">{selectedFile.name}</span>
              {' — '}
              <button
                type="button"
                className="text-orange-600 hover:underline"
                onClick={() => {
                  setSelectedFile(null);
                  setCsvPath('');
                  // Reset the native file input so the same file can be re-selected
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                clear
              </button>
            </p>
          )}
        </div>

        {/* Session name */}
        <div>
          <label className={labelCls}>Session name</label>
          <input
            className={inputCls}
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g. Sunday Rocky Peak Run"
          />
        </div>

        {/* Bike */}
        <div>
          <label className={labelCls}>Bike profile</label>
          <BikeSelector bikes={bikes} value={bikeSlug} onChange={setBikeSlug} className="w-full" />
        </div>

        {/* Velocity quantity */}
        <div>
          <label className={labelCls}>Velocity quantity</label>
          <div className="flex gap-6 mt-1">
            {(['wheel', 'shaft'] as const).map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name="velocityQuantity"
                  value={v}
                  checked={velocityQuantity === v}
                  onChange={() => setVelocityQuantity(v)}
                  className="accent-orange-500"
                />
                <span className="capitalize">{v}</span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-400 italic">
            Shaft velocity gives true damper speed; wheel velocity is useful for ride characterization
          </p>
        </div>

        {/* Column mapping */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 border-t border-gray-100 pt-4">
            Column Mapping
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {(
              [
                ['time_col', 'Time column'],
                ['front_raw_col', 'Front raw column'],
                ['rear_raw_col', 'Rear raw column'],
                ['gyro_y_col', 'Gyro Y column'],
                ['accel_x_col', 'Accel X column'],
                ['accel_y_col', 'Accel Y column'],
                ['accel_z_col', 'Accel Z column'],
              ] as [keyof ColumnMap, string][]
            ).map(([key, label]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input
                  className={inputCls}
                  type="text"
                  value={(columnMap[key] as string) ?? ''}
                  onChange={(e) => setCol(key, e.target.value || null)}
                  placeholder="column name"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-3">
            {(['invert_front', 'invert_rear'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={columnMap[key]}
                  onChange={(e) => setCol(key, e.target.checked)}
                  className="accent-orange-500"
                />
                {key === 'invert_front' ? 'Invert front' : 'Invert rear'}
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Success */}
        {importedId && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center justify-between">
            <span>Session imported successfully.</span>
            <button
              onClick={() => navigate(`/analyze?session=${importedId}`)}
              className="ml-4 px-3 py-1 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600"
            >
              Analyze Now
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleImport}
          disabled={isPending || (!csvPath && !selectedFile) || !sessionName || !bikeSlug}
          className="w-full py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Importing…' : 'Import Session'}
        </button>
      </div>
    </div>
  );
}
