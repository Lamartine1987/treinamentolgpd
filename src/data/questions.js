export const unitsData = [
  {
    id: 1,
    title: "Módulo 1 — Introdução à LGPD",
    objective: "Apresentar os conceitos básicos da LGPD e explicar por que a proteção de dados é importante para instituições públicas.",
    introText: "Orientar os usuários a compreender os fundamentos da Lei Geral de Proteção de Dados Pessoais (LGPD), identificar os principais riscos institucionais relacionados ao tratamento de dados pessoais e atuar de forma estratégica no processo de adequação institucional.\n\nAs orientações foram estruturadas para pessoas que ainda não possuem conhecimento técnico ou jurídico aprofundado sobre LGPD.",
    stages: [
      {
        id: "m1_s1",
        questions: [
          {
            id: "q1_1",
            type: "multiple_choice",
            question: "Qual é o objetivo principal da LGPD?",
            options: [
              "Proteger os direitos fundamentais de liberdade e de privacidade dos cidadãos.",
              "Aumentar a burocracia para instituições de ensino.",
              "Impedir que as autarquias compartilhem qualquer tipo de dado."
            ],
            correctAnswer: 0,
            explanation: "A LGPD visa proteger os dados pessoais, garantindo a privacidade e os direitos dos cidadãos, estabelecendo regras claras para o uso."
          },
          {
            id: "q1_2",
            type: "multiple_choice",
            question: "A quem a LGPD se aplica em nossa Instituição?",
            options: [
              "Apenas aos setores de TI e Recursos Humanos.",
              "A todos os servidores, estagiários e terceirizados que manuseiam dados pessoais.",
              "Apenas aos diretores e coordenadores."
            ],
            correctAnswer: 1,
            explanation: "A responsabilidade é de todos! Qualquer pessoa que colete, acesse ou compartilhe dados pessoais no dia a dia precisa seguir a LGPD."
          }
        ]
      },
      {
        id: "m1_s2",
        questions: [
          {
            id: "q1_3",
            type: "multiple_choice",
            question: "Por que a Autarquia precisa se adequar à LGPD?",
            options: [
              "Para aumentar a burocracia",
              "Para garantir a privacidade e segurança dos dados da comunidade acadêmica",
              "Apenas para evitar multas"
            ],
            correctAnswer: 1,
            explanation: "A adequação visa principalmente proteger o direito à privacidade de alunos, servidores e terceiros, não apenas evitar punições."
          },
          {
            id: "q1_4",
            type: "true_false",
            question: "Verdadeiro ou Falso: Todo dado pessoal é considerado um dado sensível pela LGPD.",
            options: ["Verdadeiro", "Falso"],
            correctAnswer: 1,
            explanation: "Falso. Dados sensíveis são uma categoria especial e restrita de dados pessoais, como origem racial, religião e saúde, que exigem proteção maior."
          },
          {
            id: "q1_5",
            type: "fill_blank",
            question: "A informação sobre a saúde ou o histórico médico de um aluno é considerada pela lei como um dado pessoal _________.",
            options: ["Público", "Sensível", "Anonimizado"],
            correctAnswer: 1,
            explanation: "Sensível. Dados de saúde recebem proteção extra e exigem cuidados rigorosos pela LGPD."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Módulo 2 — Bases Legais e Tratamento de Dados",
    objective: "Explicar quando a instituição pode tratar dados pessoais legalmente.",
    stages: [
      {
        id: "m2_s1",
        questions: [
          {
            id: "q2_1",
            type: "multiple_choice",
            question: "Qual das opções abaixo é uma base legal que autoriza o tratamento de dados pela Autarquia?",
            options: [
              "Cumprimento de obrigação legal ou regulatória.",
              "Vontade pessoal do servidor.",
              "Curiosidade institucional."
            ],
            correctAnswer: 0,
            explanation: "O cumprimento de obrigação legal é uma das principais bases legais utilizadas no setor público para justificar o uso de dados."
          }
        ]
      },
      {
        id: "m2_s2",
        questions: [
          {
            id: "q2_2",
            type: "true_false",
            question: "Verdadeiro ou Falso: O consentimento do titular é a ÚNICA forma legal de se tratar um dado pessoal.",
            options: ["Verdadeiro", "Falso"],
            correctAnswer: 1,
            explanation: "Falso. A LGPD prevê 10 bases legais, sendo o consentimento apenas uma delas (e muitas vezes não é a mais adequada para órgãos públicos)."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Módulo 3 — Governança e Estrutura Organizacional",
    objective: "Apresentar o papel do Comitê de Privacidade e como funciona a governança em proteção de dados.",
    stages: [
      {
        id: "m3_s1",
        questions: [
          {
            id: "q3_1",
            type: "fill_blank",
            question: "O _________ é a pessoa indicada pela instituição para atuar como canal de comunicação entre a Autarquia, os titulares e a Autoridade Nacional (ANPD).",
            options: ["Encarregado (DPO)", "Presidente", "Professor"],
            correctAnswer: 0,
            explanation: "O Encarregado pelo Tratamento de Dados Pessoais (DPO) é peça chave na governança e deve ser de conhecimento de todos."
          }
        ]
      },
      {
        id: "m3_s2",
        questions: [
          {
            id: "q3_2",
            type: "true_false",
            question: "Verdadeiro ou Falso: A governança em privacidade deve envolver apenas a equipe de TI da instituição.",
            options: ["Verdadeiro", "Falso"],
            correctAnswer: 1,
            explanation: "Falso. A governança exige uma abordagem multidisciplinar, envolvendo o jurídico, a gestão, os processos de negócio e a TI."
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Módulo 4 — Inventário de Dados Pessoais (IDP)",
    objective: "Ensinar como identificar e mapear os tratamentos de dados da instituição.",
    stages: [
      {
        id: "m4_s1",
        questions: [
          {
            id: "q4_1",
            type: "multiple_choice",
            question: "O que é o Inventário de Dados Pessoais (IDP)?",
            options: [
              "Uma lista com os salários de todos os servidores.",
              "Um mapeamento de todos os processos da instituição que utilizam dados, indicando seu ciclo de vida.",
              "Um software antivírus instalado nos computadores."
            ],
            correctAnswer: 1,
            explanation: "O IDP é o coração do projeto de adequação, permitindo saber onde os dados entram, como são usados e com quem são compartilhados."
          }
        ]
      },
      {
        id: "m4_s2",
        questions: [
          {
            id: "q4_2",
            type: "true_false",
            question: "Verdadeiro ou Falso: Um bom inventário de dados mapeia não apenas dados digitais, mas também dados em formato físico (papel).",
            options: ["Verdadeiro", "Falso"],
            correctAnswer: 0,
            explanation: "Verdadeiro. Arquivos físicos, formulários impressos e pastas em arquivos também devem constar no inventário se contiverem dados pessoais."
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Módulo 5 — Política de Privacidade e Direitos dos Titulares",
    objective: "Mostrar como garantir transparência e atendimento aos titulares.",
    stages: [
      {
        id: "m5_s1",
        questions: [
          {
            id: "q5_1",
            type: "multiple_choice",
            question: "Se um aluno solicitar acesso aos seus dados pessoais armazenados pela Autarquia, o que deve ser feito?",
            options: [
              "Ignorar o pedido, pois a Autarquia é pública.",
              "Responder à solicitação dentro do prazo legal, garantindo o direito de acesso.",
              "Excluir os dados imediatamente para não ter problemas."
            ],
            correctAnswer: 1,
            explanation: "O titular tem direito ao acesso facilitado e gratuito sobre a forma e duração do tratamento de seus dados."
          }
        ]
      },
      {
        id: "m5_s2",
        questions: [
          {
            id: "q5_2",
            type: "fill_blank",
            question: "A _________ é o documento onde a instituição informa de maneira clara e acessível quais dados coleta e como os utiliza.",
            options: ["Política de Privacidade", "Nota Fiscal", "Matrícula"],
            correctAnswer: 0,
            explanation: "A Política de Privacidade é essencial para garantir o princípio da Transparência exigido pela LGPD."
          }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Módulo 6 — Segurança da Informação e Incidentes",
    objective: "Demonstrar a importância da segurança da informação para a proteção dos dados pessoais.",
    stages: [
      {
        id: "m6_s1",
        questions: [
          {
            id: "q6_1",
            type: "true_false",
            question: "Verdadeiro ou Falso: Compartilhar sua senha de acesso aos sistemas da Autarquia com um colega de trabalho é uma prática aceitável se você estiver de férias.",
            options: ["Verdadeiro", "Falso"],
            correctAnswer: 1,
            explanation: "Falso. As credenciais de acesso são pessoais e intransferíveis. O compartilhamento de senhas é uma das maiores falhas de segurança da informação."
          }
        ]
      },
      {
        id: "m6_s2",
        questions: [
          {
            id: "q6_2",
            type: "multiple_choice",
            question: "Em caso de vazamento de dados de alunos, o que o servidor deve fazer primeiro?",
            options: [
              "Tentar consertar sozinho e apagar os logs.",
              "Comunicar imediatamente o Comitê de Privacidade ou o DPO.",
              "Avisar a imprensa local."
            ],
            correctAnswer: 1,
            explanation: "O Comitê/DPO saberá ativar o Plano de Resposta a Incidentes, mitigando os danos e reportando legalmente às autoridades competentes."
          }
        ]
      }
    ]
  }
];

// Função auxiliar que o Map.jsx e o Lesson.jsx usarão para tratar as "bolinhas" como uma trilha única linear
export const getAllStages = () => {
  let globalIndex = 0;
  const flatStages = [];
  unitsData.forEach((unit, uIdx) => {
    unit.stages.forEach((stage, sIdx) => {
      flatStages.push({
        ...stage,
        globalIndex: globalIndex++,
        unitId: unit.id,
        unitTitle: unit.title,
        unitObjective: unit.objective,
        unitIntroText: unit.introText,
        isFirstInUnit: sIdx === 0,
        isLastInUnit: sIdx === unit.stages.length - 1
      });
    });
  });
  return flatStages;
};
