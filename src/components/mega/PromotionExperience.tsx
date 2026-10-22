import { useEffect, useRef, useState } from 'react';
import { Trophy, Check, Gift, RotateCw, ArrowRight, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { safeStoreReturn } from '@/lib/human-challenge';
import { MAX_SPINS, PROMOTION_KEY, SPIN_KEY, STORE_ACCESS_KEY, WHEEL_LABELS, spinOutcome } from '@/lib/promotion';
import promoImage from '@/assets/promocao-roleta.jpg.asset.json';
import { createRouletteAudio } from '@/lib/roulette-audio';
export const promotionImageUrl = new URL(promoImage.url, 'https://screenshot-inspired-screen-maker.lovable.app').href;

export function PromotionExperience({ returnTo }: { returnTo: string }) {
  const [view, setView] = useState<'intro' | 'wheel'>('intro');
  const [completed, setCompleted] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'retry' | 'win' | null>(null);
  const wheel = useRef<SVGSVGElement>(null);
  const animation = useRef<Animation | null>(null);
  const lock = useRef(false);
  const sound = useRef<ReturnType<typeof createRouletteAudio> | null>(null);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    try {
      const saved = Number(sessionStorage.getItem(SPIN_KEY));
      if (saved === 1 || saved === 2) { setCompleted(saved); setView('wheel'); setResult(saved === 2 ? 'win' : 'retry'); }
    } catch { /* storage is optional */ }
    return () => { animation.current?.cancel(); sound.current?.dispose(); sound.current = null; };
  }, []);
  function enterStore() {
    try { sessionStorage.setItem(STORE_ACCESS_KEY, '1'); sessionStorage.setItem(PROMOTION_KEY, '75'); } catch { /* continue */ }
    window.location.replace(safeStoreReturn(returnTo));
  }
  async function spin() {
    if (lock.current) return;
    const outcome = spinOutcome(completed);
    const element = wheel.current;
    if (!outcome || !element) return;
    lock.current = true; setBusy(true); setResult(null);
    const from = completed === 0 ? 0 : 1777.5;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 150 : 4800;
    if (!sound.current) sound.current = createRouletteAudio();
    sound.current.setMuted(muted); sound.current.start(duration);
    animation.current = element.animate([{ transform: `rotate(${from}deg)` }, { transform: `rotate(${outcome.rotation}deg)` }], { duration, easing: 'cubic-bezier(.12,.72,.12,1)', fill: 'forwards' });
    try { await animation.current.finished; } catch { return; }
    try { sessionStorage.setItem(SPIN_KEY, String(outcome.attempt)); } catch { /* continue */ }
    sound.current?.finish(outcome.discount === 75);
    setCompleted(outcome.attempt); setResult(outcome.discount === 75 ? 'win' : 'retry'); setBusy(false); lock.current = false;
  }
  return <div className="mega-store promotion-page">
    <header className="promotion-header"><img src="/img/mega-capacetes-logo.webp" alt="Mega Capacetes" width="48" height="48" /><div><strong>MEGA CAPACETES</strong><span>BLACK FRIDAY 2026</span></div><ShieldCheck aria-label="Promoção da loja" /></header>
    {view === 'intro' ? <main className="promotion-intro">
      <div className="promotion-trophy"><Trophy size={52} /></div><h1>Parabéns!</h1><span className="promotion-approved"><Check size={20} /> Acesso à promoção liberado</span>
      <p>Você está na <strong>Black Friday da Mega Capacetes!</strong> Sua próxima aventura começa com o capacete certo.</p>
      <p>Você tem <strong>2 tentativas na Roleta de Ofertas</strong> para liberar o acesso aos capacetes com <strong>75% de desconto já incluído.</strong></p>
      <figure><img src={promotionImageUrl} alt="Capacetes NoRisk Razor Black Edition e LS2 Speed Race Italia da Mega Capacetes com a roleta de ofertas" width={1145} height={768} fetchPriority="high" /><figcaption>Seu próximo capacete está aqui.</figcaption></figure>
      <Button className="promotion-cta" onClick={() => setView('wheel')}><Gift /> GIRAR A ROLETA AGORA <ArrowRight /></Button>
      <p className="promotion-fine">Promoção garantida em duas tentativas, não é um sorteio. Os preços da loja já incluem os 75%; não há desconto adicional.</p>
    </main> : <main className="promotion-wheel-page"><span className="promotion-eyebrow">BLACK FRIDAY 2026</span><h1>Roleta de Ofertas<br /><span>Mega Capacetes</span></h1><p className="promotion-attempt">{busy ? 'Girando…' : completed === 2 ? 'Oferta liberada!' : `Tentativa ${completed + 1} de ${MAX_SPINS}`}</p>
      <Button variant="ghost" size="icon" className="mx-auto mb-3" aria-label={muted ? 'Ativar som da roleta' : 'Silenciar roleta'} title={muted ? 'Ativar som da roleta' : 'Silenciar roleta'} aria-pressed={!muted} onClick={() => { const next = !muted; setMuted(next); sound.current?.setMuted(next); }}>{muted ? <VolumeX /> : <Volume2 />}</Button>
      <div className="promotion-wheel-frame"><div className="promotion-pointer" aria-hidden="true" /><svg ref={wheel} className="promotion-wheel" viewBox="0 0 400 400" role="img" aria-label="Roleta de ofertas">
        <circle cx="200" cy="200" r="196" className="wheel-rim" />
        {WHEEL_LABELS.map((label, i) => { const a = (i * 45 - 90) * Math.PI / 180; const b = ((i + 1) * 45 - 90) * Math.PI / 180; return <g key={i}><path className={`wheel-sector sector-${i}`} d={`M200 200 L${200 + 181 * Math.cos(a)} ${200 + 181 * Math.sin(a)} A181 181 0 0 1 ${200 + 181 * Math.cos(b)} ${200 + 181 * Math.sin(b)} Z`} /><g transform={`rotate(${i * 45 + 22.5} 200 200)`}><text x="200" y={label.includes('novamente') ? 67 : 83} textAnchor="middle" className={label.includes('novamente') ? 'wheel-retry-label' : 'wheel-percent-label'}>{label.includes('novamente') ? <><tspan x="200">Tente</tspan><tspan x="200" dy="17">novamente</tspan><tspan x="200" dy="23">↻</tspan></> : label}</text></g></g>; })}
        {Array.from({ length: 32 }, (_, i) => <circle key={i} cx={200 + 189 * Math.cos(i * Math.PI / 16)} cy={200 + 189 * Math.sin(i * Math.PI / 16)} r="2.8" className="wheel-light" />)}
      </svg><Button className="wheel-center" onClick={spin} disabled={busy || completed === 2} aria-label="Girar roleta"><RotateCw size={22} />GIRE</Button></div>
      <Button className="promotion-cta" onClick={completed === 2 ? enterStore : spin} disabled={busy}>{completed === 2 ? 'VER CAPACETES COM 75% OFF' : busy ? 'GIRANDO…' : completed === 1 ? 'GIRAR MAIS UMA VEZ' : 'GIRAR ROLETA'} <ArrowRight /></Button>
      <p className="promotion-fine">Promoção garantida na segunda tentativa, não é sorteio. 75% já incluídos nos preços dos capacetes.</p>
    </main>}
    <footer className="promotion-footer">Mega Capacetes · Black Friday 2026</footer>
    {result && <div className="promotion-overlay"><section className="promotion-result" role="dialog" aria-modal="true" aria-labelledby="promotion-result-title"><div className="promotion-trophy">{result === 'win' ? <Trophy size={48} /> : <RotateCw size={44} />}</div><h2 id="promotion-result-title">{result === 'win' ? 'Parabéns!' : 'Tente novamente'}</h2>{result === 'win' ? <><strong className="promotion-win">75% OFF</strong><p>Oferta liberada em todos os capacetes! O desconto já está incluído nos preços da loja.</p><Button autoFocus className="promotion-cta" onClick={enterStore}>VER OFERTAS NA LOJA <ArrowRight /></Button></> : <><p>Você ainda tem uma tentativa para liberar sua oferta da Black Friday.</p><Button autoFocus className="promotion-cta" onClick={() => { setResult(null); void spin(); }}>GIRAR PELA SEGUNDA VEZ <RotateCw /></Button></>}</section></div>}
  </div>;
}
