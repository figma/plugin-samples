if (figma.command === "textreview") {
  figma.on("textreview", ({ text }) => {
    // Replacing "✨Figma✨" with "xxxxxxx" so we don't highlight "✨Figma✨"
    const cleanText = text.replace(/✨Figma✨/g, "xxxxxxx");
    const matches = Array.from(cleanText.matchAll(/figma/gi));
    return matches.map((match) => ({
      start: match.index,
      end: match.index + match[0].length,
      suggestions: ["✨Figma✨"],
      color: "GREEN",
    }));
  });
} else {
  figma.notify("I am running like any other plugin!");
  figma.closePlugin();
}
