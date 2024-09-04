const fs = require("fs");
const path = require("path");
const PdfExtractor = require("pdf-extractor").PdfExtractor;

const outputDir = path.join(__dirname, "output");
const pdfPath = path.join(__dirname, "pdfs", "PDF-1.pdf");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pdfExtractor = new PdfExtractor(outputDir, {
  viewportScale: (width, height) => {
    if (width > height) {
      return 1100 / width;
    }
    return 800 / width;
  },
  pageRange: [1, 5],
});

pdfExtractor
  .parse(pdfPath)
  .then(() => {
    console.log("Extraction completed.");
  })
  .catch((err) => {
    console.error("Error: " + err);
  });
