import { defaultSettings } from "./default-settings";

let _onThreshold = defaultSettings.onThreshold;
let _onOverflow = defaultSettings.onOverflow;

export const handlers = {
  get onThreshold() {
    return _onThreshold
  },
  set onThreshold(value) {
    _onThreshold = value;
  },
  get onOverflow() {
    return _onOverflow;
  },
  set onOverflow(value) {
    _onOverflow = value;
  }
};
