import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizSession {
  questions: Question[];
  currentQuestion: number;
  score: number;
  answers: string[];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function generateQuestions(): Promise<Question[]> {
  console.log("\n🤖 Generando preguntas de trivia con Claude...\n");

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Generate a quiz with 5 general knowledge questions in JSON format. Each question should have:
- question: the question text in Spanish
- options: array of 4 answer options (A, B, C, D format)
- correctAnswer: the letter of the correct answer (A, B, C, or D)

Return ONLY valid JSON, no markdown or additional text. Example format:
[
  {
    "question": "¿Cuál es la capital de Francia?",
    "options": ["A) Madrid", "B) París", "C) Londres", "D) Berlín"],
    "correctAnswer": "B"
  }
]`,
      },
    ],
  });

  try {
    const content = message.content[0];
    if (content.type === "text") {
      const jsonStr = content.text.trim();
      const parsedStr = jsonStr.startsWith("