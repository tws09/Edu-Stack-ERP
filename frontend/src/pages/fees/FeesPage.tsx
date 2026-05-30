import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '../../services/academicService';
import { feeService } from '../../services/feeService';
import type { FeeStructureDoc, ChallanDoc } from '../../services/feeService';
import { branchHeaderService } from '../../services/branchHeaderService';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useAuthStore } from '../../stores/authStore';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { downloadChallanPdf } from '../../lib/challanPdf';

type Tab = 'structures' | 'challans';

const STATUS_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  paid: 'success', unpaid: 'danger', partial: 'warning', overdue: 'danger', waived: 'info',
};

const today = new Date();
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

export default function FeesPage() {
  const user    = useAuthStore(s => s.user);
  const orgSlug = useAuthStore(s => s.orgSlug);
  const qc = useQueryClient();
  const isAccountant = user?.role === 'accountant' || user?.role === 'branch_principal';

  const [tab, setTab] = useState<Tab>('challans');
  const [challanMonth, setChallanMonth] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Fee structure form
  const [structureOpen, setStructureOpen] = useState(false);
  const [editStructure, setEditStructure] = useState<FeeStructureDoc | null>(null);
  const [fsName, setFsName] = useState('');
  const [fsClassId, setFsClassId] = useState('');
  const [fsDueDay, setFsDueDay] = useState('10');
  const [fsItems, setFsItems] = useState<{ name: string; amount: string; isOptional: boolean }[]>([]);

  // Generate challans
  const [genOpen, setGenOpen] = useState(false);
  const [genMonth, setGenMonth] = useState(currentMonth);
  const [genClassId, setGenClassId] = useState('');

  // Payment modal
  const [payOpen, setPayOpen] = useState(false);
  const [payChallan, setPayChallan] = useState<ChallanDoc | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<string>('cash');
  const [payRef, setPayRef] = useState('');

  // Waiver modal
  const [waiverOpen, setWaiverOpen] = useState(false);
  const [waiverChallan, setWaiverChallan] = useState<ChallanDoc | null>(null);
  const [waiverDiscount, setWaiverDiscount] = useState('');
  const [waiverAmount, setWaiverAmount] = useState('');

  // Online payment modal (JazzCash / EasyPaisa)
  const [onlinePayOpen, setOnlinePayOpen] = useState(false);
  const [onlinePayChallan, setOnlinePayChallan] = useState<ChallanDoc | null>(null);
  const [onlineGateway, setOnlineGateway] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [onlineMobile, setOnlineMobile] = useState('');
  const [onlineCnic, setOnlineCnic] = useState('');
  const [onlineResult, setOnlineResult] = useState<{ success: boolean; message: string } | null>(null);

  const [apiError, setApiError] = useState('');

  const { data: branchHeader } = useQuery({ queryKey: ['branch-header'], queryFn: branchHeaderService.get });
  const orgName = branchHeader?.schoolName ?? orgSlug ?? 'School';

  const { data: years = [] } = useQuery({ queryKey: ['years'], queryFn: academicService.getYears });
  const currentYear = years.find(y => y.isCurrent) ?? years[0];

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', currentYear?._id],
    queryFn: () => academicService.getClasses(currentYear?._id),
    enabled: !!currentYear,
  });

  const { data: structures = [], isLoading: loadingStructures } = useQuery({
    queryKey: ['fee-structures', currentYear?._id],
    queryFn: () => feeService.listStructures({ academicYearId: currentYear!._id }),
    enabled: !!currentYear && tab === 'structures',
  });

  const challanParams: Record<string, string> = { month: challanMonth };
  if (statusFilter) challanParams['status'] = statusFilter;
  if (classFilter) challanParams['classId'] = classFilter;

  const { data: challanResp, isLoading: loadingChallans } = useQuery({
    queryKey: ['challans', challanMonth, statusFilter, classFilter],
    queryFn: () => feeService.listChallans(challanParams),
    enabled: tab === 'challans',
  });
  const challans = challanResp?.data ?? [];

  const { data: summary = [] } = useQuery({
    queryKey: ['fee-summary', challanMonth],
    queryFn: () => feeService.getSummary({ month: challanMonth }),
    enabled: tab === 'challans',
  });

  const createStructureMutation = useMutation({
    mutationFn: feeService.createStructure,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fee-structures'] }); closeStructureModal(); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Error'),
  });

  const updateStructureMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeeStructureDoc> }) => feeService.updateStructure(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fee-structures'] }); closeStructureModal(); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Error'),
  });

  const generateMutation = useMutation({
    mutationFn: feeService.generateChallans,
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['challans'] }); setGenOpen(false); alert(`Generated ${r.data?.created} challans, skipped ${r.data?.skipped}`); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Error'),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount: number; method: string; transactionRef?: string } }) => feeService.recordPayment(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['challans'] }); qc.invalidateQueries({ queryKey: ['fee-summary'] }); qc.invalidateQueries({ queryKey: ['fee-history'] }); setPayOpen(false); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Error'),
  });

  const waiverMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { discount?: number; waiver?: number } }) => feeService.applyWaiver(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['challans'] }); qc.invalidateQueries({ queryKey: ['fee-summary'] }); qc.invalidateQueries({ queryKey: ['fee-history'] }); setWaiverOpen(false); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Error'),
  });

  const onlinePayMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { mobileNumber: string; gateway: 'jazzcash' | 'easypaisa'; cnic?: string } }) => feeService.payOnline(id, data),
    onSuccess: (r) => {
      if (r.success) {
        setOnlineResult({ success: true, message: `Payment initiated. Ref: ${r.data?.txnRefNo}. The customer will receive a PIN on their phone.` });
        qc.invalidateQueries({ queryKey: ['challans'] });
      } else {
        setOnlineResult({ success: false, message: r.data?.responseDesc ?? 'Payment failed. Please try again.' });
      }
    },
    onError: (e: { response?: { data?: { message?: string } } }) => setOnlineResult({ success: false, message: e?.response?.data?.message ?? 'Payment initiation failed.' }),
  });

  const closeStructureModal = () => {
    setStructureOpen(false); setEditStructure(null);
    setFsName(''); setFsClassId(''); setFsDueDay('10'); setFsItems([]); setApiError('');
  };

  const openCreateStructure = () => { closeStructureModal(); setStructureOpen(true); };
  const openEditStructure = (s: FeeStructureDoc) => {
    setEditStructure(s);
    setFsName(s.name);
    setFsClassId(typeof s.classId === 'object' ? s.classId._id : s.classId);
    setFsDueDay(String(s.dueDay));
    setFsItems(s.items.map(i => ({ name: i.name, amount: String(i.amount), isOptional: i.isOptional })));
    setApiError('');
    setStructureOpen(true);
  };

  const handleSaveStructure = () => {
    if (!fsName || !fsClassId || fsItems.length === 0) { setApiError('Fill name, class, and add at least one item.'); return; }
    const items = fsItems.map(i => ({ name: i.name, amount: Number(i.amount), isOptional: i.isOptional }));
    const data: Partial<FeeStructureDoc> = { name: fsName, classId: fsClassId, academicYearId: currentYear!._id, items, dueDay: parseInt(fsDueDay) };
    if (editStructure) updateStructureMutation.mutate({ id: editStructure._id, data });
    else createStructureMutation.mutate(data);
  };

  const openPayment = (c: ChallanDoc) => {
    setPayChallan(c); setPayAmount(String(c.netAmount - c.paidAmount)); setPayMethod('cash'); setPayRef(''); setApiError(''); setPayOpen(true);
  };

  const handlePayment = () => {
    if (!payChallan || !payAmount) return;
    paymentMutation.mutate({ id: payChallan._id, data: { amount: Number(payAmount), method: payMethod, transactionRef: payRef || undefined } });
  };

  const handleWaiver = () => {
    if (!waiverChallan) return;
    waiverMutation.mutate({ id: waiverChallan._id, data: { discount: waiverDiscount ? Number(waiverDiscount) : undefined, waiver: waiverAmount ? Number(waiverAmount) : undefined } });
  };

  const summaryByStatus = Object.fromEntries(summary.map(s => [s._id, s]));
  const totalCollected = summary.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalPending = summary.filter(s => ['unpaid', 'partial', 'overdue'].includes(s._id)).reduce((sum, s) => sum + (s.totalNet - s.totalPaid), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Fee Management"
        actions={isAccountant ? (
          <div className="flex gap-2">
            {tab === 'structures' && <button onClick={openCreateStructure} className="btn-primary text-sm">+ Fee Structure</button>}
            {tab === 'challans' && <button onClick={() => { setGenMonth(currentMonth); setGenClassId(''); setApiError(''); setGenOpen(true); }} className="btn-primary text-sm">Generate Challans</button>}
          </div>
        ) : undefined}
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 mb-5 w-fit">
        {(['challans', 'structures'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-1.5 text-sm rounded-md transition-colors capitalize', tab === t ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700')}>
            {t === 'challans' ? 'Fee Challans' : 'Fee Structures'}
          </button>
        ))}
      </div>

      {/* Summary bar (challans tab) */}
      {tab === 'challans' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="card p-4">
              <p className="text-xs text-gray-500">Collected</p>
              <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalCollected)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(totalPending)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Paid</p>
              <p className="text-xl font-bold mt-1">{summaryByStatus['paid']?.count ?? 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Unpaid</p>
              <p className="text-xl font-bold text-red-500 mt-1">{(summaryByStatus['unpaid']?.count ?? 0) + (summaryByStatus['overdue']?.count ?? 0)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-4 mb-4">
            <div className="flex gap-3 flex-wrap">
              <div>
                <label className="label">Month</label>
                <input type="month" className="input" value={challanMonth} onChange={e => setChallanMonth(e.target.value)} />
              </div>
              <div>
                <label className="label">Class</label>
                <select className="input" value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                  <option value="">All classes</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All</option>
                  {['unpaid', 'partial', 'paid', 'waived', 'overdue'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Challan #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Class</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Net</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Paid</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Due</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loadingChallans && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 text-sm">Loading...</td></tr>
                )}
                {!loadingChallans && challans.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 text-sm">No challans for this period.</td></tr>
                )}
                {challans.map(c => {
                  const student = typeof c.studentId === 'object' ? c.studentId : null;
                  const cls = typeof c.classId === 'object' ? c.classId : null;
                  const isSettled = c.status === 'paid' || c.status === 'waived';
                  return (
                    <tr key={c._id} className={cn(c.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20' : '')}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{c.challanNo}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-slate-100">{student?.profile.name ?? '—'}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{student?.rollNo}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{cls?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-medium dark:text-slate-200">{formatCurrency(c.netAmount)}</td>
                      <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(c.paidAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={STATUS_VARIANT[c.status] ?? 'default'}>{c.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{formatDate(c.dueDate)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1 justify-center flex-wrap">
                          {isAccountant && !isSettled && (
                            <button onClick={() => openPayment(c)} className="text-xs px-2 py-1 rounded border border-green-200 text-green-700 hover:bg-green-50 transition-colors">Pay</button>
                          )}
                          {isAccountant && !isSettled && (
                            <button
                              onClick={() => { setOnlinePayChallan(c); setOnlineGateway('jazzcash'); setOnlineMobile(''); setOnlineCnic(''); setOnlineResult(null); setOnlinePayOpen(true); }}
                              className="text-xs px-2 py-1 rounded border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                              title="Pay via JazzCash or EasyPaisa"
                            >
                              📱 Online
                            </button>
                          )}
                          {isAccountant && !isSettled && (
                            <button onClick={() => { setWaiverChallan(c); setWaiverDiscount(''); setWaiverAmount(''); setWaiverOpen(true); }} className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors">Waiver</button>
                          )}
                          <button
                            onClick={() => downloadChallanPdf(c, orgName)}
                            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            title="Download PDF"
                          >
                            ↓ PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Fee Structures tab */}
      {tab === 'structures' && (
        <div className="card divide-y divide-gray-100">
          {loadingStructures && <div className="px-5 py-10 text-center text-gray-400 text-sm">Loading...</div>}
          {!loadingStructures && structures.length === 0 && (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">No fee structures. Create one to get started.</div>
          )}
          {structures.map(s => {
            const cls = typeof s.classId === 'object' ? s.classId : null;
            return (
              <div key={s._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/40">
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{s.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{cls?.name} · Due day {s.dueDay} · {s.items.length} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{formatCurrency(s.totalAmount)}</span>
                  {isAccountant && (
                    <button onClick={() => openEditStructure(s)} className="btn-secondary text-xs">Edit</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fee Structure Modal */}
      <Modal open={structureOpen} onClose={closeStructureModal} title={editStructure ? 'Edit Fee Structure' : 'Create Fee Structure'} size="lg">
        <div className="space-y-4">
          {apiError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{apiError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Name</label>
              <input className="input" value={fsName} onChange={e => setFsName(e.target.value)} placeholder="e.g. Monthly Fee" />
            </div>
            <div>
              <label className="label">Class</label>
              <select className="input" value={fsClassId} onChange={e => setFsClassId(e.target.value)}>
                <option value="">Select class...</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due Day of Month</label>
            <input type="number" className="input" value={fsDueDay} onChange={e => setFsDueDay(e.target.value)} min={1} max={28} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Fee Items</label>
              <button onClick={() => setFsItems(prev => [...prev, { name: '', amount: '', isOptional: false }])} className="text-sm text-blue-600 hover:text-blue-700">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {fsItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className="input flex-1" placeholder="Item name" value={item.name} onChange={e => setFsItems(prev => prev.map((it, idx) => idx === i ? { ...it, name: e.target.value } : it))} />
                  <input type="number" className="input w-28" placeholder="Amount" value={item.amount} onChange={e => setFsItems(prev => prev.map((it, idx) => idx === i ? { ...it, amount: e.target.value } : it))} />
                  <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                    <input type="checkbox" checked={item.isOptional} onChange={e => setFsItems(prev => prev.map((it, idx) => idx === i ? { ...it, isOptional: e.target.checked } : it))} /> Optional
                  </label>
                  <button onClick={() => setFsItems(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                </div>
              ))}
              {fsItems.length === 0 && <p className="text-sm text-gray-400 text-center py-2">No items. Click "+ Add Item".</p>}
            </div>
            {fsItems.length > 0 && (
              <p className="text-sm text-right text-gray-600 mt-2 font-medium">
                Total: {formatCurrency(fsItems.reduce((s, i) => s + (Number(i.amount) || 0), 0))}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={closeStructureModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveStructure} disabled={createStructureMutation.isPending || updateStructureMutation.isPending} className="btn-primary">
              {createStructureMutation.isPending || updateStructureMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Generate Challans Modal */}
      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="Generate Monthly Challans" size="sm">
        <div className="space-y-4">
          {apiError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{apiError}</div>}
          <div>
            <label className="label">Month</label>
            <input type="month" className="input" value={genMonth} onChange={e => setGenMonth(e.target.value)} />
          </div>
          <div>
            <label className="label">Class (optional — leave blank for all)</label>
            <select className="input" value={genClassId} onChange={e => setGenClassId(e.target.value)}>
              <option value="">All classes</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setGenOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => generateMutation.mutate({ month: genMonth, classId: genClassId || undefined })} disabled={generateMutation.isPending} className="btn-primary">
              {generateMutation.isPending ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment" size="sm">
        <div className="space-y-4">
          {payChallan && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm">
              <p className="text-gray-500 dark:text-slate-400">Outstanding: <span className="font-semibold text-gray-900">{formatCurrency(payChallan.netAmount - payChallan.paidAmount)}</span></p>
            </div>
          )}
          {apiError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{apiError}</div>}
          <div>
            <label className="label">Amount (PKR)</label>
            <input type="number" className="input" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Method</label>
            <select className="input" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
              {['cash', 'bank_transfer', 'jazzcash', 'easypaisa', 'cheque'].map(m => <option key={m} value={m} className="capitalize">{m.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Transaction Ref (optional)</label>
            <input className="input" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Transaction ID, receipt no..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setPayOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handlePayment} disabled={paymentMutation.isPending || !payAmount} className="btn-primary">
              {paymentMutation.isPending ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Online Payment Modal (JazzCash / EasyPaisa) */}
      <Modal open={onlinePayOpen} onClose={() => { setOnlinePayOpen(false); setOnlineResult(null); }} title="Online Payment" size="sm">
        <div className="space-y-4">
          {onlinePayChallan && !onlineResult && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm">
              <p className="text-gray-500 dark:text-slate-400">
                Amount: <span className="font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(onlinePayChallan.netAmount - onlinePayChallan.paidAmount)}</span>
              </p>
              <p className="text-gray-400 dark:text-slate-500 text-xs mt-0.5">Challan: {onlinePayChallan.challanNo}</p>
            </div>
          )}

          {onlineResult ? (
            <div className={cn('rounded-lg p-4 text-sm', onlineResult.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700')}>
              <p className="font-semibold mb-1">{onlineResult.success ? '✓ Payment Initiated' : '✗ Payment Failed'}</p>
              <p>{onlineResult.message}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="label">Payment Gateway</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['jazzcash', 'easypaisa'] as const).map(gw => (
                    <button
                      key={gw}
                      onClick={() => setOnlineGateway(gw)}
                      className={cn('py-2.5 rounded-lg border text-sm font-medium transition-colors capitalize', onlineGateway === gw ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')}
                    >
                      {gw === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Customer Mobile Number</label>
                <input
                  className="input"
                  value={onlineMobile}
                  onChange={e => setOnlineMobile(e.target.value)}
                  placeholder="03xxxxxxxxx"
                  maxLength={11}
                />
                <p className="text-xs text-gray-400 mt-1">Must be a registered {onlineGateway === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} number</p>
              </div>
              {onlineGateway === 'jazzcash' && (
                <div>
                  <label className="label">CNIC (last 6 digits, optional)</label>
                  <input className="input" value={onlineCnic} onChange={e => setOnlineCnic(e.target.value)} placeholder="XXXXXX" maxLength={13} />
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 justify-end">
            <button onClick={() => { setOnlinePayOpen(false); setOnlineResult(null); }} className="btn-secondary">
              {onlineResult ? 'Close' : 'Cancel'}
            </button>
            {!onlineResult && (
              <button
                onClick={() => onlinePayChallan && onlinePayMutation.mutate({ id: onlinePayChallan._id, data: { mobileNumber: onlineMobile, gateway: onlineGateway, cnic: onlineCnic || undefined } })}
                disabled={onlinePayMutation.isPending || !onlineMobile || onlineMobile.length !== 11}
                className="btn-primary bg-purple-600 hover:bg-purple-700 border-purple-600"
              >
                {onlinePayMutation.isPending ? 'Initiating...' : `Pay via ${onlineGateway === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}`}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Waiver Modal */}
      <Modal open={waiverOpen} onClose={() => setWaiverOpen(false)} title="Apply Discount / Waiver" size="sm">
        <div className="space-y-4">
          {waiverChallan && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm">
              <p className="text-gray-500">Total: <span className="font-semibold">{formatCurrency(waiverChallan.totalAmount)}</span></p>
            </div>
          )}
          {apiError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{apiError}</div>}
          <div>
            <label className="label">Discount (PKR)</label>
            <input type="number" className="input" value={waiverDiscount} onChange={e => setWaiverDiscount(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="label">Full Waiver (PKR)</label>
            <input type="number" className="input" value={waiverAmount} onChange={e => setWaiverAmount(e.target.value)} placeholder="0" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setWaiverOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleWaiver} disabled={waiverMutation.isPending} className="btn-primary">
              {waiverMutation.isPending ? 'Saving...' : 'Apply'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
