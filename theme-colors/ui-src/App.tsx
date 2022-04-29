import React, { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import "./App.css";
import { buildToken, Token, TOKENS } from "./Token";

export type Rules = { [k: string]: string };

function App() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState<"preview" | "inspect">("preview");
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

  if (!rules) {
    return null;
  }

  const allTokens =
    state === "inspect"
      ? TOKENS.type.reduce<string[]>((list, type) => {
          TOKENS.color.forEach((color) => {
            TOKENS.prominence.forEach((prominence) => {
              TOKENS.state.forEach((state) => {
                const token = buildToken([type, color, prominence, state]);
                if (rules[token]) {
                  list.push(token);
                }
              });
            });
          });
          return list;
        }, [])
      : [];

  const swatch = (color: string) => (
    <span>
      {color} <span className="swatch" style={{ background: color }}></span>
    </span>
  );

  return (
    <>
      <nav>
        <button
          onClick={() => setState("preview")}
          className={state === "preview" ? "active" : ""}
        >
          Preview
        </button>
        <button
          onClick={() => setState("inspect")}
          className={state === "inspect" ? "active" : ""}
        >
          Inspect
        </button>
        {state === "inspect" ? (
          <input
            type="search"
            value={search}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value.trim())
            }
          />
        ) : null}
      </nav>
      <main>
        {state === "preview" ? (
          <>
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
              onChange={(token) =>
                rules[token] ? setTokenBorder(token) : null
              }
              rules={rules}
              type="border"
            />

            <figure
              style={
                {
                  "--local-bg": `var(${tokenBg})`,
                  "--local-text": `var(${tokenText})`,
                  "--local-icon": `var(${tokenIcon})`,
                  "--local-border": `var(${tokenBorder})`,
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
                {swatch(rules[tokenBg])}
              </li>
              <li>
                <span>{tokenText}</span>
                {swatch(rules[tokenText])}
              </li>
              <li>
                <span>{tokenIcon}</span>
                {swatch(rules[tokenIcon])}
              </li>
              <li>
                <span>{tokenBorder}</span>
                {swatch(rules[tokenBorder])}
              </li>
            </ul>
          </>
        ) : (
          <ul className="all-tokens">
            {allTokens.map((key: string) =>
              key.match(search) || rules[key].match(search) ? (
                <li key={key}>
                  {key}
                  {swatch(rules[key])}
                </li>
              ) : null
            )}
          </ul>
        )}
      </main>
    </>
  );
}

export default App;
