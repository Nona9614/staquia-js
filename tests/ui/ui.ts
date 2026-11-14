import PlayIcon from "./play-icon.js";
import style from "./style.js";
import script from "./script.js";

const ui = async () => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${await script()} ${await style()}
        <title>Staquia Tests</title>
      </head>
      <body>
        <header>
          <button id="run-tests-button" onclick="$onspec();">
            ${PlayIcon()}
            <span>Run Tests</span>
          </button>
        </header>
        <section class="content"></section>
      </body>
    </html>
  `;
};

export default ui;
