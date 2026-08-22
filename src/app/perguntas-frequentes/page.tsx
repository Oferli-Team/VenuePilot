import { createWhatsappLink } from "@/lib/whatsapp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/ui/section";
import { faqItems } from "./items";
import { ITOP } from "@/lib/constants";

export default function FAQPage() {
  const support = createWhatsappLink({
    phone: ITOP.whatsapp_suporte,
    text: "Olá, gostaria de tirar uma dúvida sobre a plataforma ITOP",
  });

  return (
    <Section className="mt-24 flex flex-col items-center gap-12 pb-6">
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <h1 className="font-bold">Perguntas Frequentes</h1>
        <h2>
          Tire suas dúvidas sobre inscrições, pagamentos, eventos e outros!
        </h2>
        <h3 className="text-sm">
          Não encontrou o precisa?{" "}
          <a href={support} target="_blank" className=" underline">
            Fale com nosso time.
          </a>
        </h3>
      </div>

      <Accordion type="multiple" className="w-full sm:w-[80%]">
        {faqItems.map((item, i) => (
          <AccordionItem
            border={false}
            icon
            value={`item - ${i + 1}`}
            key={`item - ${i + 1}`}
          >
            <AccordionTrigger icon={item.icon} className="sm:text-base">
              <div dangerouslySetInnerHTML={{ __html: item.question }} />
            </AccordionTrigger>
            <AccordionContent className="sm:text-base">
              <div dangerouslySetInnerHTML={{ __html: item.answer }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
