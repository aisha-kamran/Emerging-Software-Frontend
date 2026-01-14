// js/textToSpeech.js
function speak(text) {
  if (!("speechSynthesis" in window)) {
    console.error("TTS not supported");
    return;
  }

  // Stop previous speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const arabicRegex = /[\u0600-\u06FF]/; // Detect Arabic characters

  // Get available voices
  let voices = window.speechSynthesis.getVoices();

  // If voices are not yet loaded, wait for them
  if (!voices.length) {
    window.speechSynthesis.onvoiceschanged = () => speak(text);
    return;
  }

  // Select appropriate voice
  let selectedVoice = arabicRegex.test(text)
    ? voices.find((v) => v.lang.startsWith("ar")) || voices[0] // Arabic voice or fallback
    : voices.find((v) => v.lang.startsWith("en")) || voices[0]; // English voice or fallback

  utterance.voice = selectedVoice;
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;

  // Speak the text
  window.speechSynthesis.speak(utterance);
}
