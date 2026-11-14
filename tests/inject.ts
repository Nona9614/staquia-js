type Func = (...args: any[]) => any;
/** Creates a binded function injecting the passed context */
const inject = <F extends Func>(method: F, ...contexts: any[]): F => method.bind(Object.assign({}, ...contexts)) as F;
export default inject;
