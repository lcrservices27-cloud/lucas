"use client";

import * as React from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

const subscribeNoop = () => () => {};

function useSuportaReconhecimento() {
  return React.useSyncExternalStore(
    subscribeNoop,
    () => Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
    () => false
  );
}

export function useSpeechRecognition(onResultadoFinal: (texto: string) => void) {
  const [ouvindo, setOuvindo] = React.useState(false);
  const [transcricaoParcial, setTranscricaoParcial] = React.useState("");
  const suportado = useSuportaReconhecimento();
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const callbackRef = React.useRef(onResultadoFinal);

  React.useEffect(() => {
    callbackRef.current = onResultadoFinal;
  }, [onResultadoFinal]);

  const start = React.useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let texto = "";
      let final = false;
      for (let i = 0; i < event.results.length; i++) {
        const resultado = event.results[i];
        texto += resultado[0].transcript;
        if (resultado.isFinal) final = true;
      }
      setTranscricaoParcial(texto);
      if (final) {
        callbackRef.current(texto.trim());
        setTranscricaoParcial("");
      }
    };
    recognition.onerror = () => {
      setOuvindo(false);
    };
    recognition.onend = () => {
      setOuvindo(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setOuvindo(true);
  }, []);

  const stop = React.useCallback(() => {
    recognitionRef.current?.stop();
    setOuvindo(false);
  }, []);

  return { suportado, ouvindo, transcricaoParcial, start, stop };
}
