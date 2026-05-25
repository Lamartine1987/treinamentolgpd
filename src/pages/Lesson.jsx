import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseContent, computeAllStages } from '../utils/contentService';
import { X, Heart, Check, Info, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { playCorrectSound, playIncorrectSound, playSuccessSound } from '../utils/audio';

const Lesson = ({ user, onUpdateUser }) => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  
  const [moduleData, setModuleData] = useState(null);
  const [showIntro, setShowIntro] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [lives, setLives] = useState(3);
  const [earnedXP, setEarnedXP] = useState(0);
  const [lessonFinished, setLessonFinished] = useState(false);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [allStagesCount, setAllStagesCount] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      const data = await fetchCourseContent();
      const stages = computeAllStages(data);
      setAllStagesCount(stages.length);
      
      const mod = stages.find(m => m.globalIndex === parseInt(moduleId));
      if (mod) {
        setModuleData(mod);
        setTotalQuestions(mod.questions.length);
        setShowIntro(!!mod.introText);
      } else {
        navigate('/map');
      }
    };
    loadContent();
  }, [moduleId, navigate]);

  if (!moduleData) return <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', color: '#afafaf', fontWeight: 'bold' }}>Carregando lição...</div>;

  const currentQuestion = moduleData.questions[currentQuestionIndex];
  const progress = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const handleCheck = () => {
    setIsChecking(true);
    
    // Suporte para múltiplos formatos de questões:
    // Se for fill_blank ou multiple_choice, `selectedOption` é a resposta
    // Se for true_false, `selectedOption` será booleano
    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (!correct) {
      playIncorrectSound();
      setLives(prev => Math.max(0, prev - 1));
      
      // Duolingo style: append the failed question to the end of the queue
      setModuleData(prev => {
        const questionToRepeat = { ...prev.questions[currentQuestionIndex], isReview: true };
        return {
          ...prev,
          questions: [...prev.questions, questionToRepeat]
        };
      });
    } else {
      playCorrectSound();
      setEarnedXP(prev => prev + 15); // Ganha 15 XP por acerto
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (lives === 0) {
      navigate('/map'); // Failed
      return;
    }

    if (currentQuestionIndex < moduleData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsChecking(false);
      setIsCorrect(null);
    } else {
      playSuccessSound();
      setCorrectCount(totalQuestions); // Força a barra para 100% visualmente
      setLessonFinished(true);
    }
  };

  const handleFinish = async () => {
    try {
      const userRef = doc(db, 'users', user.email);
      const nextIndex = parseInt(moduleId) + 1;
      
      const newCompletedModules = [...(user.completedModules || [0])];
      const newTotalXP = (user.xp || 0) + earnedXP;
      
      // Lógica de Streak (Ofensiva)
      const today = new Date().toISOString().split('T')[0];
      const lastLoginDate = user.lastLoginDate;
      let newStreak = user.streakCount || 0;
      
      if (lastLoginDate !== today) {
        if (!lastLoginDate) {
           newStreak = 1;
        } else {
           const lastDate = new Date(lastLoginDate);
           const currentDate = new Date(today);
           const diffTime = currentDate - lastDate; 
           const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
           
           if (diffDays === 1) {
             newStreak += 1;
           } else if (diffDays > 1) {
             newStreak = 1; // Quebrou a ofensiva, recomeça
           }
        }
      }
      
      let updates = { 
        xp: newTotalXP,
        streakCount: newStreak,
        lastLoginDate: today
      };
      
      // Destrava o próximo módulo se ainda não estiver destravado
      if (!newCompletedModules.includes(nextIndex) && nextIndex < allStagesCount) {
        newCompletedModules.push(nextIndex);
      }
      
      updates.completedModules = newCompletedModules;
      
      await updateDoc(userRef, updates);
      
      onUpdateUser({ ...user, ...updates });
      navigate('/map');
    } catch (err) {
      console.error("Erro ao salvar progresso", err);
      navigate('/map'); // Volta de qualquer forma para não travar
    }
  };

  if (lessonFinished) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', backgroundColor: 'white' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}>
          <Star size={120} color="#ffc800" fill="#ffc800" />
        </motion.div>
        <h1 style={{ color: '#ffc800', marginTop: '24px', fontSize: '2.5rem' }}>Lição Concluída!</h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '40px', fontSize: '1.2rem' }}>Você está mandando bem na proteção de dados.</p>
        <button className="duo-button" onClick={handleFinish} style={{ backgroundColor: '#ffc800', boxShadow: '0 4px 0 #dcae00' }}>
          Continuar
        </button>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', backgroundColor: 'white' }}>
        <Heart size={120} color="var(--text-light)" />
        <h1 style={{ color: 'var(--danger-color)', marginTop: '24px', fontSize: '2.5rem' }}>Fim de jogo!</h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '40px', fontSize: '1.2rem' }}>Revise o conteúdo e tente novamente mais tarde.</p>
        <button className="duo-button outline" onClick={() => navigate('/map')}>
          Voltar ao Mapa
        </button>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'white' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px' }}>
          <button onClick={() => navigate('/map')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#afafaf', padding: 0 }}>
            <X size={28} />
          </button>
        </div>
        
        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
        >
          <div style={{ backgroundColor: '#ddf4ff', padding: '24px', borderRadius: '50%', marginBottom: '32px' }}>
             <Info size={64} color="var(--secondary-color)" />
          </div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '2.2rem', marginBottom: '24px' }}>Introdução</h1>
          {moduleData.introText && moduleData.introText.split('\n\n').map((paragraph, idx) => (
             <p key={idx} style={{ fontSize: '1.2rem', color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '16px', maxWidth: '600px' }}>
               {paragraph}
             </p>
          ))}
        </motion.div>

        {/* Footer */}
        <div style={{ padding: '24px', borderTop: '2px solid #e5e5e5', display: 'flex', justifyContent: 'center' }}>
          <button className="duo-button" onClick={() => setShowIntro(false)}>
            Estou Pronto!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: '16px' }}>
        <button onClick={() => navigate('/map')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#afafaf', padding: 0 }}>
          <X size={28} />
        </button>
        
        {/* Progress Bar */}
        <div style={{ flex: 1, height: '16px', backgroundColor: '#e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{ height: '100%', backgroundColor: 'var(--primary-color)', borderRadius: '8px' }}
          />
        </div>
        
        {/* Lives & XP */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffc800', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <Zap size={24} fill="#ffc800" />
            {earnedXP}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger-color)', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <Heart size={24} fill="var(--danger-color)" />
            {lives}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        
        {currentQuestion.isReview && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', backgroundColor: '#ffdfe0', color: 'var(--danger-shadow)', padding: '8px 16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>
            <Heart size={18} fill="var(--danger-shadow)" />
            Revisão de Erro
          </div>
        )}

        {currentQuestion.type !== 'fill_blank' && (
          <h2 style={{ fontSize: '1.8rem', marginTop: 0, marginBottom: '32px' }}>{currentQuestion.question}</h2>
        )}
        
        {(!currentQuestion.type || currentQuestion.type === 'multiple_choice') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                disabled={isChecking}
                className={`duo-button outline ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => setSelectedOption(index)}
                style={{
                  textAlign: 'left',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  padding: '20px',
                  color: selectedOption === index ? 'var(--secondary-color)' : 'var(--text-main)',
                  backgroundColor: selectedOption === index ? '#ddf4ff' : 'transparent',
                  borderColor: selectedOption === index ? 'var(--secondary-color)' : 'var(--border-color)',
                  boxShadow: `0 4px 0 ${selectedOption === index ? 'var(--secondary-color)' : 'var(--border-color)'}`
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'true_false' && (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                disabled={isChecking}
                className={`duo-button outline ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => setSelectedOption(index)}
                style={{
                  flex: 1,
                  maxWidth: '200px',
                  padding: '40px 20px',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  color: selectedOption === index ? 'var(--secondary-color)' : 'var(--text-main)',
                  backgroundColor: selectedOption === index ? '#ddf4ff' : 'transparent',
                  borderColor: selectedOption === index ? 'var(--secondary-color)' : 'var(--border-color)',
                  boxShadow: `0 4px 0 ${selectedOption === index ? 'var(--secondary-color)' : 'var(--border-color)'}`
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'fill_blank' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ fontSize: '1.8rem', lineHeight: '1.6', color: 'var(--text-main)', textAlign: 'center', backgroundColor: '#f5f5f5', padding: '32px', borderRadius: '16px' }}>
              {currentQuestion.question.split('_________').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span style={{ 
                      display: 'inline-block', 
                      minWidth: '150px', 
                      borderBottom: '4px solid var(--text-light)', 
                      margin: '0 8px', 
                      color: 'var(--secondary-color)', 
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      {selectedOption !== null ? currentQuestion.options[selectedOption] : ''}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  disabled={isChecking || selectedOption === index}
                  className={`duo-button outline`}
                  onClick={() => setSelectedOption(index)}
                  style={{
                    padding: '16px 32px',
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    color: selectedOption === index ? 'transparent' : 'var(--text-main)',
                    backgroundColor: selectedOption === index ? '#e5e5e5' : 'transparent',
                    borderColor: selectedOption === index ? '#e5e5e5' : 'var(--border-color)',
                    boxShadow: `0 4px 0 ${selectedOption === index ? 'transparent' : 'var(--border-color)'}`
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer Area */}
      <div style={{ padding: '24px', borderTop: '2px solid #e5e5e5', display: 'flex', justifyContent: 'center' }}>
        {!isChecking && (
          <button 
            className="duo-button" 
            disabled={selectedOption === null}
            onClick={handleCheck}
            style={{
              backgroundColor: selectedOption === null ? '#e5e5e5' : 'var(--primary-color)',
              boxShadow: `0 4px 0 ${selectedOption === null ? '#cecece' : 'var(--primary-shadow)'}`,
              color: selectedOption === null ? '#afafaf' : 'white'
            }}
          >
            Verificar
          </button>
        )}
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isChecking && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '32px 24px',
              backgroundColor: isCorrect ? '#d7ffb8' : '#ffdfe0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '600px',
              margin: '0 auto',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: isCorrect ? 'var(--primary-shadow)' : 'var(--danger-shadow)' }}>
              {isCorrect ? (
                <>
                  <div style={{ backgroundColor: 'white', borderRadius: '50%', padding: '8px', display: 'flex' }}>
                    <Check size={32} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Excelente!</h2>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#58a700' }}>+15 XP</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ backgroundColor: 'white', borderRadius: '50%', padding: '8px', display: 'flex' }}>
                    <X size={32} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Incorreto</h2>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', color: isCorrect ? 'var(--primary-shadow)' : 'var(--danger-shadow)'}}>
              <Info size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>{currentQuestion.explanation}</span>
            </div>

            <button 
              className={`duo-button ${!isCorrect ? 'danger' : ''}`} 
              onClick={handleNext}
            >
              Continuar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lesson;
