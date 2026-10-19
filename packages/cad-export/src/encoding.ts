import { type DxfEncoding } from "./types.js";

export function encodeDxfText(text: string, encoding?: DxfEncoding): string {
  const isUtf8 = encoding === "utf8";
  if (isUtf8) {
    return text.replace(/[\r\n\t]+/g, " ");
  }

  let encoded = "";
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 32 && code <= 126) {
      encoded += char;
    } else if (code === 10 || code === 13 || code === 9) {
      encoded += " ";
    } else {
      const hex = code.toString(16).toUpperCase().padStart(4, "0");
      encoded += `\\U+${hex}`;
    }
  }
  return encoded;
}
