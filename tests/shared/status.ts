export type TestStatus = "stale" | "failed" | "success";

export const mark = (status: TestStatus) => {
  switch (status) {
    case "success":
      return "✔";
    case "failed":
      return "✖";
    default:
      return "o";
  }
};
