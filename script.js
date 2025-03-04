document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("file-input");
    const imageContainer = document.getElementById("image-container");
    const batchDownloadBtn = document.getElementById("batch-download");
    const saveToDriveBtn = document.getElementById("save-to-drive");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    let convertedImages = [];

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
    });

    dropArea.addEventListener("click", () => fileInput.click());
    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.classList.add("border-blue-500");
    });
    dropArea.addEventListener("dragleave", () => dropArea.classList.remove("border-blue-500"));
    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.classList.remove("border-blue-500");
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

    function handleFiles(files) {
        [...files].forEach(file => convertToWebP(file));
    }

    function convertToWebP(file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const quality = document.getElementById("quality-slider").value;
                const webpUrl = canvas.toDataURL("image/webp", quality);
                convertedImages.push({ name: file.name.replace(/\.[^.]+$/, ""), url: webpUrl });
                
                const imgElement = document.createElement("img");
                imgElement.src = webpUrl;
                imgElement.classList.add("rounded", "shadow-lg", "w-full");
                imageContainer.appendChild(imgElement);

                batchDownloadBtn.classList.remove("hidden");
                saveToDriveBtn.classList.remove("hidden");
            };
        };
    }

    batchDownloadBtn.addEventListener("click", () => {
        if (convertedImages.length === 0) return;
        const zip = new JSZip();
        convertedImages.forEach(img => {
            zip.file(`${img.name}.webp`, img.url.split(",")[1], { base64: true });
        });
        zip.generateAsync({ type: "blob" }).then(content => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = "converted_images.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
});
