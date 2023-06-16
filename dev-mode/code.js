if (figma.editorType === "dev") {
  if (figma.mode === "inspect") {
    figma.showUI("<h1>This is Dev Mode!</h1>");
  } else if (figma.mode === "codegen") {
    figma.codegen.on("generate", () => [
      { title: "Codegen", code: "This is codegen!", language: "PLAINTEXT" },
    ]);
  }
} else if (figma.editorType === "figma") {
  figma.showUI("<h1>This is Figma!</h1>");
}
