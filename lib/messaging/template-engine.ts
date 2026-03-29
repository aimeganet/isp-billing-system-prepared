type Variables = Record<string, string | number | null | undefined>;

export function renderTemplate(content: string, variables: Variables) {
  return content.replace(/\{(.*?)\}/g, (_, key) => {
    const value = variables[key];
    return value === null || value === undefined ? "" : String(value);
  });
}
