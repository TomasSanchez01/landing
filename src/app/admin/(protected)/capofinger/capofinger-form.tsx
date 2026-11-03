"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import type { CapofingerQuestion } from "@/lib/capofinger-types";
import { updateCapofingerSettings } from "../actions";

const EMPTY_QUESTION: CapofingerQuestion = { question: "", correct: "", wrong1: "", wrong2: "" };

export function CapofingerForm({ questions: initialQuestions }: { questions: CapofingerQuestion[] }) {
  const [questions, setQuestions] = useState<CapofingerQuestion[]>(initialQuestions);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const addQuestion = () => {
    setQuestions((prev) => [...prev, EMPTY_QUESTION]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof CapofingerQuestion, value: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    const cleaned = questions
      .map((q) => ({
        question: q.question.trim(),
        correct: q.correct.trim(),
        wrong1: q.wrong1.trim(),
        wrong2: q.wrong2.trim(),
      }))
      .filter((q) => q.question || q.correct || q.wrong1 || q.wrong2);

    if (cleaned.some((q) => !q.question || !q.correct || !q.wrong1 || !q.wrong2)) {
      setError("Cada pregunta tiene que tener el texto y las tres respuestas.");
      return;
    }

    startTransition(async () => {
      try {
        await updateCapofingerSettings({ questions: cleaned });
        setQuestions(cleaned);
        setSaved(true);
      } catch {
        setError("No se pudo guardar. Intentá de nuevo.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {questions.map((q, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2">
              <Input
                value={q.question}
                onChange={(e) => updateQuestion(index, "question", e.target.value)}
                placeholder="Pregunta (ej: ¿Cuántos Mundiales ganó Argentina?)"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(index)}
                title="Eliminar pregunta"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                value={q.correct}
                onChange={(e) => updateQuestion(index, "correct", e.target.value)}
                placeholder="Respuesta correcta"
                className="border-green-600/60"
              />
              <Input
                value={q.wrong1}
                onChange={(e) => updateQuestion(index, "wrong1", e.target.value)}
                placeholder="Respuesta incorrecta"
              />
              <Input
                value={q.wrong2}
                onChange={(e) => updateQuestion(index, "wrong2", e.target.value)}
                placeholder="Respuesta incorrecta"
              />
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay preguntas cargadas. Si guardás la lista vacía, el juego usa las que trae de
            fábrica.
          </p>
        )}
      </div>

      <Button type="button" variant="outline" onClick={addQuestion}>
        <Plus className="w-4 h-4 mr-1.5" />
        Agregar pregunta
      </Button>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-green-600 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          Guardado.
        </p>
      )}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
