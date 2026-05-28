import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Home = ({ onLogin }) => {
  const [isReturning, setIsReturning] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      const userSnap = await getDoc(userRef);

      if (isReturning) {
        if (userSnap.exists()) {
          onLogin(userSnap.data());
        } else {
          setError('E-mail não encontrado. Verifique se digitou corretamente ou inicie um novo treinamento.');
        }
      } else {
        if (userSnap.exists()) {
          setError('Esse e-mail já iniciou o treinamento. Clique em "Voltar ao progresso" abaixo para continuar.');
        } else {
          const newUserData = {
            name,
            email: email.toLowerCase(),
            matricula,
            completedModules: [0], // Começa apenas com o módulo 0 destravado
            xp: 0
          };
          await setDoc(userRef, newUserData);
          onLogin(newUserData);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
      <Shield size={80} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
      <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '8px', marginTop: 0 }}>Orientações LGPD</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '32px', fontSize: '1.1rem' }}>
        Orientações de forma rápida e prática sobre proteção de dados.
      </p>
      
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
        {!isReturning && (
          <>
            <input 
              type="text" 
              placeholder="Nome Completo" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required={!isReturning}
            />
            <input 
              type="text" 
              placeholder="Número da Matrícula" 
              value={matricula} 
              onChange={(e) => setMatricula(e.target.value)}
              required={!isReturning}
            />
          </>
        )}
        
        <input 
          type="email" 
          placeholder="E-mail Institucional" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        {error && (
          <div style={{ color: 'var(--danger-color)', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'left', backgroundColor: '#ffdfe0', padding: '12px', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        
        <button type="submit" className="duo-button" style={{ marginTop: '8px' }} disabled={loading}>
          {loading ? 'Aguarde...' : (isReturning ? 'Continuar Treinamento' : 'Começar a Aprender')}
        </button>
      </form>

      <div style={{ marginTop: '32px' }}>
        {isReturning ? (
          <p style={{ color: 'var(--text-light)' }}>
            É seu primeiro acesso? <br/>
            <button type="button" onClick={() => { setIsReturning(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--secondary-color)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', marginTop: '8px' }}>Criar novo cadastro</button>
          </p>
        ) : (
          <p style={{ color: 'var(--text-light)' }}>
            Já iniciou o treinamento? <br/>
            <button type="button" onClick={() => { setIsReturning(true); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--secondary-color)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', marginTop: '8px' }}>Inserir e-mail para continuar onde parei</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
