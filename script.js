// DOMContentLoaded wrapper
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", (e) => e.preventDefault());

  const signatureInput = document.getElementById("signatureInput");
  const submitButton = document.getElementById("submitFeedback");
  const signatureBox = document.getElementById("signaturePreview");

  // Signature Modal
  let signatureModal = document.createElement("div");
  signatureModal.id = "signatureModal";
  signatureModal.classList.add("modal");
  signatureModal.innerHTML = `
    <div class="modal-content">
        <span class="close">&times;</span>
        <h3>Draw Your Signature</h3>
        <canvas id="signatureCanvas" width="400" height="200"></canvas>
        <br>
        <button id="clearSignature" type="button">Clear</button>
        <button id="saveSignature" type="button">💾 Save</button>
        <p id="saveNotification" style="display:none; color:green; font-weight:bold;">✅ Signature Saved!</p>
    </div>
  `;
  document.body.appendChild(signatureModal);

  const canvas = document.getElementById("signatureCanvas");
  const ctx = canvas.getContext("2d");
  const clearBtn = document.getElementById("clearSignature");
  const saveBtn = document.getElementById("saveSignature");
  const closeBtn = signatureModal.querySelector(".close");
  const saveNotification = document.getElementById("saveNotification");

  let drawing = false;
  let hasDrawn = false;

  // Signature line thickness and appearance
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  signatureInput.addEventListener("click", () => signatureModal.style.display = "block");
  closeBtn.addEventListener("click", () => signatureModal.style.display = "none");

  window.addEventListener("click", (e) => {
    if (!signatureModal.contains(e.target) && e.target !== signatureInput) {
      signatureModal.style.display = "none";
    }
  });

  function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener("mousedown", (e) => {
    drawing = true; hasDrawn = true;
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (drawing) {
      const pos = getPosition(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  });

  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mouseout", () => drawing = false);

  canvas.addEventListener("touchstart", (e) => {
    drawing = true; hasDrawn = true;
    const touch = e.touches[0];
    const pos = getPosition(touch);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });

  canvas.addEventListener("touchmove", (e) => {
    if (drawing) {
      const touch = e.touches[0];
      const pos = getPosition(touch);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      e.preventDefault();
    }
  });

  canvas.addEventListener("touchend", () => drawing = false);

  clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn = false;
    saveNotification.style.display = "none";
    signatureInput.value = "";
    signatureInput.removeAttribute("data-signature");
    signatureBox.innerHTML = "";
  });

  saveBtn.addEventListener("click", () => {
    if (!hasDrawn) {
      alert("⚠️ Please draw your signature before saving.");
      return;
    }

    const data = canvas.toDataURL("image/png");
    signatureInput.value = "Signature Saved";
    signatureInput.setAttribute("data-signature", data);
    signatureInput.style.display = "none";

    signatureBox.innerHTML = "";
    const img = document.createElement("img");
    img.src = data;
    img.alt = "Saved Signature";
    img.style.height = "35px";
    img.style.objectFit = "contain";
    img.style.display = "block";
    img.style.margin = "auto";
    signatureBox.appendChild(img);

    signatureModal.style.display = "none";
    saveNotification.style.display = "block";
    setTimeout(() => saveNotification.style.display = "none", 2000);
  });

  const feedbackModal = document.getElementById("feedbackModal");
  const feedbackInput = document.getElementById("feedbackInput");
  const saveFeedbackBtn = document.getElementById("saveFeedback");
  const modalClose = feedbackModal.querySelector(".close");
  let currentFeedbackField = null;

  modalClose.addEventListener("click", () => {
    feedbackModal.style.display = "none";
    feedbackInput.value = "";
    currentFeedbackField = null;
  });

  window.addEventListener("click", (e) => {
    if (e.target === feedbackModal) {
      feedbackModal.style.display = "none";
      feedbackInput.value = "";
      currentFeedbackField = null;
    }
  });

  feedbackInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") e.preventDefault();
  });

  document.querySelectorAll(".quantitative-score").forEach((input) => {
    input.addEventListener("change", () => {
      const score = parseInt(input.value);
      const qualInput = input.closest("tr").nextElementSibling.querySelector(".qualitative-feedback");
      qualInput.placeholder = "Your feedback appears here";
      qualInput.value = "";

      if (score < 8) {
        currentFeedbackField = qualInput;
        feedbackInput.value = qualInput.value || "";
        feedbackModal.style.display = "block";
        qualInput.setAttribute("required", "true");
        qualInput.classList.add("mandatory-label");
      }
    });
  });

  document.querySelectorAll(".edit-icon").forEach(icon => {
    icon.addEventListener("click", () => {
      const targetId = icon.getAttribute("data-target");
      const field = document.getElementById(targetId);
      if (!field) return;

      currentFeedbackField = field;
      feedbackInput.value = field.value || "";
      feedbackModal.style.display = "block";
    });
  });

  saveFeedbackBtn.addEventListener("click", () => {
    if (currentFeedbackField) {
      currentFeedbackField.value = feedbackInput.value.trim();
      feedbackModal.style.display = "none";
    }
  });

document.querySelectorAll(".qualitative-feedback").forEach(area => {
  if (!area.value.trim() || area.value.trim() === "Your feedback appears here") {
    area.value = ""; // completely blank
  }


  });

  submitButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const missingFields = [];
    const quantitativeRows = [...document.querySelectorAll(".feedback-row")];

    quantitativeRows.forEach((row, index) => {
      const scoreEl = row.querySelector(".quantitative-score:checked");
      const scoreVal = scoreEl ? parseInt(scoreEl.value) : null;
      const commentField = row.nextElementSibling?.querySelector(".qualitative-feedback");
      const desc = row.querySelector("td:nth-child(2)")?.innerText || `Row ${index + 1}`;

      if (!scoreEl) {
        missingFields.push(`Quantitative score missing for: ${desc}`);
        row.querySelectorAll(".quantitative-score").forEach(radio =>
          radio.closest("td")?.style?.setProperty("outline", "2px solid red")
        );
        return;
      }

      if (scoreVal < 8 && (!commentField || !commentField.value.trim())) {
        missingFields.push(`Qualitative feedback required for: ${desc}`);
        commentField?.classList.add("mandatory-label");
      }
    });

    const signatureData = signatureInput.getAttribute("data-signature");
    if (!signatureData) {
      alert("⚠️ Signature is required before submission.");
      return;
    }

    if (missingFields.length > 0) {
      alert(`⚠️ Please fill in all mandatory fields:\n${[...new Set(missingFields)].join("\n")}`);
      return;
    }

  
    

    signatureBox.innerHTML = "";
    const img = document.createElement("img");
    img.src = signatureData;
    img.alt = "Signature";
    img.style.height = "35px";
    img.style.objectFit = "contain";
    img.style.display = "block";
    img.style.margin = "auto";
    signatureBox.appendChild(img);

    signatureInput.style.display = "none";

    await new Promise((resolve) =>
    setTimeout(resolve, 300));
    const element = document.getElementById("form-border");
    document.querySelectorAll(".qualitative-feedback").forEach(input => {
    if (
      input.value.trim() === "" ||
      input.value.trim() === "Your feedback appears here"
    ) {
      input.value = " "; // Clean blank space
    }
  });

  // Hide all pencil icons before generating PDF
  document.querySelectorAll(".edit-icon").forEach(icon => {
    icon.style.visibility = "hidden";
  });
    const opt = {
      margin: 0,
      filename: 'ICSS Feedback_Form.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, scrollY: 0, useCORS: true },
      jsPDF: { unit: 'px', format: [1400, 1450], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      form.reset();
      document.querySelectorAll("input[type='radio']").forEach(radio => radio.checked = false);
      document.querySelectorAll("textarea").forEach(area => area.value = "");

      signatureInput.value = "";
      signatureInput.removeAttribute("data-signature");
      signaturePreview.innerHTML = "";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.hasDrawn = false;
    });
  });
});
