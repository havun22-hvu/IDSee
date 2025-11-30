// Verification hook for checking animal origins

import { useState, useCallback } from "react";
import { Lucid } from "@lucid-evolution/lucid";
import type { VerificationResult, ChipId } from "../types";

interface UseVerificationReturn {
  verify: (chipId: ChipId) => Promise<VerificationResult | null>;
  result: VerificationResult | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useVerification(lucid: Lucid | null): UseVerificationReturn {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(
    async (chipId: ChipId): Promise<VerificationResult | null> => {
      if (!chipId || chipId.length !== 15) {
        setError("Invalid chip ID format (must be 15 digits)");
        return null;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        // TODO: Implement actual on-chain verification
        // For now, simulate with mock data
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock verification result
        const mockResult: VerificationResult = {
          chipId,
          found: true,
          certifiedOrigin: Math.random() > 0.3,
          registeredMother: Math.random() > 0.4,
          validProfessional: true,
          registrationDate: Date.now() - Math.random() * 31536000000, // Random date in past year
          breed: "Labrador Retriever",
        };

        setResult(mockResult);
        setLoading(false);
        return mockResult;
      } catch (err: any) {
        setError(err.message || "Verification failed");
        setLoading(false);
        return null;
      }
    },
    [lucid]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    verify,
    result,
    loading,
    error,
    reset,
  };
}
