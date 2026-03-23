if (figma.editorType === "dev") {
  if (figma.mode === "inspect") {
    figma.showUI(__html__); // Ensure you define __html__ in your plugin UI
  } else if (figma.mode === "codegen") {
    figma.codegen.on("generate", () => {
      return [
        { title: "Codegen", code: "This is codegen!", language: "PLAINTEXT" }
      ];
    });
  }
} else if (figma.editorType === "figma") {
  figma.showUI(__html__); // Ensure you reference a proper HTML file
}
