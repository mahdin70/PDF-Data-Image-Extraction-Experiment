const fs = require("fs");
const path = require("path");

const inputFilePath = path.join(__dirname, "Texract-JSON", "analyzeDocResponse.json");
const data = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));

function getBlockById(id) {
  return data.Blocks.find((block) => block.Id === id);
}

function renderBlock(block) {
  if (block.BlockType === "WORD" || block.BlockType === "KEY_VALUE_SET") return "";

  return `<div style="border: 1px solid black; margin: 5px; padding: 5px;">
                <strong>${block.BlockType}</strong><br>
                ${block.Text || ""}
            </div>`;
}

function renderBlocks(blockIds) {
  return blockIds
    .map((id) => {
      const block = getBlockById(id);
      if (!block) return "";

      let html = renderBlock(block);

      if (block.Relationships) {
        const childIds = block.Relationships.filter((rel) => rel.Type === "CHILD").flatMap((rel) => rel.Ids);
        if (childIds.length > 0) {
          html += '<div style="padding-left: 20px;">' + renderBlocks(childIds) + "</div>";
        }
      }

      return html;
    })
    .join("");
}

function renderPage(pageBlock) {
  if (!pageBlock || !pageBlock.Relationships) return "No PAGE block found";
  return renderBlocks(pageBlock.Relationships[0].Ids);
}

const pageBlocks = data.Blocks.filter((block) => block.BlockType === "PAGE");
const pagesContent = pageBlocks
  .map((pageBlock) => renderPage(pageBlock))
  .join('<div style="background-color: black; height: 20px; margin: 10px 0;"></div>');

const outputHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blocks</title>
    <style>
        body { font-family: Arial, sans-serif; }
    </style>
</head>
<body>
    <h1>Blocks</h1>
    ${pagesContent}
</body>
</html>
`;

const outputFilePath = path.join(__dirname, "Texract-JSON", "LayoutExceptWord.html");
fs.writeFileSync(outputFilePath, outputHtml, "utf8");

console.log(`HTML file generated at: ${outputFilePath}`);
