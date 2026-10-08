export function StoreVideo() {
  return <iframe src="https://fast.wistia.net/embed/iframe/iztcboxjl7?seo=false&videoFoam=true" title="Mega Capacetes — Assista antes de comprar" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />;
}

const feedbacks = [
  { id: "5mcvetbztk", name: "Vanessa Santos", location: "Recife, PE" },
  { id: "puiosk3nnr", name: "Roberta Soares", location: "Rio de Janeiro, RJ" },
  { id: "2lckgfsvfm", name: "Ana Beatriz Lima", location: "Guarulhos, SP" },
  { id: "emvimpn847", name: "Patrícia Mendes", location: "Curitiba, PR" },
];
export function FeedbackVideos() {
  return <>{feedbacks.map((feedback, i) => <article key={feedback.id}><iframe src={`https://fast.wistia.net/embed/iframe/${feedback.id}?seo=false&videoFoam=true`} title={`Feedback de cliente ${i + 1} — Mega Capacetes`} loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /><h3>{feedback.name}</h3><p>{feedback.location}</p></article>)}</>;
}
export function StoreFaq() {
  return <>{[
    ["É original mesmo? Não é falsificado?", "Sim. Trabalhamos com capacetes originais NoRisk e LS2, com procedência e as características informadas na página de cada modelo."],
    ["Como escolho o tamanho correto?", "Meça a circunferência da cabeça passando a fita cerca de dois dedos acima das sobrancelhas e compare o resultado com a tabela de tamanhos exibida na página do capacete."],
    ["Qual a garantia que tenho ao comprar?", "Capacetes são produtos duráveis e contam com garantia legal de 90 dias para vícios aparentes. Nas compras pela internet, você também pode exercer o direito de arrependimento em até 7 dias após o recebimento."],
    ["O Pix tem desconto?", "Sim! Pagamentos via Pix têm 10% de desconto automático sobre o valor do produto."],
  ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</>;
}