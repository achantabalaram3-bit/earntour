import { useEffect, useMemo, useState } from 'react';
import { tokens as fmtTokens, coins as fmtCoins, tokenCount } from '../../lib/format';
import { coinsAPI } from '../../lib/api';
import { Coins, ShieldCheck, TrendingUp, TrendingDown, Receipt, X } from 'lucide-react';
import { COIN_POLICY, TOKEN_POLICY } from '../../config/tallskill';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import PrizeLeagueLogo from '../layout/PrizeLeagueLogo';
import CashOutCard from './CashOutCard';

const FILTERS = [
 { id: 'today', label: 'Today', days: 1 },
 { id: 'week', label: 'Week', days: 7 },
 { id: 'month', label: 'Month', days: 30 },
 { id: 'year', label: 'Year', days: 365 },
 { id: 'all', label: 'All', days: null},
];

/** Return start-of-window in ms; null means no filter. */
function windowStart(filter) {
 if (!filter || filter === 'all') return null;
 const meta = FILTERS.find(f => f.id === filter);
 if (!meta || !meta.days) return null;
 return Date.now() - meta.days * 24 * 60 * 60 * 1000;
}

const TX_LABELS = {
 topup: 'Legacy purchase',
 ad_reward: 'Rewarded ad',
 spend: 'Contest entry',
 refund: 'Refund',
 admin_adjust: 'Admin adjustment',
 referral_bonus: 'Referral bonus',
 signup_bonus: 'Signup bonus',
 influencer_bonus: 'Influencer bonus',
 champion_prize: 'Championship prize',
 winnings: 'Winnings',
};

function TxReceipt({ tx, open, onClose, walletBefore }) {
 if (!tx) return null;
 const balanceAfter = tx.balance_after;
 const dt = new Date(tx.created_at);
 return (
 <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
 <DialogContent className="max-w-md" data-testid="tx-receipt">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <Receipt className="w-5 h-5 text-[#16A34A]" /> Transaction receipt
 </DialogTitle>
 </DialogHeader>
 <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5 bg-slate-50">
 <div className="flex items-center justify-between mb-4">
 <PrizeLeagueLogo size={28} emblemOnly />
 <div className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
 {tx.amount > 0 ? 'Credit' : 'Debit'}
 </div>
 </div>
 <div className="space-y-2 text-sm">
 <Row label="Transaction ID" value={<span className="font-mono text-xs">{tx.tx_id}</span>} />
 <Row label="Date" value={dt.toLocaleDateString('en-IN')} />
 <Row label="Time" value={dt.toLocaleTimeString('en-IN')} />
 <Row label="Description" value={TX_LABELS[tx.kind] || tx.kind} />
 {tx.note && <Row label="Note" value={<span className="text-slate-500 text-xs">{tx.note}</span>} />}
 {tx.ref_order_id && <Row label="Order" value={<span className="font-mono text-xs">{tx.ref_order_id}</span>} />}
  <div className="h-px bg-slate-200 my-3" />
 <Row label="Tokens" bold value={<span className={tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}>{tx.amount > 0 ? '+' : ''}{fmtTokens(tx.amount)}</span>} />
 <Row label="Balance before" value={fmtTokens(walletBefore)} />
 <Row label="Balance after" bold value={fmtTokens(balanceAfter)} />
 <Row label="Status" value={<span className="text-emerald-600 font-semibold">Completed</span>} />
 </div>
 </div>
 <button className="mt-2 text-sm text-slate-500 hover:text-slate-800 mx-auto flex items-center gap-1" onClick={onClose}>
 <X className="w-3 h-3" /> Close
 </button>
 </DialogContent>
 </Dialog>
 );
}
function Row({ label, value, bold }) {
 return (
 <div className="flex justify-between items-center">
 <span className="text-slate-500">{label}</span>
 <span className={bold ? 'font-bold text-slate-900' : 'text-slate-800'}>{value}</span>
 </div>
 );
}

export default function WalletPanel({ wallet, walletTxs }) {
 const [filter, setFilter] = useState('month');
 const [selectedTx, setSelectedTx] = useState(null);
 const [coinWallet, setCoinWallet] = useState(null);

 useEffect(() => { coinsAPI.me().then(setCoinWallet).catch(() => {}); }, []);

 const filteredTxs = useMemo(() => {
 const start = windowStart(filter);
 if (!start) return walletTxs;
 return walletTxs.filter(tx => new Date(tx.created_at).getTime() >= start);
 }, [walletTxs, filter]);

 const stats = useMemo(() => {
 const earned = filteredTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
 const used = filteredTxs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
 return { earned, used };
 }, [filteredTxs]);

 return (
 <div className="space-y-6" data-testid="wallet-panel">
 <div className="bg-gradient-to-br from-[#3E0BAA] via-[#16A34A] to-[#22C55E] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden" data-testid="wallet-hero">
 <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#FFD54A]/20 blur-3xl" />
 <div className="relative">
 <div className="text-white/85 text-xs uppercase tracking-widest flex items-center gap-2"><Coins className="w-4 h-4" /> {TOKEN_POLICY.name} · Challenge World entry</div>
 <div className="mt-1 font-display font-extrabold text-5xl md:text-6xl flex items-baseline gap-2" data-testid="wallet-balance">
 <span>{wallet ? tokenCount(wallet.tokens ?? wallet.balance) : 0}</span>
 <span className="text-xl md:text-2xl text-white/80 font-bold">tokens</span>
 </div>
 <div className="mt-2 text-xs text-white/85">Earn tokens by watching verified rewarded ads (coming soon). Tokens are never sold.</div>
 </div>
 <div className="relative mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 text-white/90">
 <div className="bg-white/10 backdrop-blur rounded-xl p-3">
 <div className="text-[10px] uppercase tracking-wider text-white/70">Earned ({filter})</div>
 <div className="font-bold text-lg mt-0.5" data-testid="wallet-earned">{fmtTokens(stats.earned)}</div>
 </div>
 <div className="bg-white/10 backdrop-blur rounded-xl p-3">
 <div className="text-[10px] uppercase tracking-wider text-white/70">Used ({filter})</div>
 <div className="font-bold text-lg mt-0.5" data-testid="wallet-used">{fmtTokens(stats.used)}</div>
 </div>
 <div className="bg-white/10 backdrop-blur rounded-xl p-3" data-testid="coin-balance-card">
 <div className="text-[10px] uppercase tracking-wider text-white/70">{COIN_POLICY.name}</div>
 <div className="font-bold text-lg mt-0.5" data-testid="coin-balance">{fmtCoins(coinWallet?.coins ?? 0)}</div>
 <div className="text-[10px] text-white/60">Free World retries &amp; unlocks</div>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-3 items-start" data-testid="coin-policy-note">
 <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
 <p className="text-sm text-slate-600">
 TallSkill Tokens and Coins cannot be bought, sold, transferred, withdrawn or exchanged for cash, and have no rupee value. TallSkill has no deposits.
 </p>
 </div>

 <CashOutCard />

 {/* TRANSACTION HISTORY */}
 <div className="bg-white rounded-2xl border border-slate-100 p-6">
 <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
 <h3 className="font-display font-bold text-lg">Transaction history</h3>
 <div className="flex flex-wrap gap-1" data-testid="wallet-filters">
 {FILTERS.map(f => (
 <button
 key={f.id}
 onClick={() => setFilter(f.id)}
 data-testid={`filter-${f.id}`}
 className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filter === f.id ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#16A34A]/40'}`}
 >{f.label}</button>
 ))}
 </div>
 </div>

 {filteredTxs.length === 0 ? (
 <div className="text-sm text-slate-500 text-center py-10" data-testid="wallet-tx-empty">
 <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
 No transactions in this window. Try a wider filter.
 </div>
 ) : (
 <ul className="divide-y divide-slate-100" data-testid="wallet-tx-list">
 {filteredTxs.map(tx => {
 const before = tx.balance_after - tx.amount;
 return (
 <li key={tx.tx_id}>
 <button
 onClick={() => setSelectedTx({ tx, walletBefore: before })}
 data-testid={`wallet-tx-${tx.tx_id}`}
 className="w-full py-3 flex items-center gap-3 text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition"
 >
 <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
 {tx.amount > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-sm font-medium text-slate-800">{TX_LABELS[tx.kind] || tx.kind.replace(/_/g, ' ')}</div>
 <div className="text-xs text-slate-500 truncate">{tx.note || 'View receipt →'}</div>
 </div>
 <div className="text-right">
 <div className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.amount > 0 ? '+' : ''}{fmtTokens(tx.amount)}</div>
 <div className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleDateString('en-IN')}</div>
 </div>
 </button>
 </li>
 );
 })}
 </ul>
 )}
 </div>

 <TxReceipt
 tx={selectedTx?.tx}
 walletBefore={selectedTx?.walletBefore}
 open={!!selectedTx}
 onClose={() => setSelectedTx(null)}
 />
 </div>
 );
}
