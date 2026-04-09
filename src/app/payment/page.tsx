"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent, skip = false) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (skip) {
        // Skip payment for debug purposes
        const res = await fetch("/api/payment/skip", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to skip payment");
        }

        router.push("/brand-voice");
        return;
      }

      if (!stripe || !elements) {
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        return;
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setLoading(false);
        return;
      }

      // Save payment method to backend
      const res = await fetch("/api/payment/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save payment method");
        setLoading(false);
        return;
      }

      router.push("/brand-voice");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            You will be charged after end of trial period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                We will send you a notification before processing the payment.
              </p>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Card Details</label>
              <div className="rounded-md border border-input bg-background p-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "hsl(var(--foreground))",
                        "::placeholder": {
                          color: "hsl(var(--muted-foreground))",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={!stripe || loading}>
                {loading ? "Processing..." : "Continue"}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
              >
                Skip (Debug Only)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
