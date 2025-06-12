const upload = document.getElementById("upload");
const output = document.getElementById("compressed-output");
const reportOutput = document.getElementById("report-output");

upload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    // Temporarily just show the original image
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8); // Simulated compression
    output.src = dataUrl;

    reportOutput.textContent = JSON.stringify(
      {
        width: img.width,
        height: img.height,
        originalSize: file.size,
        simulatedCompressedSize: Math.floor(dataUrl.length * 0.75), // Approximate
      },
      null,
      2
    );
  };

  img.src = URL.createObjectURL(file);
});
