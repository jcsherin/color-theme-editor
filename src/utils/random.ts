export function uniform(n: number) {
  return Math.trunc(Math.random() * n);
}

export function shuffle<Type>(a: Type[]): Type[] {
  const copy = a.slice(0);
  const size = copy.length;
  for (let i = 0; i < size; i++) {
    const random = i + uniform(size - i);
    let tmp = copy[i];
    copy[i] = copy[random];
    copy[random] = tmp;
  }
  return copy;
}
