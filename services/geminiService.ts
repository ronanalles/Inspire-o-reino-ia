import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, QuizQuestion, ThematicStudyResult, VerseOfTheDay } from '../types';
import { API_KEY } from '../config';

// Initialize the SDK only if a valid-looking API key is provided
let ai: GoogleGenAI | null = null;
if (API_KEY && API_KEY.startsWith('AIza')) {
    try {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } catch (e) {
        console.error("Falha ao inicializar o GoogleGenAI, verifique a chave de API:", e);
    }
} else {
    console.warn("Chave da API do Google Gemini não encontrada ou é inválida/placeholder. As funcionalidades de IA estão desativadas.");
}

// Helper function to check if AI is available before each call. This throws an error that can be caught by the UI.
function getAiInstance(): GoogleGenAI {
    if (!ai) {
        throw new Error("SDK do Google AI não inicializado. Verifique sua chave de API no arquivo config.ts.");
    }
    return ai;
}

const model = 'gemini-2.5-flash';

async function* sendMessageToChat(
  message: string,
  context: { book: string; chapter: number },
  history: ChatMessage[]
) {
  const ai = getAiInstance();
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
  try {
    const ai = getAiInstance();
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

async function getVerseOfTheDay(): Promise<VerseOfTheDay | null> {
    try {
        const ai = getAiInstance();
        const response = await ai.models.generateContent({
            model,
            contents: "Gere um 'Versículo do Dia' inspirador da Bíblia. Forneça a referência completa (Livro, Capítulo e Versículo), o texto do versículo e uma breve reflexão (2-3 frases) sobre sua aplicação ou significado.",
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
    try {
        const ai = getAiInstance();
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

export { sendMessageToChat, generateQuizQuestion, getVerseOfTheDay, getThematicStudy };