// js/chat.js
const chatBox = document.getElementById("chatBox");
const queryInput = document.getElementById("query");
const micBtn = document.getElementById("micBtn");

let isListening = false;
let recognitionObj = null;

// Add message to chat
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `msg ${sender}`;
  msg.innerHTML = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Add loading dots while bot is responding
function addLoader() {
  const loader = document.createElement("div");
  loader.className = "msg bot loader";
  loader.innerHTML = "<span></span><span></span><span></span>";
  chatBox.appendChild(loader);
  chatBox.scrollTop = chatBox.scrollHeight;
  return loader;
}

// Send user query to Flask API
function sendQuery() {
  const query = queryInput.value.trim();
  if (!query) return;

  addMessage(query, "user");
  queryInput.value = "";

  const loader = addLoader();

  fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((data) => {
      loader.remove();
      addMessage(data.answer, "bot");
      speak(data.answer); // call TTS
    })
    .catch((err) => {
      loader.remove();
      const errorMsg = "Oops! Something went wrong. Please try again.";
      addMessage(errorMsg, "bot");
      speak(errorMsg);
      console.error(err);
    });
}

// Enter key to send query
queryInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendQuery();
});

// Mic button click
micBtn.addEventListener("click", () => {
  if (!isListening) {
    startMic();
  } else {
    stopMic();
  }
});

// Start microphone
function startMic() {
  // Stop bot speaking if user starts talking
  window.speechSynthesis.cancel();

  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    alert("Your browser doesn't support voice input.");
    return;
  }

  recognitionObj = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognitionObj.lang = "en-US";
  recognitionObj.interimResults = false;
  recognitionObj.maxAlternatives = 1;

  recognitionObj.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    queryInput.value = transcript;
    sendQuery();
  };

  recognitionObj.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    stopMic();
  };

  recognitionObj.onend = () => {
    stopMic();
  };

  recognitionObj.start();

  isListening = true;
  micBtn.classList.add("listening");
}

// Stop microphone
function stopMic() {
  if (recognitionObj) recognitionObj.stop();
  isListening = false;
  micBtn.classList.remove("listening");
}

// Unlock voices on first user click (Chrome autoplay fix)
document.body.addEventListener(
  "click",
  () => {
    window.speechSynthesis.getVoices();
  },
  { once: true }
);
