// ==================================================
// GLOBAL SETTINGS
// ==================================================
const backendURL = window.location.origin;
// Ex: http://localhost:5050 (lokalt)
// Ex: https://dela.maskin-developments.dev (i produktion)

// ==================================================
// FILUPPLADDNING
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("upload-form");

    if (uploadForm) {
        uploadForm.addEventListener("submit", handleFileUpload);
    }
});

async function handleFileUpload(e) {
    e.preventDefault();

    const filesInput = document.getElementById("files");
    const noteInput = document.getElementById("note");

    if (!filesInput || filesInput.files.length === 0) {
        alert("Du måste välja minst en fil att ladda upp.");
        return;
    }

    // FormData skickas till backend
    const formData = new FormData();
    for (const file of filesInput.files) {
        formData.append("files", file);
    }

    if (noteInput && noteInput.ariaValueMax.trim() !== "") {
        formData.append("note", noteInput.ariaValueMax.trim());
    }

    // Visa loading-state
    showLoadingState(true);

    try {
        const res = await fetch(`${backendURL}/api/upload`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            throw new Error("Något gick fel vid uppladdningen.");
        }

        const data = await res.json();

        if (!data.links || !Array.isArray(data.links)) {
            throw new Error("Backend returnerade ingen giltig respons.");
        }

        displayUploadLinks(data.links);
    } catch (error) {
        console.error("Upload error:", error);
        alert("Kunde inte ladda upp filer. Försök igen.");
    }

    // Ta bort loading-state
    showLoadingState(false);
}


// ==================================================
// VISA LÄNKAR EFTER UPLOAD
// ==================================================

function displayUploadLinks(links) {
    const resultBox = document.getElementById("upload-result");
    const linksList = document.getElementById("links-list");

    if (!resultBox || !linksList) return;

    linksList.innerHTML = "";

    links.forEach(link => {
        const li = document.createElement("li");
        li.innerHTML = `
        <a href="${link}" target="_blank">${link}</a>
        `;
        linksList.appendChild(li);
    });

    // Visa resultatboxen
    resultBox.classList.remove("hidden");
}

// ================================================
// LOADING STATE
// ================================================

function showLoadingState(active) {
    const btn = document.querySelector(".btn.primary");

    if (!btn) return; 

    if (active) {
        btn.disabled = true;
        btn.innerText = "Laddar...";
        btn.classList.add("loading");
    } else {
        btn.disabled = false;
        btn.innerText = "Ladda upp";
        btn.classList.remove("loading");
    }
}