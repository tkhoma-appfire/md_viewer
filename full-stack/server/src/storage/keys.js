export function mdPathToStorageKey(relPath) {
  return relPath.replace(/\\/g, "/").replace(/\//g, "__");
}

export function commentObjectKey(relPath) {
  return `${mdPathToStorageKey(relPath)}.json`;
}

export function accessObjectKey(relPath) {
  return `${mdPathToStorageKey(relPath)}.json`;
}
