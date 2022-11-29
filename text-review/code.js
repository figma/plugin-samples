const find = "figma";
const suggestion = "✨Figma✨";
const color = "GREEN";

if (figma.command === "textreview") {
  figma.on("textreview", async ({ text }) => {
    const chunks = text
      .replace(new RegExp(suggestion, "g"), suggestion.replace(/./g, "x"))
      .toLowerCase()
      .split(find);
    let end = 0;
    return chunks
      .map((string, i) => {
        if (i === chunks.length - 1) return null;
        const start = end + string.length;
        end = start + find.length;
        return { start, end, suggestions: [suggestion], color };
      })
      .filter(Boolean);
  });
} else {
  figma.notify("I am running like any other plugin!");
  figma.closePlugin();
}
