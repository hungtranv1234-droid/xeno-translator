let selectedLanguage = localStorage.getItem("xeno-language") || "Spanish";
let startX, startY, box;
createLanguageSelector();

document.addEventListener("mousedown", (e) => {
  // Start position
  startX = e.pageX;
  startY = e.pageY;

  // Create the box
  box = document.createElement("div");
  box.style.position = "absolute";
  box.style.border = "2px dashed red";
  box.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
  box.style.left = startX + "px";
  box.style.top = startY + "px";
  box.style.zIndex = "999999";
  box.style.pointerEvents = "none";

  document.body.appendChild(box);

  document.addEventListener("mousemove", drawBox);
  document.addEventListener("mouseup", finishBox);
});

function drawBox(e) {
  box.style.width = Math.abs(e.pageX - startX) + "px";
  box.style.height = Math.abs(e.pageY - startY) + "px";
  box.style.left = Math.min(e.pageX, startX) + "px";
  box.style.top = Math.min(e.pageY, startY) + "px";
}

function finishBox() {
  document.removeEventListener("mousemove", drawBox);
  document.removeEventListener("mouseup", finishBox);

  const rect = box.getBoundingClientRect();

  html2canvas(document.body).then(canvas => {
    const cropped = document.createElement("canvas");
    const ctx = cropped.getContext("2d", { willReadFrequently: true });

    cropped.width = rect.width;
    cropped.height = rect.height;

    ctx.drawImage(
      canvas,
      rect.left,
      rect.top,
      rect.width,
      rect.height,
      0,
      0,
      rect.width,
      rect.height
    );

    cropped.style.position = "fixed";
    cropped.style.bottom = "10px";
    cropped.style.right = "10px";
    cropped.style.border = "2px solid green";
    cropped.style.zIndex = "999999";

    document.body.appendChild(cropped);
    Tesseract.recognize(
  cropped,
  "eng",
  {
    logger: info => console.log(info)
  }
).then(({ data: { text } }) => {
  console.log("OCR TEXT:", text);
  translateText(text).then(translated => {
  if (!translated || translated.trim() === "") {
    showOverlay("[No translation]");
    return;
  }

  showOverlay(String(translated));
});


});


  });
}
function showOverlay(text) {
  let overlay = document.getElementById("xeno-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "xeno-overlay";
    overlay.style.position = "fixed";
    overlay.style.bottom = "80px";
    overlay.style.right = "10px";
    overlay.style.maxWidth = "400px";
    overlay.style.padding = "10px";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.color = "white";
    overlay.style.fontSize = "14px";
    overlay.style.zIndex = "999999";
    overlay.style.borderRadius = "8px";
    overlay.style.fontFamily = "Arial, sans-serif";

    document.body.appendChild(overlay);
  }

  overlay.innerText = text || "";
}
async function translateText(text) {
  const res = await fetch("http://localhost:3000/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: text,
      targetLang: selectedLanguage
    })
  });

  const data = await res.json();
  return data.translation || "";
}
function createLanguageSelector() {
  let selector = document.getElementById("xeno-language");

  if (selector) return;

  selector = document.createElement("select");
  selector.id = "xeno-language";

  selector.style.position = "fixed";
  selector.style.bottom = "10px";
  selector.style.right = "10px";
  selector.style.zIndex = "999999";
  selector.style.padding = "6px";
  selector.style.borderRadius = "6px";

  const languages = [
    "Spanish",
    "Vietnamese",
    "Japanese",
    "French",
    "German",
    "Chinese"
  ];

  languages.forEach(lang => {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang;
    selector.appendChild(option);
  });

  selector.value = selectedLanguage;

  selector.addEventListener("change", (e) => {
  selectedLanguage = e.target.value;
  localStorage.setItem("xeno-language", selectedLanguage);
});


  document.body.appendChild(selector);
}





