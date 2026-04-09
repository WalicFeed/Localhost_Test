"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

// Placeholder questions - will be replaced with actual questions from Notion
const BRAND_VOICE_QUESTIONS = [
  {
    id: "q1",
    question: "What is your primary goal?",
    type: "radio" as const,
    options: ["Build audience", "Generate leads", "Establish authority", "Other"],
  },
  {
    id: "q2",
    question: "Who is your target audience?",
    type: "textarea" as const,
    placeholder: "Describe your ideal audience...",
  },
  {
    id: "q3",
    question: "What tone should your brand have?",
    type: "radio" as const,
    options: ["Professional", "Casual", "Friendly", "Authoritative", "Other"],
  },
  {
    id: "q4",
    question: "What makes your brand unique?",
    type: "textarea" as const,
    placeholder: "Describe what sets you apart...",
  },
];

export default function BrandVoicePage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentQuestion = BRAND_VOICE_QUESTIONS[currentStep];
  const isLastQuestion = currentStep === BRAND_VOICE_QUESTIONS.length - 1;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    return answer && answer.trim().length > 0;
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
            <Label className="text-lg font-semibold">{currentQuestion.question}</Label>

            {currentQuestion.type === "radio" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={handleAnswer}
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
                    <Label
                      htmlFor={`${currentQuestion.id}-${option}`}
                      className="font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "textarea" && (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={4}
              />
            )}

            {currentQuestion.type === "text" && (
              <Input
                value={answers[currentQuestion.id] || ""}
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
