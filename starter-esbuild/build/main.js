(() => {
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/main.ts
  var require_main = __commonJS({
    "src/main.ts"(exports) {
      figma.ui.onmessage = (numbers) => __async(exports, null, function* () {
        yield figma.loadFontAsync({ family: "Roboto", style: "Regular" });
        const frameWidth = 800;
        const frameHeight = 600;
        const chartX = 25;
        const chartY = 50;
        const chartWidth = frameWidth - 50;
        const chartHeight = frameHeight - 50;
        const frame = figma.createFrame();
        frame.resizeWithoutConstraints(frameWidth, frameHeight);
        frame.x = figma.viewport.center.x - frameWidth / 2;
        frame.y = figma.viewport.center.y - frameHeight / 2;
        const border = figma.createRectangle();
        frame.appendChild(border);
        border.resizeWithoutConstraints(frameWidth, frameHeight);
        border.strokeAlign = "INSIDE";
        border.strokeWeight = 3;
        border.fills = [];
        border.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
        border.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
        const line = figma.createRectangle();
        frame.appendChild(line);
        line.x = chartX;
        line.y = chartY + chartHeight;
        line.resizeWithoutConstraints(chartWidth, 3);
        line.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
        line.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
        const min = numbers.reduce((a, b) => Math.min(a, b), 0);
        const max = numbers.reduce((a, b) => Math.max(a, b), 0);
        for (let i = 0; i < numbers.length; i++) {
          const num = numbers[i];
          const left = chartX + chartWidth * (i + 0.25) / numbers.length;
          const right = chartX + chartWidth * (i + 0.75) / numbers.length;
          const top = chartY + chartHeight - chartHeight * (Math.max(0, num) - min) / (max - min);
          const bottom = chartY + chartHeight - chartHeight * (Math.min(0, num) - min) / (max - min);
          const column = figma.createRectangle();
          frame.appendChild(column);
          column.x = left;
          column.y = top;
          column.resizeWithoutConstraints(right - left, bottom - top);
          column.fills = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
          column.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
          const label = figma.createText();
          frame.appendChild(label);
          label.x = left - 50;
          label.y = top - 50;
          label.resizeWithoutConstraints(right - left + 100, 50);
          label.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
          label.characters = num.toString();
          label.fontSize = 30;
          label.textAlignHorizontal = "CENTER";
          label.textAlignVertical = "BOTTOM";
          label.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
        }
        figma.closePlugin();
      });
      function multiply(a, b) {
        return [
          [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1], a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2]],
          [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1] + 0, a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2]]
        ];
      }
      function move(x, y) {
        return [
          [1, 0, x],
          [0, 1, y]
        ];
      }
      function rotate(theta) {
        return [
          [Math.cos(theta), Math.sin(theta), 0],
          [-Math.sin(theta), Math.cos(theta), 0]
        ];
      }
      function main() {
        return __async(this, null, function* () {
          yield figma.loadFontAsync({ family: "Roboto", style: "Regular" });
          if (figma.currentPage.selection.length !== 1) {
            return "Select a single node.";
          }
          const node = figma.currentPage.selection[0];
          if (node.type !== "TEXT") {
            return "Select a single text node.";
          }
          const text = node.characters.replace(/ /g, " ");
          let gap = 5;
          const nodes = [];
          let width = 0;
          for (let i = 0; i < text.length; i++) {
            const letterNode = figma.createText();
            letterNode.fontSize = node.fontSize;
            letterNode.fontName = node.fontName;
            letterNode.characters = text.charAt(i);
            width += letterNode.width;
            if (i !== 0) {
              width += gap;
            }
            node.parent.appendChild(letterNode);
            nodes.push(letterNode);
          }
          const r = node.width / 2 - 30;
          const pi = 3.1415926;
          let angle = pi / 2 + width / (2 * r);
          const gapAngle = gap / r;
          const centerX = node.x + node.width / 2;
          const centerY = node.y + node.height / 2;
          nodes.forEach(function(letterNode) {
            const stepAngle = letterNode.width / r;
            angle -= stepAngle / 2;
            let width2 = letterNode.width;
            let height = letterNode.height;
            letterNode.x = 0;
            letterNode.y = 0;
            letterNode.relativeTransform = multiply(move(-width2 / 2, -0.7 * height), letterNode.relativeTransform);
            letterNode.relativeTransform = multiply(rotate(angle - pi / 2), letterNode.relativeTransform);
            let desiredX = centerX + r * Math.cos(angle);
            let desiredY = centerY - r * Math.sin(angle);
            letterNode.relativeTransform = multiply(move(desiredX, desiredY), letterNode.relativeTransform);
            angle -= stepAngle / 2 + gapAngle;
          });
          figma.group(nodes, node.parent);
        });
      }
      main().then((message) => {
        figma.closePlugin(message);
      });
    }
  });
  require_main();
})();
