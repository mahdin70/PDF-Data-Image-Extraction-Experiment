const fs = require("fs");
const path = require("path");

const inputFilePath = path.join(__dirname, "Texract-JSON", "LayoutAnalyzeDocResponse.json");
const data = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));

function getBlockById(id) {
  return data.Blocks.find((block) => block.Id === id);
}

function renderBlock(block) {
  if (block.BlockType === "WORD" || block.BlockType === "KEY_VALUE_SET" || block.BlockType === "LINE") return "";

  if (block.Relationships) {
    const childIds = block.Relationships.filter((rel) => rel.Type === "CHILD").flatMap((rel) => rel.Ids);

    const childLineText = childIds
      .map((id) => getBlockById(id))
      .filter((childBlock) => childBlock && childBlock.BlockType === "LINE")
      .map((lineBlock) => lineBlock.Text || "")
      .join(" ");

    return `<div style="border: 1px solid black; margin: 5px; padding: 5px;">
              <strong>${block.BlockType}</strong><br>
              ${block.Text || ""} ${childLineText}
            </div>`;
  }

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
          const childHtml = renderBlocks(childIds);
          if (childHtml.trim() !== "") {
            html += '<div style="padding-left: 20px;">' + childHtml + "</div>";
          }
        }
      }

      return html.trim() !== "" ? html : "";
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
  .join('<div style="background-color: black; height: 10px; margin: 10px 0;"></div>');

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
    ${pagesContent}
</body>
</html>
`;

const outputFilePath = path.join(__dirname, "Output-HTML", "OnlyLayoutOutput7.html");
fs.writeFileSync(outputFilePath, outputHtml, "utf8");

console.log(`HTML file generated at: ${outputFilePath}`);
