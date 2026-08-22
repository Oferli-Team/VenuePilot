import type { VariablesRichTextTerms } from "../types";

export const parseRichText = (
  template: string,
  variables: VariablesRichTextTerms,
) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim();
    if (trimmedKey in variables) {
      const value = variables[trimmedKey as keyof VariablesRichTextTerms];
      return String(value);
    }
    return `{{${key}}}`;
  });
};
