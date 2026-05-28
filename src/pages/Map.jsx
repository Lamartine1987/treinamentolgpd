import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCourseContent, computeAllStages } from '../utils/contentService';
import { Star, BookOpen, Shield, ArrowLeft, Zap, Flame, Award, Settings, Check, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import ModernDialog from '../components/ModernDialog';

const Map = ({ user, onUpdateUser }) => {
  const navigate = useNavigate();
  const completedModules = user.completedModules || [0];
  
  const [unitsData, setUnitsData] = useState([]);
  const [allStages, setAllStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [editMatricula, setEditMatricula] = useState(user.matricula || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null, onCancel: null });
  const showAlert = (title, message) => {
    setDialog({ isOpen: true, type: 'alert', title, message, onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false })) });
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const userRef = doc(db, 'users', user.email.toLowerCase());
      await updateDoc(userRef, { name: editName, matricula: editMatricula });
      onUpdateUser({ ...user, name: editName, matricula: editMatricula });
      setShowProfile(false);
      showAlert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      showAlert('Erro', 'Erro ao atualizar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      const data = await fetchCourseContent();
      setUnitsData(data);
      setAllStages(computeAllStages(data));
      setLoading(false);
    };
    loadContent();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lgpd_user');
    window.location.reload();
  };

  const getIconForModule = (index, isUnlocked) => {
    const props = { size: 36, fill: isUnlocked ? "white" : "#afafaf", color: isUnlocked ? "white" : "#afafaf" };
    if (index % 3 === 0) return <Star {...props} />;
    if (index % 3 === 1) return <BookOpen {...props} />;
    return <Shield {...props} />;
  };

  if (loading) {
    return <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', color: '#afafaf', fontWeight: 'bold' }}>Carregando trilha do servidor...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'white', overflowX: 'hidden' }}>
      
      {/* Top Banner */}
      <div style={{ 
        backgroundColor: '#58cc02', 
        padding: '24px 24px 32px 24px', 
        borderRadius: '0 0 24px 24px',
        display: 'flex', 
        flexDirection: 'column',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <ArrowLeft size={24} />
            Sair
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            
            {user.email === 'lamartine.gomes@ufpe.br' && (
              <button 
                onClick={() => navigate('/admin')}
                style={{ backgroundColor: 'white', color: '#1cb0f6', border: 'none', borderRadius: '12px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}
              >
                <Settings size={20} /> Painel Master
              </button>
            )}

            <button 
                onClick={() => setShowProfile(true)}
                style={{ backgroundColor: 'white', color: '#1899d6', border: 'none', borderRadius: '12px', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}
            >
              <User size={20} /> Meu Perfil
            </button>

            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              border: '2px solid rgba(255,255,255,0.4)', 
              borderRadius: '12px', 
              padding: '6px 12px', 
              color: '#ff9600', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '1.1rem'
            }}>
              <Flame size={20} fill="#ff9600" />
              {user.streakCount || 0}
            </div>

            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              border: '2px solid rgba(255,255,255,0.4)', 
              borderRadius: '12px', 
              padding: '6px 12px', 
              color: '#ffc800', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '1.1rem'
            }}>
              <Zap size={20} fill="#ffc800" />
              {user.xp || 0} XP
            </div>
          </div>
        </div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>
            TRILHA DE APRENDIZADO
          </div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.8rem' }}>
            Capacitação LGPD
          </h1>
        </div>
      </div>

      {/* Path */}
      <div style={{ flex: 1, padding: '0 24px 80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '90px' }}>
        
        {unitsData.map((unit, unitIndex) => {
          const unitStages = allStages.filter(s => s.unitId === unit.id);

          return (
            <React.Fragment key={`unit-${unit.id}`}>
              {/* Divider for Unit */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '40px 0 20px 0', width: '100%', maxWidth: '500px' }}>
                <div style={{ flex: 1, height: '2px', backgroundColor: '#e5e5e5' }} />
                <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ color: '#afafaf', fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                    {unit.title}
                  </span>
                </div>
                <div style={{ flex: 1, height: '2px', backgroundColor: '#e5e5e5' }} />
              </div>

              {/* Stages for this Unit */}
              {unitStages.map((stage, stageIndex) => {
                const isUnlocked = completedModules.includes(stage.globalIndex);
                const isActive = stage.globalIndex === Math.max(...completedModules);
                const isCompleted = isUnlocked && stage.globalIndex < Math.max(...completedModules);
                
                return (
                  <div key={stage.id} style={{ position: 'relative', zIndex: isActive ? 999 : 1, display: 'flex', justifyContent: 'center' }}>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: stageIndex * 0.1, type: 'spring', stiffness: 200 }}
                      style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                    <div style={{ 
                      position: 'relative', 
                      transform: stage.globalIndex % 2 !== 0 ? 'translateX(25px)' : 'translateX(-25px)',
                    }}>
                      
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '-12px',
                          right: '-12px',
                          bottom: '-12px',
                          border: '8px solid #e5e5e5',
                          borderRadius: '50%',
                          borderTopColor: '#58cc02', 
                          borderRightColor: '#58cc02',
                          transform: 'rotate(-45deg)',
                          zIndex: 0
                        }} />
                      )}

                      <button
                        onClick={() => isUnlocked && navigate(`/lesson/${stage.globalIndex}`)}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? '#ffc800' : isUnlocked ? '#58cc02' : '#e5e5e5',
                          border: 'none',
                          boxShadow: `0 8px 0 ${isCompleted ? '#dcae00' : isUnlocked ? '#58a700' : '#cecece'}`,
                          cursor: isUnlocked ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.1s',
                          position: 'relative',
                          zIndex: 1
                        }}
                        onMouseDown={(e) => {
                          if (isUnlocked) {
                            const transform = e.currentTarget.style.transform;
                            e.currentTarget.style.transform = transform + ' translateY(8px)';
                            e.currentTarget.style.boxShadow = `0 0 0 ${isCompleted ? '#dcae00' : isUnlocked ? '#58a700' : '#cecece'}`;
                          }
                        }}
                        onMouseUp={(e) => {
                          if (isUnlocked) {
                            e.currentTarget.style.transform = e.currentTarget.style.transform.replace(' translateY(8px)', '');
                            e.currentTarget.style.boxShadow = `0 8px 0 ${isCompleted ? '#dcae00' : isUnlocked ? '#58a700' : '#cecece'}`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isUnlocked && e.currentTarget.style.transform.includes('translateY(8px)')) {
                            e.currentTarget.style.transform = e.currentTarget.style.transform.replace(' translateY(8px)', '');
                            e.currentTarget.style.boxShadow = `0 8px 0 ${isCompleted ? '#dcae00' : isUnlocked ? '#58a700' : '#cecece'}`;
                          }
                        }}
                      >
                        {isCompleted ? <Check size={40} color="white" strokeWidth={4} /> : getIconForModule(stage.globalIndex, isUnlocked)}
                      </button>
                      
                      {/* Character Mascot next to the active node */}
                      {isActive && stage.globalIndex === 0 && (
                        <motion.img
                          src="/student_mascot.png"
                          alt="Mascote Aluno"
                          initial={{ y: 0 }}
                          animate={{ y: [-5, 5, -5] }}
                          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                          style={{
                            position: 'absolute',
                            width: '100px',
                            height: 'auto',
                            left: '85px', 
                            top: '0px',
                            mixBlendMode: 'multiply',
                            zIndex: -1, 
                            pointerEvents: 'none'
                          }}
                        />
                      )}

                      {/* "COMEÇAR" Tooltip with Objective for active node */}
                      {isActive && (
                        <motion.div 
                          initial={{ y: 10, x: '-50%', opacity: 0 }}
                          animate={{ y: [0, -5, 0], x: '-50%', opacity: 1 }}
                          transition={{ y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } }}
                          style={{
                            position: 'absolute',
                            bottom: '95px', 
                            left: '50%',
                            width: '260px',
                            backgroundColor: 'white',
                            padding: '16px',
                            borderRadius: '16px',
                            border: '2px solid #e5e5e5',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            zIndex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                          }}
                        >
                          {unit.objective && (
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '12px', lineHeight: '1.4' }}>
                              <strong>Objetivo:</strong> {unit.objective}
                            </span>
                          )}
                          <span style={{ fontWeight: 'bold', color: '#58cc02', fontSize: '1rem', letterSpacing: '1px' }}>
                            COMEÇAR
                          </span>
                          <div style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            marginLeft: '-6px',
                            width: '12px',
                            height: '12px',
                            backgroundColor: 'white',
                            borderBottom: '2px solid #e5e5e5',
                            borderRight: '2px solid #e5e5e5',
                            transform: 'rotate(45deg)'
                          }} />
                        </motion.div>
                      )}
                    </div>
                    </motion.div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Certificate Reward Node */}
        {completedModules.includes(allStages.length) && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
          >
            <button
              onClick={() => navigate('/certificate')}
              style={{
                width: '120px',
                height: '100px',
                borderRadius: '16px',
                backgroundColor: '#ffc800',
                border: 'none',
                boxShadow: '0 10px 0 #dcae00',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s',
                gap: '8px'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(10px)';
                e.currentTarget.style.boxShadow = '0 0 0 #dcae00';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 10px 0 #dcae00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 10px 0 #dcae00';
              }}
            >
              <Award size={48} fill="white" color="white" />
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>CERTIFICADO</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Modal Meu Perfil */}
      {showProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            <h2 style={{ margin: 0, color: 'var(--text-main)', textAlign: 'center' }}>Meu Perfil</h2>
            
            <div>
              <label style={{ fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>E-mail Institucional (Apenas Leitura)</label>
              <input type="text" value={user.email} disabled style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e5e5e5', backgroundColor: '#f5f5f5', color: '#afafaf', fontSize: '1rem' }} />
              <span style={{ fontSize: '0.8rem', color: '#afafaf', marginTop: '4px', display: 'block' }}>Para alterar o e-mail, solicite ao administrador.</span>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Nome Completo</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e5e5e5', fontSize: '1rem' }} />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Número da Matrícula</label>
              <input type="text" value={editMatricula} onChange={e => setEditMatricula(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e5e5e5', fontSize: '1rem' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => setShowProfile(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '2px solid #e5e5e5', backgroundColor: 'white', color: 'var(--text-light)', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleSaveProfile} disabled={savingProfile} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#1cb0f6', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 0 #1899d6' }}>
                {savingProfile ? 'Salvando...' : 'Salvar Dados'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ModernDialog {...dialog} />
    </div>
  );
};

export default Map;
