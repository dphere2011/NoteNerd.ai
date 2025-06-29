// ========== AI Note Generation ==========
document.querySelector(".generate").addEventListener("click", async () => {
  const input = document.getElementById("chapter-input");
  const text = input.value.trim();
  const format = document.getElementById("note-format").value;
  const output = document.querySelector(".placeholder");

  if (!text) {
    alert("📄 Please paste some text or upload a PDF.");
    return;
  }

  output.innerHTML = "⏳ Generating notes...";
  output.style.overflowY = "auto";

  try {
    const response = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, format }),
    });

    const data = await response.json();

    output.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word;">${data.notes}</pre>`;
  } catch (err) {
    console.error(err);
    output.innerHTML = "❌ Failed to generate notes. Please check the server or try again.";
  }
});

// ========== Copy Button ==========
document.querySelector(".copy").addEventListener("click", () => {
  const text = document.querySelector(".placeholder").innerText;
  if (!text || text.includes("No notes")) {
    alert("📝 Nothing to copy yet!");
    return;
  }

  navigator.clipboard.writeText(text);
  alert("✅ Notes copied to clipboard!");
});

// ========== PDF Upload & Parsing ==========
document.getElementById("pdf-input").addEventListener("change", async function () {
  const file = this.files[0];
  const fileName = file ? file.name : "No file selected";
  document.getElementById("file-name").textContent = fileName;

  if (!file || file.type !== "application/pdf") {
    alert("❌ Please upload a valid PDF file.");
    return;
  }

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
