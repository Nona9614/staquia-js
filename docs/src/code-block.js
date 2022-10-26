function _econcat(node, element) {
    let val;
    if (typeof element === "number") {
        val = document.createElement("span");
        val.innerText = element;
        val.classList.add("number");
    }
    else if (typeof element === "string") {
        val = document.createElement("span");
        val.innerText = element;
        val.classList.add("string");
    }
    else val = element;
    node.appendChild(val);
}

function econcat(node, elements, separator = "") {
    const _node = node ?? document.createElement("span");
    _econcat(_node, elements[0]);
    for (let i = 1; i < elements.length; i++) {
        _node.append(separator);
        const element = elements[i];
        _econcat(_node, element);
    }
    return _node;
}

function eplain(value) {
    const span = document.createElement("span");
    span.innerText = value;
    container.appendChild(span);
    return span;
}

function edot() {
    const span = document.createElement("span");
    span.innerText = ".";
    container.appendChild(span);
    return span;
}

function eclass(value) {
    const span = document.createElement("span");
    span.classList.add("classes");
    span.innerText = value;
    container.appendChild(span);
    return span;
}

function esurround(values, before, after, separator = "") {
    const span = document.createElement("span");
    span.append(before);
    econcat(span, values, separator);
    span.append(after);
    container.appendChild(span);
    return span;
}

function ecomment(comment) {
    const p = document.createElement("p");
    p.classList.add("comment");
    p.innerText = comment;
    container.appendChild(p);
    return p;
}

function elet(variable) {
    const span = document.createElement("span");
    span.classList.add("let");
    span.innerText = variable;
    container.appendChild(span);
    return span;
}

function estring(value) {
    const span = document.createElement("span");
    span.classList.add("string");
    span.innerText = value;
    container.appendChild(span);
    return span;
}

function efunction(name, ...args) {
    const func = document.createElement("span");
    const _name = document.createElement("span");
    _name.classList.add("function");
    _name.innerText = `${name}`;
    func.appendChild(_name);
    func.append("(");
    if (args && args.length) econcat(func, args, ",");
    func.append(")");
    container.appendChild(func);
    return func;
}

function edeclaration({
    name,
    values,
    comment = "",
    isConst = false,
}) {
    if (comment) {
        const p = document.createElement("p");
        p.classList.add("comment");
        p.innerText = comment;
        container.appendChild(p);
    };

    if (name) {
        const p = document.createElement("p");

        const keyword = document.createElement("span");
        keyword.classList.add("keyword");

        const variable = document.createElement("span");

        if (isConst) {
            keyword.innerText = "const";
            variable.classList.add("const");
        } else {
            keyword.innerText = "let";
            variable.classList.add("let");
        }
        p.appendChild(keyword);

        variable.classList.add("variable");
        variable.innerText = name;
        p.appendChild(variable);
        if (values && values.length) {
            p.append(" = ");
            econcat(p, values);
        }
        p.append(";");

        container.appendChild(p);

        return p;
    }
}

function elog(...elements) {
    const p = document.createElement("p");

    const variable = document.createElement("span");
    variable.classList.add("let");
    variable.innerText = "console";
    p.appendChild(variable);
    p.append(".");

    const func = document.createElement("span");
    func.classList.add("function");
    func.innerText = "log";
    p.appendChild(func);

    p.append('(');
    for (const element of elements) typeof element === "string" ? p.append(element) : p.appendChild(element);
    p.append(');');

    container.appendChild(p);
}