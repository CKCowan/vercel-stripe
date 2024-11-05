import type { Stripe } from "stripe";

import PrintObject from "@/components/PrintObject";
import { stripe } from "@/lib/stripe";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}): Promise<JSX.Element> {
  if (!searchParams.session_id)
    throw new Error("Please provide a valid session_id (`cs_test_...`)");

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.retrieve(searchParams.session_id, {
      expand: ["line_items", "payment_intent"],
    });

  // const two_for_one: Boolean = true;

  // const lineItems = checkoutSession.line_items?.data;
  // if(two_for_one && lineItems){
  //   for (let index = 0; index < lineItems.length; index++) {
  //     let item = lineItems[index];
  //     let price = lineItems[index].amount_subtotal;
  //     let lowest_price = price;
  //     if()
  //   }
  // }

  const paymentIntent = checkoutSession.payment_intent as Stripe.PaymentIntent;

  return (
    <>
      <h2>Status: {paymentIntent.status}</h2>
      <h3>Checkout Session response:</h3>
      <h3>1st Line Item: {checkoutSession.line_items?.data[0].amount_subtotal}</h3>
      <PrintObject content={checkoutSession} />
    </>
  );
}
