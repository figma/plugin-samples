import React, { CSSProperties, useEffect, useState } from "react";
import "./App.css";
import { Token } from "./Token";

export type Rules = { [k: string]: string };

function App() {
  const [rules, setRules] = useState<Rules>();
  const [tokenBg, setTokenBg] = useState<string>("--figma-color-bg");
  const [tokenText, setTokenText] = useState<string>("--figma-color-text");
  const [tokenIcon, setTokenIcon] = useState<string>("--figma-color-icon");
  const [tokenBorder, setTokenBorder] = useState<string>(
    "--figma-color-border"
  );

  useEffect(() => {
    const { sheet } =
      (document.getElementById("figma-style") as HTMLStyleElement) || {};
    if (sheet && sheet.cssRules) {
      const rules = [...sheet.cssRules].filter(
        (a) => a.STYLE_RULE === 1
      ) as CSSStyleRule[];
      rules.forEach((rule) => {
        const rules = Object.values(rule.style).reduce<{
          [k: string]: string;
        }>((object, k: string) => {
          k ? (object[k] = rule.style.getPropertyValue(k).trim()) : null;
          return object;
        }, {});
        setRules(rules);
      });
    }
  }, []);

  return rules ? (
    <main>
      <Token
        onChange={(token) => (rules[token] ? setTokenBg(token) : null)}
        rules={rules}
        type="bg"
      />
      <Token
        onChange={(token) => (rules[token] ? setTokenText(token) : null)}
        rules={rules}
        type="text"
      />
      <Token
        onChange={(token) => (rules[token] ? setTokenIcon(token) : null)}
        rules={rules}
        type="icon"
      />
      <Token
        onChange={(token) => (rules[token] ? setTokenBorder(token) : null)}
        rules={rules}
        type="border"
      />

      <figure
        style={
          {
            "--bg": `var(${tokenBg})`,
            "--text": `var(${tokenText})`,
            "--icon": `var(${tokenIcon})`,
            "--border": `var(${tokenBorder})`,
          } as CSSProperties
        }
      >
        <svg height="50" width="50" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" />
        </svg>
        <p>This is the text!</p>
      </figure>

      <ul>
        <li>
          <span>{tokenBg}</span>
          <span>{rules[tokenBg]}</span>
        </li>
        <li>
          <span>{tokenText}</span>
          <span>{rules[tokenText]}</span>
        </li>
        <li>
          <span>{tokenIcon}</span>
          <span>{rules[tokenIcon]}</span>
        </li>
        <li>
          <span>{tokenBorder}</span>
          <span>{rules[tokenBorder]}</span>
        </li>
      </ul>
    </main>
  ) : null;
}

export default App;
