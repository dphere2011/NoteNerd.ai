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

const fileInput = document.getElementById("file-upload");
const fileNameSpan = document.getElementById("file-filename");

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  fileNameSpan.innerText = `📄 ${file.name}`;
  const extension = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();

  if (extension === "pdf") {
    reader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n\n";
      }

      chapterInput.value = text.trim();
    };
    reader.readAsArrayBuffer(file);
  }

  else if (extension === "txt") {
    reader.onload = function () {
      chapterInput.value = this.result.trim();
    };
    reader.readAsText(file);
  }

  else if (extension === "docx") {
    reader.onload = async function () {
      mammoth.extractRawText({ arrayBuffer: this.result })
        .then(result => {
          chapterInput.value = result.value.trim();
        })
        .catch(() => {
          chapterInput.value = "❌ Could not read DOCX file.";
        });
    };
    reader.readAsArrayBuffer(file);
  }

  else if (extension === "xlsx") {
    reader.onload = function () {
      const workbook = XLSX.read(this.result, { type: "binary" });
      let allText = "";
      workbook.SheetNames.forEach(sheet => {
        const data = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet]);
        allText += data + "\n";
      });
      chapterInput.value = allText.trim();
    };
    reader.readAsBinaryString(file);
  }

  else if (extension === "pptx") {
    reader.onload = async function () {
      try {
        const text = await pptxParser.parse(this.result);
        chapterInput.value = text.trim();
      } catch (err) {
        console.error(err);
        chapterInput.value = "❌ Could not read PPTX file.";
      }
    };
    reader.readAsArrayBuffer(file);
  }

  else {
    chapterInput.value = "❌ Unsupported file format.";
  }
});

