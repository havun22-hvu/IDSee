// Animal verification component

import { useState } from "react";
import type { VerificationResult } from "../types";

interface VerifyAnimalProps {
  onVerify: (chipId: string) => Promise<VerificationResult | null>;
  result: VerificationResult | null;
  loading: boolean;
  error: string | null;
  onReset: () => void;
}

export function VerifyAnimal({
  onVerify,
  result,
  loading,
  error,
  onReset,
}: VerifyAnimalProps) {
  const [chipId, setChipId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (chipId.length === 15) {
      onVerify(chipId);
    }
  }

  function formatChipId(value: string): string {
    // Only keep digits
    const digits = value.replace(/\D/g, "").slice(0, 15);
    // Format as XXX-XXXX-XXXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 11)
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}-${digits.slice(11)}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatChipId(e.target.value);
    setChipId(formatted.replace(/-/g, ""));
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Verificeer Afkomst</h2>
      <p style={styles.description}>
        Voer het 15-cijferige chipnummer in om de afkomst te controleren.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={formatChipId(chipId)}
          onChange={handleChange}
          placeholder="528-1234-5678-9012"
          style={styles.input}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={chipId.length !== 15 || loading}
          style={{
            ...styles.button,
            opacity: chipId.length !== 15 || loading ? 0.5 : 1,
          }}
        >
          {loading ? "Controleren..." : "Verifieer"}
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {result && <VerificationResultDisplay result={result} onReset={onReset} />}
    </div>
  );
}

function VerificationResultDisplay({
  result,
  onReset,
}: {
  result: VerificationResult;
  onReset: () => void;
}) {
  if (!result.found) {
    return (
      <div style={styles.resultContainer}>
        <div style={styles.notFound}>
          <span style={styles.icon}>❓</span>
          <h3>Niet Gevonden</h3>
          <p>Dit chipnummer staat niet in het IDSee systeem.</p>
          <p style={styles.warning}>
            Let op: dit kan betekenen dat het dier niet via een erkende fokker
            is geregistreerd.
          </p>
        </div>
        <button onClick={onReset} style={styles.resetBtn}>
          Nieuwe Zoekopdracht
        </button>
      </div>
    );
  }

  return (
    <div style={styles.resultContainer}>
      <h3 style={styles.resultTitle}>Verificatie Resultaat</h3>

      <div style={styles.resultGrid}>
        <ResultItem
          label="Erkende Fokker"
          value={result.certifiedOrigin}
          description={
            result.certifiedOrigin
              ? "Dit dier is geregistreerd bij een erkende fokker"
              : "Fokker kon niet worden geverifieerd"
          }
        />
        <ResultItem
          label="Moeder Geregistreerd"
          value={result.registeredMother}
          description={
            result.registeredMother
              ? "De moeder staat in het systeem"
              : "Geen moeder gekoppeld"
          }
        />
        <ResultItem
          label="Professionele Registratie"
          value={result.validProfessional}
          description={
            result.validProfessional
              ? "Geregistreerd door erkende dierenarts/chipper"
              : "Registratie niet verifieerbaar"
          }
        />
      </div>

      {result.breed && (
        <div style={styles.extraInfo}>
          <strong>Ras:</strong> {result.breed}
        </div>
      )}

      {result.registrationDate && (
        <div style={styles.extraInfo}>
          <strong>Registratiedatum:</strong>{" "}
          {new Date(result.registrationDate).toLocaleDateString("nl-NL")}
        </div>
      )}

      <button onClick={onReset} style={styles.resetBtn}>
        Nieuwe Zoekopdracht
      </button>
    </div>
  );
}

function ResultItem({
  label,
  value,
  description,
}: {
  label: string;
  value: boolean;
  description: string;
}) {
  return (
    <div style={{ ...styles.resultItem, borderColor: value ? "#38a169" : "#e53e3e" }}>
      <div style={styles.resultHeader}>
        <span style={{ ...styles.statusIcon, color: value ? "#38a169" : "#e53e3e" }}>
          {value ? "✓" : "✗"}
        </span>
        <span style={styles.resultLabel}>{label}</span>
      </div>
      <p style={styles.resultDescription}>{description}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "1.5rem",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
  },
  title: {
    margin: "0 0 0.5rem 0",
    color: "#1a365d",
  },
  description: {
    color: "#718096",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    gap: "0.5rem",
  },
  input: {
    flex: 1,
    padding: "0.75rem",
    fontSize: "1.1rem",
    fontFamily: "monospace",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
  },
  button: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3182ce",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
  },
  error: {
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "#fed7d7",
    color: "#c53030",
    borderRadius: "4px",
  },
  resultContainer: {
    marginTop: "1.5rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e2e8f0",
  },
  resultTitle: {
    margin: "0 0 1rem 0",
    color: "#2d3748",
  },
  resultGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  resultItem: {
    padding: "1rem",
    backgroundColor: "#f7fafc",
    borderRadius: "4px",
    borderLeft: "4px solid",
  },
  resultHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.25rem",
  },
  statusIcon: {
    fontSize: "1.25rem",
    fontWeight: "bold",
  },
  resultLabel: {
    fontWeight: "600",
    color: "#2d3748",
  },
  resultDescription: {
    margin: 0,
    color: "#718096",
    fontSize: "0.875rem",
  },
  notFound: {
    textAlign: "center",
    padding: "1.5rem",
    backgroundColor: "#fffaf0",
    borderRadius: "8px",
  },
  icon: {
    fontSize: "2rem",
  },
  warning: {
    color: "#c05621",
    fontStyle: "italic",
  },
  extraInfo: {
    marginTop: "1rem",
    color: "#4a5568",
  },
  resetBtn: {
    marginTop: "1.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#edf2f7",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
