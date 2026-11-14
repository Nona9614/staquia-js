async function htmx(path, selector, id) {
  const element = document.body.querySelector(selector);
  if (!element) {
    console.warn(`Could not find an element with the selector '${selector}'.`);
    return;
  }

  let html = "";

  try {
    if (id) path += `/${id}`;
    const result = await fetch(path);
    html = await result.text();
  } catch (error) {
    console.error(error);
  } finally {
    element.innerHTML = html;
  }
}

const states = new Map();

function $onspec() {
  htmx("specs", ".content").then(() => {
    states.forEach((state, id) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.open = state;
    });
  });
}

function $ontoggle(details) {
  states.set(details.id, details.open);
}

window.htmx = htmx;
window.$onspec = $onspec;
window.$ontoggle = $ontoggle;

$onspec();
