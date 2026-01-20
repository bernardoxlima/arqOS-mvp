import React, { useState } from 'react';
import { ServiceId, processSteps } from '@/data/companyData';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ScheduleGeneratorProps {
  serviceId: ServiceId;
}

interface TimelineItem {
  date: Date;
  dateFormatted: string;
  weekday: string;
  title: string;
  desc: string;
  milestone?: boolean;
}

const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({ serviceId }) => {
  const [clientName, setClientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [modality, setModality] = useState<'online' | 'presencial'>('online');
  const [environments, setEnvironments] = useState('1');
  const [timeline, setTimeline] = useState<TimelineItem[] | null>(null);
  const [showClientView, setShowClientView] = useState(false);

  const weekdays = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const addBusinessDays = (date: Date, days: number): Date => {
    let result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) added++;
    }
    return result;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const generateTimeline = () => {
    if (!startDate) {
      alert('Por favor, selecione uma data de início.');
      return;
    }

    const start = new Date(startDate);
    const items: TimelineItem[] = [];

    // Configuração baseada no serviço
    if (serviceId === 'consultexpress') {
      const questionario = addBusinessDays(start, 2);
      const reuniao = addDays(questionario, 7);
      const entregaFinal = addDays(reuniao, 7);

      items.push(
        { date: start, dateFormatted: formatDate(start), weekday: weekdays[start.getDay()], title: 'INÍCIO DA CONSULTORIA', desc: 'Pagamento confirmado', milestone: true },
        { date: questionario, dateFormatted: formatDate(questionario), weekday: weekdays[questionario.getDay()], title: 'PRAZO: QUESTIONÁRIO PRÉ-BRIEFING', desc: 'Envio do formulário preenchido' },
        { date: reuniao, dateFormatted: formatDate(reuniao), weekday: weekdays[reuniao.getDay()], title: 'REUNIÃO DE CONSULTORIA', desc: modality === 'presencial' ? 'Presencial' : 'Online', milestone: true },
        { date: entregaFinal, dateFormatted: formatDate(entregaFinal), weekday: weekdays[entregaFinal.getDay()], title: 'ENTREGA DO MATERIAL', desc: 'Material adicional (se contratado)', milestone: true }
      );
    } else if (serviceId === 'produzexpress') {
      const questionario = addBusinessDays(start, 2);
      const briefing = addDays(questionario, 5);
      const diasProducao = parseInt(environments) >= 3 ? 15 : 10;
      const producao = addDays(briefing, diasProducao);

      items.push(
        { date: start, dateFormatted: formatDate(start), weekday: weekdays[start.getDay()], title: 'INÍCIO DO SERVIÇO', desc: 'Pagamento confirmado', milestone: true },
        { date: questionario, dateFormatted: formatDate(questionario), weekday: weekdays[questionario.getDay()], title: 'PRAZO: QUESTIONÁRIO PRÉ-BRIEFING', desc: 'Envio do formulário preenchido' },
        { date: briefing, dateFormatted: formatDate(briefing), weekday: weekdays[briefing.getDay()], title: 'REUNIÃO DE BRIEFING', desc: 'Alinhamento do que será feito', milestone: true },
        { date: producao, dateFormatted: formatDate(producao), weekday: weekdays[producao.getDay()], title: 'DIA DE PRODUÇÃO', desc: 'Ambiente finalizado!', milestone: true }
      );
    } else if (serviceId === 'decorexpress') {
      const questionario = addBusinessDays(start, 2);
      const medicao = modality === 'presencial' ? addDays(questionario, 5) : addBusinessDays(questionario, 3);
      const briefing = addDays(medicao, 3);
      const projeto3d = addBusinessDays(briefing, modality === 'presencial' ? 21 : 15);
      const apresentacao = addDays(projeto3d, 2);
      const ajustes = addBusinessDays(apresentacao, 5);
      const entregaFinal = addDays(ajustes, 2);

      items.push(
        { date: start, dateFormatted: formatDate(start), weekday: weekdays[start.getDay()], title: 'INÍCIO DO PROJETO', desc: 'Pagamento confirmado', milestone: true },
        { date: questionario, dateFormatted: formatDate(questionario), weekday: weekdays[questionario.getDay()], title: 'PRAZO: QUESTIONÁRIO PRÉ-BRIEFING', desc: 'Envio do formulário preenchido' },
        { date: medicao, dateFormatted: formatDate(medicao), weekday: weekdays[medicao.getDay()], title: modality === 'presencial' ? 'VISITA TÉCNICA + MEDIÇÃO' : 'PRAZO: ENVIO DAS MEDIDAS', desc: modality === 'presencial' ? 'Presencial no local' : 'Cliente envia medidas', milestone: modality === 'presencial' },
        { date: briefing, dateFormatted: formatDate(briefing), weekday: weekdays[briefing.getDay()], title: 'REUNIÃO DE BRIEFING', desc: 'Alinhamento de expectativas', milestone: true },
        { date: projeto3d, dateFormatted: formatDate(projeto3d), weekday: weekdays[projeto3d.getDay()], title: 'PROJETO 3D PRONTO', desc: 'Desenvolvimento concluído', milestone: true },
        { date: apresentacao, dateFormatted: formatDate(apresentacao), weekday: weekdays[apresentacao.getDay()], title: 'REUNIÃO DE APRESENTAÇÃO', desc: 'Apresentação do projeto 3D' },
        { date: ajustes, dateFormatted: formatDate(ajustes), weekday: weekdays[ajustes.getDay()], title: 'PRAZO: AJUSTES', desc: 'Até 2 rodadas inclusos' },
        { date: entregaFinal, dateFormatted: formatDate(entregaFinal), weekday: weekdays[entregaFinal.getDay()], title: 'ENTREGA FINAL', desc: 'Projeto + Manual + Lista de Compras', milestone: true }
      );
    } else if (serviceId === 'projetexpress') {
      const questionario = addBusinessDays(start, 2);
      const medicao = addDays(questionario, 5);
      const briefing = addDays(medicao, 3);
      const projeto3d = addBusinessDays(briefing, 28);
      const apresentacao3d = addDays(projeto3d, 2);
      const executivo = addBusinessDays(apresentacao3d, 25);
      const entregaExecutivo = addDays(executivo, 2);
      const entregaFinal = addDays(entregaExecutivo, 5);

      items.push(
        { date: start, dateFormatted: formatDate(start), weekday: weekdays[start.getDay()], title: 'INÍCIO DO PROJETO', desc: 'Pagamento confirmado', milestone: true },
        { date: questionario, dateFormatted: formatDate(questionario), weekday: weekdays[questionario.getDay()], title: 'PRAZO: QUESTIONÁRIO PRÉ-BRIEFING', desc: 'Envio do formulário preenchido' },
        { date: medicao, dateFormatted: formatDate(medicao), weekday: weekdays[medicao.getDay()], title: 'VISITA TÉCNICA + MEDIÇÃO', desc: 'Presencial no local', milestone: true },
        { date: briefing, dateFormatted: formatDate(briefing), weekday: weekdays[briefing.getDay()], title: 'REUNIÃO DE BRIEFING', desc: 'Alinhamento completo', milestone: true },
        { date: projeto3d, dateFormatted: formatDate(projeto3d), weekday: weekdays[projeto3d.getDay()], title: 'PROJETO 3D PRONTO', desc: 'Desenvolvimento concluído', milestone: true },
        { date: apresentacao3d, dateFormatted: formatDate(apresentacao3d), weekday: weekdays[apresentacao3d.getDay()], title: 'REUNIÃO DE APRESENTAÇÃO 3D', desc: 'Apresentação e aprovação' },
        { date: executivo, dateFormatted: formatDate(executivo), weekday: weekdays[executivo.getDay()], title: 'PROJETO EXECUTIVO PRONTO', desc: 'Todos os técnicos finalizados', milestone: true },
        { date: entregaExecutivo, dateFormatted: formatDate(entregaExecutivo), weekday: weekdays[entregaExecutivo.getDay()], title: 'REUNIÃO DE ENTREGA EXECUTIVO', desc: 'Orientações para obra' },
        { date: entregaFinal, dateFormatted: formatDate(entregaFinal), weekday: weekdays[entregaFinal.getDay()], title: 'ENTREGA FINAL COMPLETA', desc: '3D + Executivo + Manual + ART', milestone: true }
      );
    }

    setTimeline(items);
  };

  const exportPDF = () => {
    if (!timeline) return;

    const doc = new jsPDF();
    const serviceName = serviceId.toUpperCase().replace('EXPRESS', ' EXPRESS');
    
    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('ARQEXPRESS', 20, 20);
    doc.setFontSize(10);
    doc.text(serviceName, 180, 20, { align: 'right' });

    // Título
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('CRONOGRAMA DE ENTREGAS', 105, 50, { align: 'center' });
    doc.setFontSize(16);
    doc.text(clientName || 'CLIENTE', 105, 60, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`${environments} ambiente${parseInt(environments) > 1 ? 's' : ''} • ${modality.toUpperCase()}`, 105, 68, { align: 'center' });

    // Timeline
    let yPos = 85;
    timeline.forEach((item, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      if (item.milestone) {
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos - 5, 180, 18, 'F');
      }

      doc.setFontSize(12);
      doc.text(item.dateFormatted, 20, yPos);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(item.weekday, 20, yPos + 5);
      
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.text(item.title, 50, yPos);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(item.desc, 50, yPos + 5);
      doc.setTextColor(0);

      yPos += 20;
    });

    // Footer
    const totalDays = timeline.length > 0 
      ? Math.ceil((timeline[timeline.length - 1].date.getTime() - timeline[0].date.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    doc.setFillColor(0, 0, 0);
    doc.rect(0, 270, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`DURAÇÃO TOTAL: ${totalDays} DIAS`, 70, 280, { align: 'center' });
    doc.text(`REUNIÕES: ${serviceId === 'projetexpress' ? '5+' : serviceId === 'decorexpress' ? '3-4' : '1'}`, 140, 280, { align: 'center' });
    doc.setFontSize(10);
    doc.text('ARQUITETURA, SEM COMPLICAR.', 105, 290, { align: 'center' });

    doc.save(`CRONOGRAMA_${serviceName.replace(' ', '_')}_${(clientName || 'CLIENTE').replace(/\s+/g, '_')}.pdf`);
  };

  const totalDays = timeline && timeline.length > 0
    ? Math.ceil((timeline[timeline.length - 1].date.getTime() - timeline[0].date.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">GERAR AGENDA DE ENTREGAS</h3>

      {!showClientView ? (
        <>
          {/* Formulário */}
          <div className="bg-muted/50 rounded-xl p-6 mb-6 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  NOME DO CLIENTE
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  DATA DE INÍCIO (PAGAMENTO)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {(serviceId === 'decorexpress' || serviceId === 'consultexpress') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    MODALIDADE
                  </label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as 'online' | 'presencial')}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="online">Online</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
              )}
              {(serviceId === 'produzexpress' || serviceId === 'decorexpress') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    QUANTIDADE DE AMBIENTES
                  </label>
                  <select
                    value={environments}
                    onChange={(e) => setEnvironments(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="1">1 Ambiente</option>
                    <option value="2">2 Ambientes</option>
                    <option value="3">3+ Ambientes</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={generateTimeline}
              className="w-full py-3 bg-foreground text-background font-semibold uppercase tracking-wider rounded-lg hover:opacity-90 transition-all"
            >
              GERAR AGENDA
            </button>
          </div>

          {/* Resultado */}
          {timeline && (
            <div className="max-w-2xl animate-fade-in">
              <div className="bg-foreground text-background p-6 rounded-t-xl text-center">
                <h3 className="text-xs uppercase tracking-widest opacity-60 mb-2">AGENDA DE ENTREGAS</h3>
                <p className="text-2xl font-bold">{clientName || 'CLIENTE'}</p>
                <p className="text-sm opacity-60">{serviceId.toUpperCase()} • {environments} ambiente{parseInt(environments) > 1 ? 's' : ''}</p>
              </div>

              <div className="border-x border-b border-border rounded-b-xl p-4">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`
                      grid grid-cols-[100px_1fr] gap-4 py-4 border-b border-border last:border-none
                      ${item.milestone ? 'bg-muted/50 -mx-4 px-4' : ''}
                    `}
                  >
                    <div className="text-right">
                      <div className="font-bold">{item.dateFormatted}</div>
                      <div className="text-xs text-muted-foreground uppercase">{item.weekday}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm uppercase">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-foreground text-background p-4 rounded-xl mt-4 grid grid-cols-3 text-center">
                <div>
                  <div className="text-2xl font-bold">{totalDays}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">DIAS TOTAIS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {serviceId === 'projetexpress' ? '5+' : serviceId === 'decorexpress' ? '3-4' : '1-2'}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">REUNIÕES</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{timeline[timeline.length - 1]?.dateFormatted}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">ENTREGA</div>
                </div>
              </div>

              <button
                onClick={exportPDF}
                className="w-full mt-4 py-3 flex items-center justify-center gap-2 bg-foreground text-background font-semibold uppercase tracking-wider rounded-lg hover:opacity-90 transition-all"
              >
                <FileDown className="w-4 h-4" />
                SALVAR PDF
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default ScheduleGenerator;
