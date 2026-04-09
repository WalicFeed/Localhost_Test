"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const BRAND_VOICE_QUESTIONS = [
  {
    id: "q1",
    question: "Опишите себя",
    type: "textarea" as const,
    required: true,
    description: "Пример: Меня зовут Юля Максимова.\nЯ маркетолог, специалист по продвижению компаний и личных брендов, коуч и ментор. Я помогаю находить нестандартные способы продвижения, мотивировать себя и заниматься дистрибуцией контента.\nТакже я опытная маркетинговая руководительница с международным опытом.\nБолее 10 лет я реализую стратегии роста, руковожу командами, строю контент-воронки, развиваю личные бренды и организую масштабные онлайн-проекты.",
    placeholder: "Your answer",
  },
  {
    id: "q2",
    question: "Описание вашего продукта / проекта",
    type: "textarea" as const,
    required: true,
    description: "Пример: Мой проект называется Highlight Brand Lab лаборатория личного бренда.\nЭто компания по развитию личного бренда для экспертов. Это мастерская по созданию контента и упаковке экспертности.\nМой проект решает ключевые проблемы:\n- страх проявленности,\n- отсутствие стратегии и системы продвижения,\n- неупакованная экспертность и хаотичный контент,\n- неупакованная экспертность и хаотичный контент,\n- отсутствие клиентов из личного бренда.\nОсновные преимущества включают:\n- быстрый запуск и упаковку без прокрастинации,\n- регулярный выход в контент и работающая воронка,\n- рост видимости и появление клиентов уже во время участия,\n- поддержку и структуру, которые помогают дойти до результата.",
    placeholder: "Your answer",
  },
  {
    id: "q3",
    question: "Опишите вашу целевую аудиторию",
    type: "textarea" as const,
    required: true,
    description: "Пример: Моя целевая аудитория это: эксперты с опытом, но без сформированного личного бренда, специалисты, сменившие профессию и ищущие клиентов, фаундеры и владельцы бизнесов, которым нужна публичность.\nОни нуждаются в: партнёре, наставнике и лидере, структурировании опыта, упаковке и сопровождении, поддержке и среде, где можно расти и проявляться.\nОни сталкиваются с такими проблемами, как: отсутствие системы продвижения, прокрастинация и страх самопрезентации, разрозненный опыт без понятного продукта, отсутствие внешней опоры.",
    placeholder: "Your answer",
  },
  {
    id: "q4",
    question: "Добавьте 5 текстов написанных вами БЕЗ участия ИИ и даже без редактирования с помощью ЛЮБОЙ ИИ",
    type: "textarea" as const,
    required: true,
    description: "Пояснение:\nТекст 1 (вставляете текст)\nТекст 2 (вставляете текст)\nТекст 3 (вставляете текст)\nТекст 4 (вставляете текст)\nТекст 5 (вставляете текст)",
    placeholder: "Your answer",
  },
  {
    id: "q5",
    question: "О чем планируете создавать контент?",
    type: "checkbox" as const,
    required: true,
    description: "(Select as many as you like)",
    options: [
      "Экспертный / обучающий контент",
      "Продажи / маркетинг",
      "Личный бренд",
      "Бизнес / предпринимательство",
      "Психология / саморазвитие",
      "Lifestyle / блог",
      "Другое: напишите ниже",
    ],
  },
  {
    id: "q6",
    question: "О чем планируете создавать контент для свободного ответа",
    type: "text" as const,
    required: false,
    placeholder: "Your answer",
  },
  {
    id: "q7",
    question: "Как вы хотите звучать?",
    type: "checkbox" as const,
    required: true,
    description: "(Select as many as you like)",
    options: [
      "Спокойно и рассудительно",
      "Энергично и заряжающе",
      "Дружелюбно",
      "Строго и по делу",
      "Провокационно",
      "Заботливо",
      "Уверенно",
      "С юмором",
      "Минималистично",
      "Глубоко и аналитично",
    ],
  },
  {
    id: "q8",
    question: "Насколько формальными вы хотите быть?",
    type: "checkbox" as const,
    required: true,
    description: "(Select as many as you like)",
    options: [
      "На ты легко и живо",
      "На вы но без формализмов",
      "Официально",
      "Микс на ты и на в зависимости от канала",
    ],
  },
  {
    id: "q9",
    question: "Что для вас важнее всего в тексте?",
    type: "checkbox" as const,
    required: true,
    description: "(Select as many as you like)",
    options: [
      "Польза",
      "Эмоции",
      "Простота",
      "Глубина",
      "Продажи",
      "Личное присутствие",
    ],
  },
  {
    id: "q10",
    question: "Хотите поделиться чем-то еще? Просто напишите свои мысли ниже",
    type: "textarea" as const,
    required: false,
    placeholder: "Your answer",
  },
  {
    id: "q11",
    question: "Ссылка на ваш основной блог",
    type: "text" as const,
    required: true,
    placeholder: "Your answer",
  },
  {
    id: "q12",
    question: "Ссылка на другие ваши соцсети",
    type: "text" as const,
    required: false,
    placeholder: "Your answer",
  },
  {
    id: "q13",
    question: "Ссылка на другие ваши соцсети",
    type: "text" as const,
    required: false,
    placeholder: "Your answer",
  },
  {
    id: "q14",
    question: "Ссылка на другие ваши соцсети",
    type: "text" as const,
    required: false,
    placeholder: "Your answer",
  },
  {
    id: "q15",
    question: "Ссылка на другие ваши соцсети",
    type: "text" as const,
    required: false,
    placeholder: "Your answer",
  },
];

export default function BrandVoicePage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentQuestion = BRAND_VOICE_QUESTIONS[currentStep];
  const isLastQuestion = currentStep === BRAND_VOICE_QUESTIONS.length - 1;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[currentQuestion.id] as string[]) || [];
      if (checked) {
        return { ...prev, [currentQuestion.id]: [...current, option] };
      } else {
        return { ...prev, [currentQuestion.id]: current.filter((item) => item !== option) };
      }
    });
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.type === "checkbox") {
      return Array.isArray(answer) && answer.length > 0;
    }
    
    return answer && typeof answer === "string" && answer.trim().length > 0;
  };

  const handleNext = () => {
    if (!canProceed()) return;

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/brand-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brandVoiceData: answers,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!started) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Brand Voice Setup</CardTitle>
            <CardDescription>
              We will ask a few questions about you and your audience so we can create your
              personal brand voice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setStarted(true)} className="w-full">
              Start Setup
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question {currentStep + 1} of {BRAND_VOICE_QUESTIONS.length}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / BRAND_VOICE_QUESTIONS.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / BRAND_VOICE_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">
                {currentQuestion.question}
                {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {currentQuestion.description && (
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                  {currentQuestion.description}
                </p>
              )}
            </div>

            {currentQuestion.type === "checkbox" && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => {
                  const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
                  return (
                    <div key={option} className="flex items-start space-x-2">
                      <Checkbox
                        id={`${currentQuestion.id}-${option}`}
                        checked={currentAnswers.includes(option)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(option, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`${currentQuestion.id}-${option}`}
                        className="font-normal cursor-pointer leading-relaxed"
                      >
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === "textarea" && (
              <Textarea
                value={(answers[currentQuestion.id] as string) || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={6}
                className="resize-none"
              />
            )}

            {currentQuestion.type === "text" && (
              <Input
                value={(answers[currentQuestion.id] as string) || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder}
              />
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="flex-1"
            >
              {loading ? "Saving..." : isLastQuestion ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
