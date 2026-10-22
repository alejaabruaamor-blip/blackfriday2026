import { useRef, useState } from "react";

export function StoreVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const start = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    setPlaying(true);
    void v.play().catch(() => setPlaying(false));
  };
  return (
    <div className="vsl-wrap">
      <video ref={ref} src="/videos/vsl.mp4" poster="/img/vsl-capa.webp" controls={playing} playsInline preload="none" onPlay={() => setPlaying(true)} title="Mega Capacetes — Assista antes de comprar" />
      {!playing && (
        <button type="button" className="vsl-play" onClick={start} aria-label="Assistir ao vídeo">
          <span className="vsl-play-icon" aria-hidden="true" />
          <span>ASSISTIR AGORA</span>
        </button>
      )}
    </div>
  );
}

const feedbacks = [
  { id: "5mcvetbztk", name: "Vanessa Santos", location: "Recife, PE" },
  { id: "puiosk3nnr", name: "Roberta Soares", location: "Rio de Janeiro, RJ" },
  { id: "2lckgfsvfm", name: "Ana Beatriz Lima", location: "Guarulhos, SP" },
  { id: "emvimpn847", name: "Patr\u00edcia Mendes", location: "Curitiba, PR" },
];
export function FeedbackVideos() {
  return <>{feedbacks.map((feedback, i) => <article key={feedback.id}><iframe src={`https://fast.wistia.net/embed/iframe/${feedback.id}?seo=false&videoFoam=true`} title={`Feedback de cliente ${i + 1} \u2014 Mega Capacetes`} loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /><h3>{feedback.name}</h3><p>{feedback.location}</p></article>)}</>;
}
export function StoreFaq() {
  return <>{[
    ["\u00c9 original mesmo? N\u00e3o \u00e9 falsificado?", "Sim. Trabalhamos com capacetes originais NoRisk e LS2, com proced\u00eancia e as caracter\u00edsticas informadas na p\u00e1gina de cada modelo."],
    ["Como escolho o tamanho correto?", "Me\u00e7a a circunfer\u00eancia da cabe\u00e7a passando a fita cerca de dois dedos acima das sobrancelhas e compare o resultado com a tabela de tamanhos exibida na p\u00e1gina do capacete."],
    ["Qual a garantia que tenho ao comprar?", "Capacetes s\u00e3o produtos dur\u00e1veis e contam com garantia legal de 90 dias para v\u00edcios aparentes. Nas compras pela internet, voc\u00ea tamb\u00e9m pode exercer o direito de arrependimento em at\u00e9 7 dias ap\u00f3s o recebimento."],
    ["O Pix tem desconto?", "Sim! Pagamentos via Pix t\u00eam 10% de desconto autom\u00e1tico sobre o valor do produto."],
  ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</>;
}
