import * as Cart from "./cart";

const drinkEls = document.querySelectorAll(
  "#drinklist > li"
) as NodeListOf<HTMLElement>;

function formatQuantity(quantity: number): string {
  if (quantity < 1) {
    return "☕️";
  }

  return "" + quantity;
}

function formatEuro(cents: number): string {
  const formatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });
  return formatter.format(cents / 100);
}

const prices: Record<string, number> = {};

for (const drinkEl of drinkEls) {
  const drinkId = drinkEl.id;
  const priceInCents = Number.parseInt(drinkEl.dataset.cents);
  prices[drinkId] = priceInCents;

  const incrementButtonEl = drinkEl.querySelector("button");

  const quantity = Cart.getQuantity(drinkId);
  incrementButtonEl.textContent = formatQuantity(quantity);

  incrementButtonEl.onclick = () => {
    const newQuantity = Cart.buy(drinkId);
    incrementButtonEl.textContent = formatQuantity(newQuantity);
  };
}

function writeTotal() {
  const totalEl = document.getElementById("total");
  const minimumTotal = Number.parseInt(totalEl.dataset.minimum);
  const total = Cart.computeTotal(prices);
  totalEl.textContent = formatEuro(total);

  (document.getElementById("pay") as HTMLButtonElement).disabled =
    total < minimumTotal;
}

Cart.onChange(writeTotal);
writeTotal();

document.getElementById("pay").onclick = () => {
  const total = Cart.computeTotal(prices);
  alert(`I'll make you pay ${formatEuro(total)}!`);
};
