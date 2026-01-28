type TabKey = "feed" | "create" | "challenges" | "ourHistory" | "profile";

let listeners: Array<(tab: TabKey) => void> = [];

export function onTabRequest(cb: (tab: TabKey) => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((x) => x !== cb);
  };
}

export function requestTab(tab: TabKey) {
  listeners.forEach((cb) => cb(tab));
}
