"use client";

import * as React from "react";

const subscribeNoop = () => () => {};

export function useSpeechSynthesis() {
  const suportado = React.useSyncExternalStore(
    subscribeNoop,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false
  );

  const falar = React.useCallback((texto: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }, []);

  const parar = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { suportado, falar, parar };
}
