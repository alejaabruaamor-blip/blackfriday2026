import { useEffect, useRef, useState } from 'react';
import { Trophy, Check, Gift, RotateCw, ArrowRight, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MAX_SPINS, PROMOTION_KEY, SPIN_KEY, STORE_ACCESS_KEY, WHEEL_LABELS, spinOutcome } from '@/lib/promotion';
import promoImage from '@/assets/promocao-roleta.jpg.asset.json';
import { createRouletteAudio } from '@/lib/roulette-audio';
export const promotionImageUrl = new URL(promoImage.url, 'https://screenshot-inspired-screen-maker.lovable.app').href;

const FIT_CSS = `.promotion-page { position: fixed; inset: 0; height: 100dvh; display: flex; flex-direction: column; overflow: hidden; overscroll-behavior: none; touch-action: manipulation; } .promotion-header { height: clamp(52px, 8dvh, 72px); flex-shrink: 0; padding-block: 6px; } .promotion-header img { width: clamp(34px, 5.5dvh, 48px); height: auto; } .promotion-intro, .promotion-wheel-page { flex: 1; min-height: 0; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: stretch; padding: clamp(8px, 2dvh, 24px) 18px; overflow: hidden; } .promotion-intro .promotion-trophy { width: clamp(44px, 8dvh, 84px); height: clamp(44px, 8dvh, 84px); margin: 0 auto clamp(4px, 1.2dvh, 14px); flex-shrink: 0; } .promotion-intro .promotion-trophy svg { width: 55%; height: 55%; } .promotion-intro h1 { font-size: clamp(24px, 4.2dvh, 36px); margin: 0 0 clamp(4px, 1dvh, 12px); line-height: 1.1; } .promotion-approved { align-self: center; padding: clamp(5px, 1dvh, 10px) 16px; font-size: clamp(12px, 1.8dvh, 15px); margin-bottom: clamp(6px, 1.5dvh, 18px); } .promotion-intro > p:not(.promotion-fine) { font-size: clamp(13px, 2dvh, 17px); line-height: 1.4; margin: 0 0 clamp(6px, 1.4dvh, 16px); } .promotion-intro figure { margin: 0 0 clamp(8px, 1.6dvh, 18px); flex: 0 1 auto; min-height: 0; } .promotion-intro figure img { max-height: 24dvh; aspect-ratio: auto; } .promotion-intro figcaption { padding: 5px; } .mega-store .promotion-cta { min-height: clamp(46px, 7dvh, 58px); padding-block: 10px; flex-shrink: 0; } .promotion-fine { font-size: clamp(9px, 1.4dvh, 11px); line-height: 1.35; margin-top: clamp(6px, 1.2dvh, 14px); } .promotion-footer { padding: 6px 12px; font-size: 11px; flex-shrink: 0; } .promotion-wheel-page h1 { font-size: clamp(20px, 3.6dvh, 28px); margin: 4px 0; line-height: 1.15; } .promotion-attempt { font-size: clamp(13px, 2dvh, 16px); min-height: 0; margin: 0; } .promotion-wheel-page > .mx-auto { margin-bottom: 0; flex-shrink: 0; } .promotion-wheel-frame { width: min(400px, 100%, 46dvh); margin: clamp(6px, 1.5dvh, 20px) auto; flex-shrink: 0; } .promotion-wheel { will-change: transform; backface-visibility: hidden; } @media (max-height: 640px) { .promotion-intro figcaption, .promotion-footer { display: none; } .promotion-intro figure img { max-height: 20dvh; } .promotion-wheel-frame { width: min(400px, 100%, 42dvh); } }`;

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
    window.location.replace('/');
  }
  async function spin() {
    if (lock.current) return;
    const outcome = spinOutcome(completed);
    const element = wheel.current;
    if (!outcome || !element) return;
    lock.current = true; setBusy(true); setResult(null);
    const from = completed === 0 ? 0 : 1777.5;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 150 : 2600;
    if (!sound.current) sound.current = createRouletteAudio();
    sound.current.setMuted(muted); sound.current.start(duration);
    animation.current = element.animate([{ transform: `rotate(${from}deg)` }, { transform: `rotate(${outcome.rotation}deg)` }], { duration, easing: 'cubic-bezier(.15,.8,.2,1)', fill: 'forwards' });
    try { await animation.current.finished; } catch { return; }
    try { sessionStorage.setItem(SPIN_KEY, String(outcome.attempt)); } catch { /* continue */ }
    sound.current?.finish(outcome.discount === 75);
    setCompleted(outcome.attempt); setResult(outcome.discount === 75 ? 'win' : 'retry'); setBusy(false); lock.current = false;
  }
  return <div className="mega-store promotion-page"><style>{FIT_CSS}</style>
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
