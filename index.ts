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

  incrementButtonEl.onclick = () => Cart.buy(drinkId);

  function writeQuantity() {
    incrementButtonEl.textContent = formatQuantity(Cart.getQuantity(drinkId));
  }

  Cart.onChange(writeQuantity);
  writeQuantity();
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

const payButton = document.getElementById("pay") as HTMLButtonElement;
payButton.onclick = async () => {
  const total = Cart.computeTotal(prices);

  payButton.disabled = true;
  payButton.textContent = "...";

  const integrations = await Promise.all([
    import("./paypal"),
    import("./stripe"),
  ]);

  const runningPaymentOptions: { close(): void }[] = [];

  await Promise.all(
    integrations.map(async (paymentIntegration) => {
      const runningPayment = await paymentIntegration.pay(total, () => {
        payButton.disabled = false;
        payButton.textContent = "Pay";
        Cart.reset();

        runningPaymentOptions.forEach((option) => option.close());
      });

      if (runningPayment) {
        runningPaymentOptions.push(runningPayment);
      }
    })
  );
};
