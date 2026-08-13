export function getPath(obj, path) {
  return path.split('.').filter(Boolean).reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export function setPath(obj, path, value) {
  const keys = path.split('.').filter(Boolean);
  let node = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (node[key] == null || typeof node[key] !== 'object') node[key] = {};
    node = node[key];
  }
  node[keys[keys.length - 1]] = value;
  return obj;
}

export function deletePath(obj, path) {
  const keys = path.split('.').filter(Boolean);
  let node = obj;
  for (let i = 0; i < keys.length - 1 && node != null; i += 1) node = node[keys[i]];
  if (node != null) delete node[keys[keys.length - 1]];
  return obj;
}

export function applyOps(document, ops) {
  if (!Array.isArray(ops)) throw new Error('patches must be an array');
  for (const op of ops) {
    if (!op || typeof op !== 'object') throw new Error('each patch must be an object');
    if (op.op === 'restore_version') continue;
    if (typeof op.path !== 'string') throw new Error('each patch needs a path');
    switch (op.op) {
      case 'replace':
      case 'add':
        setPath(document, op.path, op.value);
        break;
      case 'remove':
        deletePath(document, op.path);
        break;
      case 'append':
        {
          const target = getPath(document, op.path);
          if (!Array.isArray(target)) throw new Error(`no array at path ${op.path}`);
          target.push(op.value);
        }
        break;
      default:
        throw new Error(`unsupported op "${op.op}"`);
    }
  }
  return document;
}