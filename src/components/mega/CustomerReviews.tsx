import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const reviews = [
  { name: "Bruno Batista", text: "As cores do NoRisk Darth II Preto Fosco são ainda mais bonitas pessoalmente. Recebi sem riscos e com todas as peças bem ajustadas." },
  { name: "Larissa Cardoso", text: "Usei o NoRisk Darth II Preto Fosco no mesmo dia da entrega. Achei leve, bem ventilado e com encaixe seguro na cabeça." },
  { name: "Rafael Albuquerque", text: "O NoRisk Darth II Preto Fosco chegou bem protegido e o acabamento me surpreendeu. O tamanho escolhido ficou firme e confortável." },
  { name: "Camila Peixoto", text: "Gostei muito do NoRisk Darth II Preto Fosco. A viseira oferece boa visão e a forração não incomodou mesmo depois de um trajeto longo." },
];
export function CustomerReviews() {
  const [active, setActive] = useState(0);
  return <section className="store-reviews store-feedback-section"><div className="store-container"><span className="section-eyebrow">AVALIAÇÕES DE CLIENTES</span><h2>O que nossos clientes dizem</h2><div className="review-stage">{reviews.map((review, index) => {
    const offset = (index - active + reviews.length) % reviews.length;
    const position = offset === 0 ? "review-front" : offset === 1 ? "review-right" : offset === reviews.length - 1 ? "review-left" : "review-back";
    return <article className={`review-card ${position}`} key={review.name} aria-hidden={index !== active}><blockquote>“{review.text}”</blockquote><p><span className="review-avatar">{review.name.split(" ").map(word => word[0]).join("")}</span>{review.name}</p></article>;
  })}</div><div className="review-controls"><Button variant="outline" size="icon" aria-label="Avaliação anterior" onClick={() => setActive(current => (current + reviews.length - 1) % reviews.length)}><ChevronLeft /></Button><div className="review-dots">{reviews.map((review, index) => <Button key={review.name} variant="ghost" size="icon" aria-label={`Ver avaliação de ${review.name}`} aria-pressed={active === index} onClick={() => setActive(index)} className={active === index ? "review-dot is-active" : "review-dot"}><span /></Button>)}</div><Button variant="outline" size="icon" aria-label="Próxima avaliação" onClick={() => setActive(current => (current + 1) % reviews.length)}><ChevronRight /></Button></div></div></section>;
}