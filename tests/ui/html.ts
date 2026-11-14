export class HTMLBlock {
  innerHTML: string;
  constructor(html: string) {
    this.innerHTML = html;
  }
  toString() {
    return this.innerHTML;
  }
}

const renderSync = (value: any) => {
  let _value: any = value;
  if (value == null || value == undefined) {
    _value = "";
  } else if (typeof value === "function") {
    _value = renderSync(value());
  } else if (Array.isArray(value)) {
    _value = value.reduce((s, v) => s + renderSync(v), "");
  } else if (value instanceof HTMLBlock) {
    _value = value.innerHTML;
  }
  return _value;
};

const render = async (value: any) => {
  let _value: any = value;
  if (value == null || value == undefined) {
    _value = "";
  } else if (typeof value === "function") {
    _value = render(value());
  } else if (Array.isArray(value)) {
    let _string = "";
    for (const v of value) _string += await render(v);
    _value = _string;
  } else if (value instanceof HTMLBlock) {
    _value = value.innerHTML;
  }
  return _value;
};

export const htmlAsync = async (strings: TemplateStringsArray, ...values: any[]) => {
  let string: string = strings[0].trimStart();
  for (let i = 0; i < values.length; i++) {
    const value: any = await render(values[i]);
    string += value + strings[i + 1];
  }
  return new HTMLBlock(string.trimEnd());
};

export const htmlSync = (strings: TemplateStringsArray, ...values: any[]) => {
  let string: string = strings[0].trimStart();
  for (let i = 0; i < values.length; i++) {
    const value: any = renderSync(values[i]);
    string += value + strings[i + 1];
  }
  return new HTMLBlock(string.trimEnd());
};
