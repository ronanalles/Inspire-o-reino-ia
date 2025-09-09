import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, QuizQuestion, ThematicStudyResult, VerseOfTheDay, SearchResult, ChapterCrossReferences } from '../types';

// CORRECT: For Vite projects, environment variables exposed to the client MUST start with VITE_
// and be accessed via import.meta.env. This is the definitive fix for Vercel deployments.
const API_KEY = import.meta.env.VITE_API_KEY;

// Function to verify if the API key is available. This is used by App.tsx.
export const isApiKeyAvailable = () => {
  // It must check the same variable.
  return !!import.meta.env.VITE_API_KEY;
};

// If the key isn't set, the app will show an error screen with instructions.
const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

async function* sendMessageToChat(
  message: string,
  context: { book: string; chapter: number },
  history: ChatMessage[]
) {
  if (!isApiKeyAvailable()) return;
  const systemInstruction = `Você é um assistente de estudo da Bíblia, amigável e experiente. 
  Sua finalidade é ajudar os usuários a compreenderem melhor as Escrituras. 
  Atualmente, o usuário está lendo ${context.book}, capítulo ${context.chapter}. 
  Responda às perguntas dele com base nesse contexto, fornecendo explicações claras, insights teológicos e referências a outras partes da Bíblia quando for relevante. 
  Mantenha um tom respeitoso e encorajador. Formate suas respostas usando markdown para melhor legibilidade (ex: **negrito** para ênfase, listas para pontos-chave).`;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: systemInstruction,
    },
    history: history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }))
  });

  const result = await chat.sendMessageStream({ message });
  
  for await (const chunk of result) {
    yield chunk.text;
  }
}

async function generateQuizQuestion(): Promise<QuizQuestion | null> {
  if (!isApiKeyAvailable()) return null;
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Gere uma pergunta de múltipla escolha sobre a Bíblia com 3 opções de resposta. A pergunta deve ser de dificuldade média e abranger qualquer parte do Antigo ou Novo Testamento. Forneça a pergunta, um array com as 3 opções e o índice da resposta correta (0, 1 ou 2).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { 
              type: Type.STRING,
              description: "A pergunta do quiz."
            },
            options: {
              type: Type.ARRAY,
              description: "Um array com exatamente 3 strings, representando as opções de resposta.",
              items: { type: Type.STRING },
            },
            correctAnswerIndex: { 
              type: Type.INTEGER,
              description: "O índice (0, 1 ou 2) da resposta correta no array 'options'."
            },
          },
          required: ["question", "options", "correctAnswerIndex"],
        },
      },
    });

    const quizData = JSON.parse(response.text.trim());
    if (quizData.question && Array.isArray(quizData.options) && quizData.options.length === 3) {
      return quizData as QuizQuestion;
    }
    return null;
  } catch (error) {
    console.error("Error generating quiz question:", error);
    return null;
  }
}

async function getVerseOfTheDay(book: string, chapter: number): Promise<VerseOfTheDay | null> {
    if (!isApiKeyAvailable()) return null;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Gere um 'Versículo do Dia' inspirador do livro de ${book}, capítulo ${chapter}. Forneça a referência completa (incluindo o versículo exato que você escolheu), o texto do versículo e uma breve reflexão (2-3 frases) sobre sua aplicação ou significado.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reference: { type: Type.STRING, description: "A referência bíblica, ex: 'João 3:16'" },
                        text: { type: Type.STRING, description: "O texto completo do versículo." },
                        reflection: { type: Type.STRING, description: "Uma breve reflexão sobre o versículo." }
                    },
                    required: ["reference", "text", "reflection"]
                }
            }
        });
        return JSON.parse(response.text.trim()) as VerseOfTheDay;
    } catch (error) {
        console.error("Error fetching verse of the day:", error);
        return null;
    }
}

async function getThematicStudy(theme: string): Promise<ThematicStudyResult | null> {
    if (!isApiKeyAvailable()) return null;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Realize um estudo temático conciso sobre "${theme}" na Bíblia. Forneça um parágrafo de resumo sobre o tema e uma lista de 5 a 7 versículos-chave relacionados. Para cada versículo, forneça a referência, o nome exato do livro (ex: 'Gênesis', 'Apocalipse') e o número do capítulo.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Um resumo do estudo temático." },
                        verses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    reference: { type: Type.STRING, description: "A referência do versículo (ex: 'Romanos 12:2')." },
                                    book: { type: Type.STRING, description: "O nome completo e exato do livro." },
                                    chapter: { type: Type.INTEGER, description: "O número do capítulo." }
                                },
                                required: ["reference", "book", "chapter"]
                            }
                        }
                    },
                    required: ["summary", "verses"]
                }
            }
        });
        return JSON.parse(response.text.trim()) as ThematicStudyResult;
    } catch (error) {
        console.error("Error generating thematic study:", error);
        return null;
    }
}

async function searchVerses(query: string): Promise<SearchResult[] | null> {
    if (!isApiKeyAvailable()) return null;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Aja como um motor de busca bíblico. Encontre até 15 versículos relevantes para a busca: "${query}". A busca pode ser por palavra-chave, tema ou referência. Para cada versículo encontrado, forneça a referência, o nome exato do livro, o capítulo, o número do versículo e o texto completo.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        results: {
                            type: Type.ARRAY,
                            description: "Uma lista de versículos encontrados.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    reference: { type: Type.STRING, description: "A referência (ex: 'Gênesis 1:1')." },
                                    book: { type: Type.STRING, description: "O nome completo do livro." },
                                    chapter: { type: Type.INTEGER, description: "O número do capítulo." },
                                    verse: { type: Type.INTEGER, description: "O número do versículo." },
                                    text: { type: Type.STRING, description: "O texto do versículo." }
                                },
                                required: ["reference", "book", "chapter", "verse", "text"]
                            }
                        }
                    },
                    required: ["results"]
                }
            }
        });
        const parsed = JSON.parse(response.text.trim());
        return parsed.results as SearchResult[];
    } catch (error) {
        console.error("Error searching verses:", error);
        return null;
    }
}

async function getCrossReferences(chapterText: string): Promise<ChapterCrossReferences | null> {
    if (!isApiKeyAvailable()) return null;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Analise este texto bíblico e identifique até 10 nomes, lugares ou conceitos teológicos importantes para um estudo aprofundado. Para cada um, forneça o termo exato, uma breve explicação, uma lista de 3-5 referências cruzadas em outras partes da Bíblia e, se for um tópico complexo, um link de artigo opcional. O texto é: "${chapterText}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        references: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    term: { type: Type.STRING, description: "O termo exato encontrado no texto." },
                                    explanation: { type: Type.STRING, description: "Uma breve explicação do termo." },
                                    crossReferences: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                reference: { type: Type.STRING, description: "A referência (ex: 'João 1:1')." },
                                                book: { type: Type.STRING, description: "O nome completo do livro." },
                                                chapter: { type: Type.INTEGER, description: "O número do capítulo." }
                                            },
                                            required: ["reference", "book", "chapter"]
                                        }
                                    },
                                    articles: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                title: { type: Type.STRING, description: "O título do artigo." },
                                                url: { type: Type.STRING, description: "O URL completo do artigo." }
                                            },
                                            required: ["title", "url"]
                                        }
                                    }
                                },
                                required: ["term", "explanation", "crossReferences"]
                            }
                        }
                    },
                    required: ["references"]
                }
            }
        });
        const parsed = JSON.parse(response.text.trim());
        return parsed.references as ChapterCrossReferences;
    } catch (error) {
        console.error("Error fetching cross references:", error);
        return null;
    }
}


export { sendMessageToChat, generateQuizQuestion, getVerseOfTheDay, getThematicStudy, searchVerses, getCrossReferences };