export function captureFocusKey(element) {
  const focusKey = element?.dataset?.focusKey;
  return typeof focusKey === 'string' && focusKey.length > 0 ? focusKey : null;
}

export function restoreFocus(root, focusKey) {
  if (!root || !focusKey || typeof root.querySelectorAll !== 'function') {
    return false;
  }

  const replacement = Array.from(root.querySelectorAll('[data-focus-key]'))
    .find((element) => element?.dataset?.focusKey === focusKey);

  if (!replacement || typeof replacement.focus !== 'function') {
    return false;
  }

  replacement.focus({ preventScroll: true });
  return true;
}

export function rerenderPreservingFocus(root, render) {
  const focusKey = captureFocusKey(root?.ownerDocument?.activeElement);
  render();
  return restoreFocus(root, focusKey);
}
