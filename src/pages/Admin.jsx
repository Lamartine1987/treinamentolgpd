import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCourseContent, saveCourseContent } from '../utils/contentService';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp, BookOpen, Users, Download } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Admin = ({ user }) => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [expandedStage, setExpandedStage] = useState(null);
  
  const [activeTab, setActiveTab] = useState('content');
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push(doc.data());
      });
      // Order by Progress DESC, then XP DESC
      fetchedUsers.sort((a, b) => {
        const aProgress = a.completedModules ? a.completedModules.length : 0;
        const bProgress = b.completedModules ? b.completedModules.length : 0;
        if (bProgress !== aProgress) return bProgress - aProgress;
        const aXp = a.xp || 0;
        const bXp = b.xp || 0;
        return bXp - aXp;
      });
      setUsersList(fetchedUsers);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar usuários.');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Matricula', 'Bolinhas Concluidas', 'XP Total', 'Ofensiva (Dias)', 'Ultimo Acesso'];
    const rows = usersList.map(u => [
      `"${u.name || '-'}"`,
      `"${u.email || '-'}"`,
      `"${u.matricula || '-'}"`,
      (u.completedModules ? Math.max(0, u.completedModules.length - 1) : 0),
      u.xp || 0,
      u.streakCount || 0,
      `"${u.lastLoginDate ? new Date(u.lastLoginDate).toLocaleDateString('pt-BR') : '-'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "progresso_alunos_lgpd.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!user || user.email !== 'lamartine.gomes@ufpe.br') {
      navigate('/map');
      return;
    }

    const loadData = async () => {
      const data = await fetchCourseContent();
      const safeData = data.map(u => ({ ...u, stages: u.stages || [] }));
      setUnits(safeData);
      setLoading(false);
    };
    loadData();
  }, [user, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCourseContent(units);
      alert('Conteúdo atualizado com sucesso para todos os usuários!');
    } catch (err) {
      alert('Erro ao salvar. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  const updateUnit = (uIdx, field, value) => {
    const newUnits = [...units];
    newUnits[uIdx][field] = value;
    setUnits(newUnits);
  };

  const updateQuestion = (uIdx, sIdx, qIdx, field, value) => {
    const newUnits = [...units];
    newUnits[uIdx].stages[sIdx].questions[qIdx][field] = value;
    setUnits(newUnits);
  };

  const updateOption = (uIdx, sIdx, qIdx, optIdx, value) => {
    const newUnits = [...units];
    newUnits[uIdx].stages[sIdx].questions[qIdx].options[optIdx] = value;
    setUnits(newUnits);
  };

  const updateStage = (uIdx, sIdx, field, value) => {
    const newUnits = [...units];
    newUnits[uIdx].stages[sIdx][field] = value;
    setUnits(newUnits);
  };

  const addOption = (uIdx, sIdx, qIdx) => {
    const newUnits = [...units];
    newUnits[uIdx].stages[sIdx].questions[qIdx].options.push('');
    setUnits(newUnits);
  };

  const removeOption = (uIdx, sIdx, qIdx, optIdx) => {
    const newUnits = [...units];
    const targetQ = newUnits[uIdx].stages[sIdx].questions[qIdx];
    if (targetQ.options.length <= 2) {
      alert("A pergunta precisa ter pelo menos 2 alternativas.");
      return;
    }
    
    targetQ.options.splice(optIdx, 1);
    
    // Adjust correctAnswer index if necessary
    if (targetQ.correctAnswer === optIdx) {
      targetQ.correctAnswer = 0;
    } else if (targetQ.correctAnswer > optIdx) {
      targetQ.correctAnswer -= 1;
    }
    
    setUnits(newUnits);
  };

  // Funções de Adicionar / Excluir
  const addUnit = () => {
    const newUnits = [...units];
    newUnits.push({
      id: Date.now(),
      title: `Módulo ${units.length + 1}`,
      objective: '',
      introText: '',
      stages: []
    });
    setUnits(newUnits);
    setExpandedUnit(newUnits.length - 1);
  };

  const deleteUnit = (uIdx) => {
    if (window.confirm("Tem certeza que deseja excluir este Módulo INTEIRO? (Todas as bolinhas dele serão apagadas)")) {
      const newUnits = [...units];
      newUnits.splice(uIdx, 1);
      setUnits(newUnits);
    }
  };

  const addStage = (uIdx) => {
    const newUnits = [...units];
    newUnits[uIdx].stages.push({
      id: Date.now(),
      introText: '',
      questions: []
    });
    setUnits(newUnits);
    setExpandedStage(`${uIdx}-${newUnits[uIdx].stages.length - 1}`);
  };

  const deleteStage = (uIdx, sIdx) => {
    if (window.confirm("Tem certeza que deseja excluir esta bolinha e todas as suas perguntas?")) {
      const newUnits = [...units];
      newUnits[uIdx].stages.splice(sIdx, 1);
      setUnits(newUnits);
    }
  };

  const addQuestion = (uIdx, sIdx) => {
    const newUnits = [...units];
    newUnits[uIdx].stages[sIdx].questions.push({
      type: 'multiple_choice',
      question: '',
      options: ['', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setUnits(newUnits);
  };

  const deleteQuestion = (uIdx, sIdx, qIdx) => {
    if (window.confirm("Excluir esta pergunta?")) {
      const newUnits = [...units];
      newUnits[uIdx].stages[sIdx].questions.splice(qIdx, 1);
      setUnits(newUnits);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Carregando dados do servidor...</div>;

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: '#1cb0f6', padding: '0', color: 'white', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/map')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={28} />
            </button>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Painel Master</h1>
          </div>
          {activeTab === 'content' && (
            <button 
              onClick={handleSave} 
              disabled={saving}
              style={{ backgroundColor: 'white', color: '#1cb0f6', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 0 #0d90ce' }}
            >
              <Save size={20} />
              {saving ? 'Salvando...' : 'Publicar Alterações'}
            </button>
          )}
        </div>
        
        {/* TABS */}
        <div style={{ display: 'flex', padding: '0 24px' }}>
          <button 
            onClick={() => setActiveTab('content')}
            style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'content' ? 'rgba(255,255,255,0.2)' : 'transparent', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', borderBottom: activeTab === 'content' ? '4px solid white' : '4px solid transparent', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', transition: 'background 0.2s' }}
          >
             <BookOpen size={20} /> Editor de Conteúdo
          </button>
          <button 
            onClick={() => { setActiveTab('users'); loadUsers(); }}
            style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'users' ? 'rgba(255,255,255,0.2)' : 'transparent', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', borderBottom: activeTab === 'users' ? '4px solid white' : '4px solid transparent', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', transition: 'background 0.2s' }}
          >
             <Users size={20} /> Progresso dos Alunos
          </button>
        </div>
      </div>

      {activeTab === 'content' && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        <p style={{ color: 'var(--text-light)', marginBottom: '32px', fontSize: '1.1rem' }}>
          Qualquer alteração feita aqui será refletida imediatamente para todos os usuários no aplicativo. Tome cuidado ao excluir perguntas.
        </p>

        {units.map((unit, uIdx) => (
          <div key={uIdx} style={{ backgroundColor: 'white', borderRadius: '16px', border: '2px solid #e5e5e5', marginBottom: '24px', overflow: 'hidden' }}>
            
            {/* Unit Header (Accordion) */}
            <div style={{ display: 'flex' }}>
              <div 
                onClick={() => setExpandedUnit(expandedUnit === uIdx ? null : uIdx)}
                style={{ flex: 1, padding: '24px', backgroundColor: expandedUnit === uIdx ? '#f0f9ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: expandedUnit === uIdx ? '2px solid #e5e5e5' : 'none' }}
              >
                <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>{unit.title || `Novo Módulo ${uIdx + 1}`}</h2>
                {expandedUnit === uIdx ? <ChevronUp size={24} color="#afafaf" /> : <ChevronDown size={24} color="#afafaf" />}
              </div>
              <button onClick={() => deleteUnit(uIdx)} title="Excluir Módulo" style={{ padding: '0 24px', backgroundColor: '#ffdfe0', color: 'var(--danger-color)', border: 'none', borderBottom: expandedUnit === uIdx ? '2px solid #e5e5e5' : 'none', cursor: 'pointer' }}>
                <Trash2 size={24} />
              </button>
            </div>

            {/* Unit Content */}
            {expandedUnit === uIdx && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Título do Módulo na Trilha</label>
                    <input type="text" value={unit.title} onChange={e => updateUnit(uIdx, 'title', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e5e5', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Objetivo (Balão Flutuante)</label>
                    <textarea value={unit.objective} onChange={e => updateUnit(uIdx, 'objective', e.target.value)} rows={2} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e5e5', fontSize: '1rem', resize: 'vertical' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e5e5', paddingBottom: '8px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Estágios (Bolinhas) deste Módulo</h3>
                  <button onClick={() => addStage(uIdx)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#d7ffb8', color: '#58a700', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    <Plus size={20} /> Nova Bolinha
                  </button>
                </div>
                
                {unit.stages.map((stage, sIdx) => {
                  const stageKey = `${uIdx}-${sIdx}`;
                  return (
                    <div key={sIdx} style={{ border: '2px solid #e5e5e5', borderRadius: '12px', marginTop: '16px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex' }}>
                        <div 
                          onClick={() => setExpandedStage(expandedStage === stageKey ? null : stageKey)}
                          style={{ flex: 1, padding: '16px', backgroundColor: '#fafafa', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <strong style={{ color: 'var(--text-main)' }}>Bolinha {sIdx + 1} ({stage.questions?.length || 0} questões)</strong>
                          {expandedStage === stageKey ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        <button onClick={() => deleteStage(uIdx, sIdx)} title="Excluir Bolinha" style={{ padding: '0 16px', backgroundColor: '#ffdfe0', color: 'var(--danger-color)', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {expandedStage === stageKey && (
                        <div style={{ padding: '16px', backgroundColor: 'white' }}>
                          
                          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '2px solid #e5e5e5' }}>
                            <label style={{ fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Texto de Introdução (Opcional - Lida antes de começar as perguntas desta bolinha)</label>
                            <textarea value={stage.introText || ''} onChange={e => updateStage(uIdx, sIdx, 'introText', e.target.value)} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e5e5', fontSize: '1rem', resize: 'vertical' }} placeholder="Deixe em branco para pular direto para a primeira pergunta..." />
                          </div>

                          <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Perguntas:</h4>
                          {(stage.questions || []).map((q, qIdx) => (
                            <div key={qIdx} style={{ padding: '24px', border: '2px dashed #e5e5e5', borderRadius: '12px', marginBottom: '24px', backgroundColor: '#fcfcfc' }}>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Pergunta {qIdx + 1}</h4>
                                <button onClick={() => deleteQuestion(uIdx, sIdx, qIdx)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffdfe0', padding: '8px 16px', borderRadius: '8px', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontWeight: 'bold' }}>
                                  <Trash2 size={20} /> Excluir Pergunta
                                </button>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                  <label style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Texto da Pergunta</label>
                                  <textarea value={q.question} onChange={e => updateQuestion(uIdx, sIdx, qIdx, 'question', e.target.value)} rows={4} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e5e5e5', fontSize: '1.1rem', resize: 'vertical' }} placeholder="Digite a pergunta aqui..." />
                                </div>
                                
                                <div>
                                  <label style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Tipo da Pergunta</label>
                                  <select 
                                    value={q.type} 
                                    onChange={e => {
                                      const newType = e.target.value;
                                      const newUnits = [...units];
                                      const qTarget = newUnits[uIdx].stages[sIdx].questions[qIdx];
                                      qTarget.type = newType;
                                      if (newType === 'true_false') {
                                        qTarget.options = ['Verdadeiro', 'Falso'];
                                        if (qTarget.correctAnswer > 1) qTarget.correctAnswer = 0;
                                      } else if (qTarget.options.length < 3) {
                                        qTarget.options = ['', '', ''];
                                      }
                                      setUnits(newUnits);
                                    }} 
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e5e5e5', fontSize: '1.1rem', cursor: 'pointer', backgroundColor: 'white' }}
                                  >
                                    <option value="multiple_choice">Múltipla Escolha</option>
                                    <option value="true_false">Verdadeiro/Falso</option>
                                    <option value="fill_blank">Preencher Lacuna</option>
                                  </select>
                                </div>
                              </div>

                              {(!q.type || q.type === 'multiple_choice') && (
                                <div style={{ marginBottom: '24px' }}>
                                  <label style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '12px' }}>Alternativas (Selecione a correta no botão circular)</label>
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                      <input 
                                        type="radio" 
                                        name={`correct-${uIdx}-${sIdx}-${qIdx}`} 
                                        checked={q.correctAnswer === optIdx}
                                        onChange={() => updateQuestion(uIdx, sIdx, qIdx, 'correctAnswer', optIdx)}
                                        style={{ width: '24px', height: '24px', accentColor: '#58cc02', cursor: 'pointer', margin: 0 }}
                                      />
                                      <input 
                                        type="text" 
                                        value={opt} 
                                        onChange={e => updateOption(uIdx, sIdx, qIdx, optIdx, e.target.value)}
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `2px solid ${q.correctAnswer === optIdx ? '#58cc02' : '#e5e5e5'}`, fontSize: '1.05rem', margin: 0 }} 
                                        placeholder={`Alternativa ${optIdx + 1}`}
                                      />
                                      {q.options.length > 2 && (
                                        <button 
                                          onClick={() => removeOption(uIdx, sIdx, qIdx, optIdx)} 
                                          title="Remover Alternativa"
                                          style={{ background: '#ffdfe0', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', display: 'flex', padding: '12px', borderRadius: '8px', marginLeft: '8px' }}
                                        >
                                          <Trash2 size={20} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => addOption(uIdx, sIdx, qIdx)} 
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f0f9ff', color: '#1cb0f6', border: '2px dashed #1cb0f6', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
                                  >
                                    <Plus size={20} /> Adicionar Alternativa
                                  </button>
                                </div>
                              )}

                              {q.type === 'true_false' && (
                                <div style={{ backgroundColor: '#f0f9ff', padding: '24px', borderRadius: '12px', border: '2px solid #1cb0f6', marginBottom: '24px' }}>
                                  <label style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1899d6', display: 'block', marginBottom: '16px' }}>Qual é a resposta correta?</label>
                                  <div style={{ display: 'flex', gap: '16px' }}>
                                    <button onClick={() => updateQuestion(uIdx, sIdx, qIdx, 'correctAnswer', 0)} style={{ flex: 1, padding: '16px', borderRadius: '8px', border: `2px solid ${q.correctAnswer === 0 ? '#58cc02' : '#e5e5e5'}`, backgroundColor: q.correctAnswer === 0 ? '#d7ffb8' : 'white', color: q.correctAnswer === 0 ? '#58a700' : 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>
                                      Verdadeiro
                                    </button>
                                    <button onClick={() => updateQuestion(uIdx, sIdx, qIdx, 'correctAnswer', 1)} style={{ flex: 1, padding: '16px', borderRadius: '8px', border: `2px solid ${q.correctAnswer === 1 ? '#58cc02' : '#e5e5e5'}`, backgroundColor: q.correctAnswer === 1 ? '#d7ffb8' : 'white', color: q.correctAnswer === 1 ? '#58a700' : 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>
                                      Falso
                                    </button>
                                  </div>
                                </div>
                              )}

                              {q.type === 'fill_blank' && (
                                <div style={{ backgroundColor: '#fff3e0', padding: '24px', borderRadius: '12px', border: '2px solid #ff9600', marginBottom: '24px' }}>
                                  <div style={{ color: '#d98000', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    💡 Dica: Para criar a lacuna no texto da pergunta, digite 9 underlines seguidos: _________
                                  </div>
                                  <label style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '12px' }}>Palavras para o aluno escolher (Selecione a correta)</label>
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                      <input 
                                        type="radio" 
                                        name={`correct-${uIdx}-${sIdx}-${qIdx}`} 
                                        checked={q.correctAnswer === optIdx}
                                        onChange={() => updateQuestion(uIdx, sIdx, qIdx, 'correctAnswer', optIdx)}
                                        style={{ width: '24px', height: '24px', accentColor: '#ff9600', cursor: 'pointer', margin: 0 }}
                                      />
                                      <input 
                                        type="text" 
                                        value={opt} 
                                        onChange={e => updateOption(uIdx, sIdx, qIdx, optIdx, e.target.value)}
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `2px solid ${q.correctAnswer === optIdx ? '#ff9600' : '#e5e5e5'}`, fontSize: '1.05rem', margin: 0 }} 
                                        placeholder={`Opção ${optIdx + 1}`}
                                      />
                                      {q.options.length > 2 && (
                                        <button 
                                          onClick={() => removeOption(uIdx, sIdx, qIdx, optIdx)} 
                                          title="Remover Opção"
                                          style={{ background: '#ffdfe0', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', display: 'flex', padding: '12px', borderRadius: '8px', marginLeft: '8px' }}
                                        >
                                          <Trash2 size={20} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => addOption(uIdx, sIdx, qIdx)} 
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'rgba(255, 150, 0, 0.1)', color: '#d98000', border: '2px dashed #ff9600', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
                                  >
                                    <Plus size={20} /> Adicionar Opção
                                  </button>
                                </div>
                              )}

                              <div>
                                <label style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Feedback (Aparece se o aluno errar/acertar)</label>
                                <textarea value={q.explanation} onChange={e => updateQuestion(uIdx, sIdx, qIdx, 'explanation', e.target.value)} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', resize: 'vertical' }} />
                              </div>

                            </div>
                          ))}

                          <button onClick={() => addQuestion(uIdx, sIdx)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', width: '100%', justifyContent: 'center', backgroundColor: '#f0f9ff', color: '#1cb0f6', border: '2px dashed #1cb0f6', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            <Plus size={20} /> Adicionar Nova Pergunta
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>
            )}
          </div>
        ))}

        <button onClick={addUnit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '24px', backgroundColor: 'white', border: '2px dashed #afafaf', borderRadius: '16px', color: '#afafaf', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#1cb0f6'; e.currentTarget.style.color = '#1cb0f6'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#afafaf'; e.currentTarget.style.color = '#afafaf'; }}>
          <Plus size={28} />
          Adicionar Novo Módulo
        </button>

        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Ranking e Engajamento</h2>
            <button onClick={exportCSV} style={{ backgroundColor: 'white', border: '2px solid #e5e5e5', color: 'var(--text-main)', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 0 #e5e5e5' }}>
              <Download size={20} /> Exportar para Excel (.csv)
            </button>
          </div>

          {loadingUsers ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-light)', fontWeight: 'bold', fontSize: '1.2rem' }}>Buscando dados dos alunos no servidor...</div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '2px solid #e5e5e5', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f0f9ff', color: '#1899d6' }}>
                  <tr>
                    <th style={{ padding: '20px 16px', borderBottom: '2px solid #e5e5e5', fontSize: '1.1rem' }}>Nome</th>
                    <th style={{ padding: '20px 16px', borderBottom: '2px solid #e5e5e5', fontSize: '1.1rem' }}>E-mail</th>
                    <th style={{ padding: '20px 16px', borderBottom: '2px solid #e5e5e5', fontSize: '1.1rem' }}>Matrícula</th>
                    <th style={{ padding: '20px 16px', borderBottom: '2px solid #e5e5e5', fontSize: '1.1rem' }}>Progresso Geral</th>
                    <th style={{ padding: '20px 16px', borderBottom: '2px solid #e5e5e5', textAlign: 'center', fontSize: '1.1rem' }}>XP Total</th>
                    <th style={{ padding: '20px 16px', borderBottom: '2px solid #e5e5e5', textAlign: 'center', fontSize: '1.1rem' }}>Ofensiva</th>
                    <th style={{ padding: '20px 16px', borderBottom: '2px solid #e5e5e5', textAlign: 'center', fontSize: '1.1rem' }}>Último Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)', fontSize: '1.1rem' }}>Nenhum aluno encontado.</td></tr>
                  ) : (
                    usersList.map((u, i) => {
                      const totalStagesCount = units.reduce((acc, unit) => acc + (unit.stages ? unit.stages.length : 0), 0);
                      const completedCount = u.completedModules ? Math.max(0, u.completedModules.length - 1) : 0;
                      const progressPercent = totalStagesCount > 0 ? Math.round((completedCount / totalStagesCount) * 100) : 0;

                      return (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e5e5', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{u.name || '-'}</td>
                        <td style={{ padding: '16px', color: 'var(--text-light)' }}>{u.email}</td>
                        <td style={{ padding: '16px', color: 'var(--text-light)' }}>{u.matricula || '-'}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, height: '14px', backgroundColor: '#e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#58cc02', borderRadius: '8px' }} />
                            </div>
                            <span style={{ fontWeight: 'bold', color: '#58cc02', minWidth: '45px', textAlign: 'right', fontSize: '1.1rem' }}>{progressPercent}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#ffc800', fontSize: '1.2rem' }}>{u.xp || 0}</td>
                        <td style={{ padding: '16px', textAlign: 'center', color: 'var(--text-main)', fontWeight: 'bold' }}>{u.streakCount || 0} <span style={{ fontWeight: 'normal', color: 'var(--text-light)' }}>dias</span></td>
                        <td style={{ padding: '16px', textAlign: 'center', color: 'var(--text-main)' }}>{u.lastLoginDate ? new Date(u.lastLoginDate).toLocaleDateString('pt-BR') : '-'}</td>
                      </tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
