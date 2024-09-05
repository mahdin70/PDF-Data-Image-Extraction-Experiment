const fs = require("fs");
const { Document, Packer, Paragraph } = require("docx");

const jsonData = JSON.parse(fs.readFileSync("Texract-JSON/analyzeDocResponse.json", "utf8"));

function findBlockById(blocks, id) {
  return blocks.find((block) => block.Id === id);
}

const paragraphs = [];

function addTextToParagraphs(text) {
  if (text.trim()) {
    paragraphs.push(new Paragraph(text.trim()));
  }
}

jsonData.Blocks.forEach((block) => {
  if (block.BlockType === "LAYOUT_TEXT") {
    const childRelationship = block.Relationships.find((rel) => rel.Type === "CHILD");
    if (childRelationship) {
      let combinedText = "";

      childRelationship.Ids.forEach((childId) => {
        const childBlock = findBlockById(jsonData.Blocks, childId);
        if (childBlock && childBlock.BlockType === "LINE") {
          combinedText += childBlock.Text + " ";
        }
      });

      if (combinedText.trim()) {
        addTextToParagraphs(`LAYOUT_TEXT: ${combinedText.trim()}`);
      }
    }
  } else if (block.BlockType === "LAYOUT_SECTION_HEADER") {
    const childRelationship = block.Relationships.find((rel) => rel.Type === "CHILD");
    if (childRelationship) {
      let sectionHeaderText = "";

      childRelationship.Ids.forEach((childId) => {
        const childBlock = findBlockById(jsonData.Blocks, childId);
        if (childBlock && childBlock.BlockType === "LINE") {
          sectionHeaderText += childBlock.Text + " ";
        }
      });
      if (sectionHeaderText.trim()) {
        addTextToParagraphs(`LAYOUT_SECTION_HEADER: ${sectionHeaderText.trim()}`);
      }
    }
  }
});

const doc = new Document({
  sections: [
    {
      children: paragraphs,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("output.docx", buffer);
  console.log("Document created successfully!");
});
