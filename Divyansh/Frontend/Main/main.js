const generateBtn = document.querySelector(".generate");
const copyBtn = document.querySelector(".copy");
const chapterInput = document.getElementById("chapter-input");
const noteFormat = document.getElementById("note-format");
const outputCard = document.querySelector(".card:nth-of-type(2)");
const placeholder = outputCard.querySelector(".placeholder");

let resultDiv = document.createElement("div");
resultDiv.id = "result";
outputCard.appendChild(resultDiv);

resultDiv.style.display = "none";

generateBtn.addEventListener("click", async () => {
  const text = chapterInput.value.trim();
  const format = noteFormat.value;

  if (!text) {
    alert("Please paste some chapter content.");
    return;
  }

  placeholder.style.display = "none";
  resultDiv.style.display = "block";
  resultDiv.innerHTML = "⏳ Generating notes...";

  try {
    const response = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        format: format
      }),
    });

    const data = await response.json();

    if (data && data.notes) {
      resultDiv.innerText = data.notes;
    } else {
      resultDiv.innerText = "❌ Failed to generate notes.";
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerText = "⚠️ Error: Could not connect to server.";
  }
});

copyBtn.addEventListener("click", () => {
  const notes = resultDiv.innerText;
  if (notes) {
    navigator.clipboard.writeText(notes);
    copyBtn.innerText = "✅ Copied!";
    setTimeout(() => {
      copyBtn.innerText = "📋 Copy";
    }, 1500);
  }
});

document.getElementById("pdf-input").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsArrayBuffer(file);

  reader.onload = async function () {
    const typedarray = new Uint8Array(reader.result);

    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str).join(" ");
      fullText += text + "\n";
    }

    document.getElementById("chapter-input").value = fullText;
  };
});

document.getElementById("pdf-input").addEventListener("change", function () {
  const fileName = this.files.length ? this.files[0].name : "No file selected";
  document.getElementById("file-name").textContent = fileName;
});
