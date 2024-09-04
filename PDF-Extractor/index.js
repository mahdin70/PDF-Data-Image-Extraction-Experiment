const fs = require("fs");
const pdfParse = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");
const docx = require("docx");
const { Document, Packer, Paragraph, ImageRun, PageBreak } = docx;

async function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  return data.text.split("\n\n");
}

async function extractImagesFromPDF(pdfPath) {
  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  const images = [];
  for (const page of pages) {
    const xObjects = page.node.Resources.XObject;
    if (xObjects) {
      for (let key in xObjects) {
        const xObject = xObjects[key];
        if (xObject.constructor.name === "PDFImageXObject") {
          const imgBytes = await xObject.image.decode();
          images.push(imgBytes);
        }
      }
    }
  }
  return images;
}

async function createWordDoc(texts, images) {
  const doc = new Document({
    sections: texts.map((pageText, index) => ({
      children: [
        new Paragraph(pageText),
        ...(images[index] || []).map(
          (imageBytes) =>
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBytes,
                  transformation: { width: 500, height: 400 },
                }),
              ],
            })
        ),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    })),
  });

  try {
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync("output/converted_document2.docx", buffer);
    console.log("Word document created successfully.");
  } catch (error) {
    console.error("Error creating Word document:", error);
  }
}

async function convertPdfToDocx(pdfFileName) {
  const pdfPath = `pdfs/${pdfFileName}`;

  const texts = await extractTextFromPDF(pdfPath);
  const images = await extractImagesFromPDF(pdfPath);

  while (images.length < texts.length) {
    images.push([]);
  }

  await createWordDoc(texts, images);
}

const pdfFileName = "PDF-2.pdf";
convertPdfToDocx(pdfFileName);
