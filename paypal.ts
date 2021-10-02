import { loadScript } from "@paypal/paypal-js";

export async function pay(totalCents: number, onPaid: () => void) {
  const paypal = await loadScript({
    "client-id": process.env.PAYPAL_CLIENT_ID,
    currency: "EUR",
  });

  const buttons = paypal.Buttons({
    createOrder(data, actions) {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: (totalCents / 100).toFixed(2),
              currency_code: "EUR",
            },
            description: "Coffee",
          },
        ],
      });
    },
    async onApprove(data, actions) {
      const captured = await actions.order.capture();
      console.log({ captured });
      onPaid();
    },
  });

  buttons.render("#paypalRequest");

  return {
    close() {
      buttons.close();
    },
  };
}
