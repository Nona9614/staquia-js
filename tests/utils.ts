export const capitalize = (string: string) =>
  string[0].toUpperCase() +
  string.substring(1).replace(/([-_]\w)/gi, function (_, start) {
    return " " + start[1].toUpperCase();
  });
