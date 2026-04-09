"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const ROLES = [
  "Content Creator",
  "Business Owner",
  "Marketing Manager",
  "Developer",
  "Designer",
  "Other",
];

const CHANNELS = [
  "Social Media",
  "Email",
  "Search Engine",
  "Friend/Colleague",
  "Advertisement",
  "Other",
];

const HELP_TOPICS = [
  "Getting Started",
  "Feature Tutorials",
  "Best Practices",
  "Technical Support",
  "Billing & Account",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Role
  const [role, setRole] = useState("");
  const [roleOther, setRoleOther] = useState("");

  // Step 2: Discovery Channel
  const [channel, setChannel] = useState("");
  const [channelOther, setChannelOther] = useState("");

  // Step 3: Help Topics
  const [helpTopics, setHelpTopics] = useState<string[]>([]);
  const [helpTopicsOther, setHelpTopicsOther] = useState("");

  const toggleHelpTopic = (topic: string) => {
    setHelpTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const canProceedStep1 = role && (role !== "Other" || roleOther.trim());
  const canProceedStep2 = channel && (channel !== "Other" || channelOther.trim());
  const canProceedStep3 = helpTopics.length > 0 && (!helpTopics.includes("Other") || helpTopicsOther.trim());

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceedStep3) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          role,
          roleOther: role === "Other" ? roleOther : null,
          channel,
          channelOther: channel === "Other" ? channelOther : null,
          helpTopics,
          helpTopicsOther: helpTopics.includes("Other") ? helpTopicsOther : null,
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome! Let&apos;s get to know you</CardTitle>
          <CardDescription>
            Step {step} of 3 - This helps us personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">What is your role?</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Help us understand how you&apos;ll use our platform
                </p>
              </div>
              <RadioGroup value={role} onValueChange={setRole}>
                {ROLES.map((r) => (
                  <div key={r} className="flex items-center space-x-2">
                    <RadioGroupItem value={r} id={`role-${r}`} />
                    <Label htmlFor={`role-${r}`} className="font-normal cursor-pointer">
                      {r}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {role === "Other" && (
                <Input
                  placeholder="Please specify your role"
                  value={roleOther}
                  onChange={(e) => setRoleOther(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">
                  How did you hear about us?
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  We&apos;d love to know where you discovered us
                </p>
              </div>
              <RadioGroup value={channel} onValueChange={setChannel}>
                {CHANNELS.map((c) => (
                  <div key={c} className="flex items-center space-x-2">
                    <RadioGroupItem value={c} id={`channel-${c}`} />
                    <Label htmlFor={`channel-${c}`} className="font-normal cursor-pointer">
                      {c}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {channel === "Other" && (
                <Input
                  placeholder="Please specify"
                  value={channelOther}
                  onChange={(e) => setChannelOther(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">
                  What topics would you like help with?
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select all that apply
                </p>
              </div>
              <div className="space-y-3">
                {HELP_TOPICS.map((topic) => (
                  <div key={topic} className="flex items-center space-x-2">
                    <Checkbox
                      id={`topic-${topic}`}
                      checked={helpTopics.includes(topic)}
                      onCheckedChange={() => toggleHelpTopic(topic)}
                    />
                    <Label
                      htmlFor={`topic-${topic}`}
                      className="font-normal cursor-pointer"
                    >
                      {topic}
                    </Label>
                  </div>
                ))}
              </div>
              {helpTopics.includes("Other") && (
                <Input
                  placeholder="Please specify topics"
                  value={helpTopicsOther}
                  onChange={(e) => setHelpTopicsOther(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                }
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceedStep3 || loading}
                className="flex-1"
              >
                {loading ? "Saving..." : "Complete"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
