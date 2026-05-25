import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Shield, Download, ArrowLeft } from 'lucide-react';

const Certificate = ({ user }) => {
  const navigate = useNavigate();
  const certRef = useRef();

  const handleDownload = async () => {
    const element = certRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');
    
    // Paisagem A4
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Certificado_LGPD_${user.name.replace(/\s+/g, '_')}.pdf`);
  };

  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={() => navigate('/map')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
          <ArrowLeft size={24} /> Voltar
        </button>
        <button className="duo-button" onClick={handleDownload} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Download size={20} /> Baixar PDF
        </button>
      </div>

      <div style={{ overflow: 'hidden', width: '100%', maxWidth: '900px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <div 
          ref={certRef}
          style={{
            width: '100%',
            aspectRatio: '1.414', // A4 landscape ratio
            backgroundColor: 'white',
            border: '16px solid var(--primary-color)',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ position: 'absolute', top: '40px', left: '40px', opacity: 0.05 }}>
            <Shield size={200} />
          </div>
          <div style={{ position: 'absolute', bottom: '40px', right: '40px', opacity: 0.05 }}>
            <Shield size={200} />
          </div>
          
          <Shield size={80} color="var(--primary-color)" style={{ marginBottom: '24px' }} />
          <h1 style={{ fontSize: '3rem', color: 'var(--text-main)', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '4px' }}>
            Certificado de Conclusão
          </h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--text-light)', marginBottom: '40px' }}>
            Certificamos que
          </p>
          <h2 style={{ fontSize: '2.8rem', color: 'var(--primary-color)', margin: '0 0 16px 0', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px', minWidth: '60%' }}>
            {user.name}
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: '0 0 40px 0' }}>
            Matrícula: {user.matricula}
          </p>
          <p style={{ fontSize: '1.4rem', color: 'var(--text-main)', maxWidth: '85%', lineHeight: '1.6', marginBottom: '40px' }}>
            Concluiu com êxito o Treinamento de Capacitação sobre a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>, demonstrando proficiência nos fundamentos e direitos dos titulares.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', marginTop: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '200px', borderBottom: '2px solid var(--text-main)', marginBottom: '8px' }}></div>
              <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Comitê Gestor da LGPD</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>{today}</span>
              <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Data de Emissão</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
