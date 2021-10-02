import { loadStripe } from "@stripe/stripe-js";

export async function pay(totalCents: number, onPaid: () => void) {
  const stripe = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

  const paymentRequest = stripe.paymentRequest({
    country: "DE",
    currency: "eur",
    total: {
      label: "Coffee",
      amount: totalCents,
    },
    requestPayerEmail: false,
    requestPayerName: false,
  });

  if (!(await paymentRequest.canMakePayment())) {
    return null;
  }

  const elements = stripe.elements();
  const prButton = elements.create("paymentRequestButton", {
    paymentRequest,
  });

  prButton.mount("#stripeRequest");

  const res = await fetch("/.netlify/functions/createPaymentIntent", {
    method: "POST",
    body: JSON.stringify({ amount: totalCents }),
    headers: { "Content-Type": "application/json" },
  });

  const { clientSecret } = await res.json();

  paymentRequest.on("paymentmethod", async (event) => {
    const results = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: event.paymentMethod.id },
      { handleActions: false }
    );

    prButton.unmount();

    if (results.error) {
      event.complete("fail");
      return;
    } else {
      event.complete("success");

      if (results.paymentIntent.status === "requires_action") {
        const result2 = await stripe.confirmCardPayment(clientSecret);

        if (result2.error) {
          alert("payment failed - use cash instead.");
          return;
        }
      }
    }

    onPaid();
  });

  return {
    close() {
      prButton.unmount();
    },
  };
}
