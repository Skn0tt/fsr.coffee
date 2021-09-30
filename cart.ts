const listeners = new Set<() => void>();

export function onChange(handler: () => void) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

function emitChange() {
  listeners.forEach((handler) => handler());
}

function getKey(drink: string) {
  return "quantity_" + drink;
}

export function buy(drink: string) {
  const current = getQuantity(drink);

  const newValue = current + 1;

  localStorage.setItem(getKey(drink), newValue.toString());

  emitChange();

  return newValue;
}

export function getQuantity(drink: string): number {
  return Number.parseInt(localStorage.getItem(getKey(drink)) ?? "0");
}

function sum(numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

export function computeTotal(pricing: Record<string, number>): number {
  const lineItems = Object.entries(pricing).map(([name, price]) => {
    const quantity = getQuantity(name);

    return quantity * price;
  });
  return sum(lineItems);
}