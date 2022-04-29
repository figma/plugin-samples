import React, { useEffect, useRef } from "react";
import logoPng from "./logo.png";
import logoSvg from "./logo.svg?raw";
import "./App.css";

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    console.log(
      JSON.stringify(document.getElementById("figma-style")?.innerText)
    );
  }, []);

  const onCreate = () => {
    const count = Number(inputRef.current?.value || 0);
    parent.postMessage(
      { pluginMessage: { type: "create-rectangles", count } },
      "*"
    );
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  return (
    <div>
      <img className="logo-png" src={logoPng} />
      <img className="logo-svg" src={`data:image/svg+xml;utf8,${logoSvg}`} />
      <h2>Rectangle Creator</h2>
      <p>
        <label htmlFor="input">Count:</label>
        <input id="input" type="number" ref={inputRef} />
      </p>
      <button className="primary" onClick={onCreate}>
        Create
      </button>
      <button className="inverse" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export default App;
