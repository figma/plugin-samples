import React, { FC, useEffect, useState } from "react";
import { Rules } from "./App";
export const TOKENS = {
  type: ["bg", "text", "icon", "border"],
  color: [
    "default",
    "brand",
    "selected",
    "disabled",
    "component",
    "danger",
    "warning",
    "success",
    "inverse",
    "onbrand",
    "onselected",
    "ondisabled",
    "oncomponent",
    "ondanger",
    "onwarning",
    "onsuccess",
    "oninverse",
  ],
  prominence: ["default", "strong", "secondary", "tertiary"],
  state: ["default", "hover", "pressed"],
};

export const buildToken = (args: string[]) =>
  `--figma-color-${args.filter((a) => a !== "default").join("-")}`;

export const Token: FC<{
  onChange(token: string): void;
  rules: Rules;
  type: "bg" | "text" | "border" | "icon";
}> = ({ onChange, rules, type }) => {
  const [color, setColor] = useState(TOKENS.color[0]);
  const [prominence, setProminence] = useState(TOKENS.prominence[0]);
  const [state, setState] = useState(TOKENS.state[0]);
  const [valid, setValid] = useState(true);

  const token = buildToken([type, color, prominence, state]);

  useEffect(() => {
    onChange(token);
    setValid(Boolean(rules[token]));
  }, [token]);

  const disabled = (args: string[]) => !Boolean(rules[buildToken(args)]);
  const colors: [string, boolean][] = TOKENS.color.map((t) => [
    t,
    disabled([type, t, prominence, state]),
  ]);
  const prominences: [string, boolean][] = TOKENS.prominence.map((t) => [
    t,
    disabled([type, color, t, state]),
  ]);
  const states: [string, boolean][] = TOKENS.state.map((t) => [
    t,
    disabled([type, color, prominence, t]),
  ]);

  return (
    <div className={`token-row ${valid ? "valid" : "invalid"}`}>
      <span>
        <label>type</label>
        {type}
      </span>
      <span>
        <label>color</label>
        <select
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
          }}
        >
          {colors.map(([token, disabled]) => (
            <option key={token} value={token} disabled={disabled}>
              {token}
            </option>
          ))}
        </select>
      </span>
      <span>
        <label>prominence</label>
        <select
          value={prominence}
          onChange={(e) => {
            setProminence(e.target.value);
          }}
        >
          {prominences.map(([token, disabled]) => (
            <option key={token} value={token} disabled={disabled}>
              {token}
            </option>
          ))}
        </select>
      </span>
      <span>
        <label>state</label>
        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
          }}
        >
          {states.map(([token, disabled]) => (
            <option key={token} value={token} disabled={disabled}>
              {token}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
};
