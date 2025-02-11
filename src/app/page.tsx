'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import vocabulary from "@/data/vocabulary.json";

// Define TypeScript interfaces
interface Question {
  word: string;
  options: string[];
  correct: number;
}

interface SelectedAnswers {
  [key: number]: number;
}

const getDailyQuiz = (): Question[] => {
  const shuffled = [...vocabulary.questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

export default function Home() {
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const playPronunciation = async (word: string) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();
      
      // Define interface for phonetics
      interface Phonetic {
        audio: string;
      }
      
      // Find the first pronunciation audio URL
      const audioUrl = data[0]?.phonetics?.find((p: Phonetic) => p.audio)?.audio;
      
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        console.log('No pronunciation available');
      }
    } catch (error) {
      console.error('Failed to fetch pronunciation:', error);
    }
  };

  useEffect(() => {
    try {
      setQuiz(getDailyQuiz());
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAnswer = (optionIndex: number): void => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: optionIndex });
  };

  const nextQuestion = (): void => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = (): void => {
    const correctCount = quiz.filter((q, i) => selectedAnswers[i] === q.correct).length;
    setScore(correctCount);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading quiz...</div>;
  }

  if (quiz.length === 0) {
    return <div className="p-6 text-center">Failed to load quiz. Please try again later.</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-xl">
      <h1 className="text-xl font-bold mb-4">Daily English Vocabulary Quiz</h1>
      {score === null ? (
        <div>
          <div className="mb-4">
            <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {quiz.length}</span>
          </div>
        <div className="flex">
        <p className="font-medium text-lg mb-4">{quiz[currentQuestion].word}</p>
          <Button
            onClick={() => playPronunciation(quiz[currentQuestion].word)}
            className="bg-blue-500 text-white px-2 py-1 text-sm ml-5 hover:bg-blue-600"
          >
           🔊
          </Button>
        </div>
          <div className="flex flex-col gap-2 mt-2">
            {quiz[currentQuestion].options.map((option, optionIndex) => (
              <Button
                key={optionIndex}
                onClick={() => handleAnswer(optionIndex)}
                variant={selectedAnswers[currentQuestion] === optionIndex ? "default" : "outline"}
                className="w-full justify-start text-left"
              >
                {option}
              </Button>
            ))}
          </div>
          <Button 
            onClick={nextQuestion} 
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={selectedAnswers[currentQuestion] === undefined}
          >
            {currentQuestion < quiz.length - 1 ? "Next Question" : "Submit Quiz"}
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mt-4 text-2xl font-bold">Your Score: {score}/{quiz.length}</p>
          <Button 
            onClick={() => {
              setQuiz(getDailyQuiz());
              setCurrentQuestion(0);
              setSelectedAnswers({});
              setScore(null);
            }}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
