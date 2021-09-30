import { Handler } from "@netlify/functions";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export const handler: Handler = async (event, context) => {
  const { amount } = JSON.parse(event.body);

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "eur",
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      clientSecret: intent.client_secret,
    }),
  };
};
