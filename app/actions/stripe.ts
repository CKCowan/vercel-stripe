"use server";

import type { Stripe } from "stripe";

import { headers } from "next/headers";

import { CURRENCY } from "@/config";
import { formatAmountForStripe } from "@/utils/stripe-helpers";
import { stripe } from "@/lib/stripe";


const lineItems: { price: string; quantity: number; }[] = [
  {
    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
    price: 'price_1NBOoqKYEJ2F60idmG2XixCY',
    quantity: 1,
  },
  {
    price: 'price_1NBOrnKYEJ2F60idD2SXE4jR',
    quantity: 1
  },
  {
    price: 'price_1N5a9nKYEJ2F60idrVOaHj99',
    quantity: 1
  }
]

const discounts: { coupon: string }[] = [
  // {
  //   coupon : '122524'
  // }
]
async function createDiscount(line_items: { price: string; quantity: number; }[]){
  let coupon = await stripe.coupons.create({
    id: 'test1',
    currency: 'usd',
    amount_off: 3500,
  });
  console.log(coupon)
  let discount = { coupon: coupon.id}
  discounts.push(discount)
}

// let prices: any[] = [90, 80, 40]

// Loop through lineItems, retrieve the price of each item using priceId, then push the prices for each item to prices array
// async function getPrices(lineItems: { price: string; quantity: number; }[]){
//   lineItems.forEach(async item => {
//     let price = await stripe.prices.retrieve(item.price);
//     prices.push(price)
//   });

//   console.log(prices)
// }
// getPrices(lineItems);


// let discount = getDiscount(prices);
// function getDiscount(pricesArray: any[] ){
//   let lowestPrice = pricesArray[0]

//   for (let index = 1; index < pricesArray.length; index++) {
//     if(pricesArray[index] < lowestPrice){
//       lowestPrice = pricesArray[index]
//     }
//   }
//   return lowestPrice;
// }
// getDiscount(prices);


// let couponID = createCouponId(discount);
async function createCouponId(discount: number){
  let coupon = await stripe.coupons.create({
    currency: 'usd',
    amount_off: discount,
  });
  // let id: string = coupon.id;
  // couponID = id;
  return coupon.id;
}

// let prices: any[] | Stripe.Response<Stripe.Price>[] = [];
// let discount: number;
// let couponID: any = twoForOne();
// function twoForOne(){
//   // let prices: any[] | Stripe.Response<Stripe.Price>[] = [];
//   getPrices(lineItems)
//   discount = getDiscount(prices)
//   let id = createCouponId(discount)
//   return id;
// }


export async function createCheckoutSession(
  data: FormData,
  discount: number,
): Promise<{ client_secret: string | null; url: string | null }> {
  const ui_mode = data.get(
    "uiMode",
  ) as Stripe.Checkout.SessionCreateParams.UiMode;

  const origin: string = headers().get("origin") as string;

  let coupon = await stripe.coupons.create({
    currency: 'usd',
    amount_off: discount,
  });

  // createDiscount(lineItems)
  

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      line_items: lineItems,
      discounts: [
        { coupon: coupon.id}
      ],
      ...(ui_mode === "hosted" && {
        success_url: `${origin}/donate-with-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/donate-with-checkout`,
      }),
      ...(ui_mode === "embedded" && {
        return_url: `${origin}/donate-with-embedded-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
      }),
      ui_mode,
    });

    

    // let item = checkoutSession.line_items?.data[2];
    // if(item){
    //   let discount = item.amount_subtotal

    //   let coupon = await stripe.coupons.create({
    //     id: checkoutSession.created.toString(),
    //     currency: 'usd',
    //     amount_off: discount,
    //   });
      
    // }
    

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}

export async function createPaymentIntent(
  data: FormData,
): Promise<{ client_secret: string }> {
  const paymentIntent: Stripe.PaymentIntent =
    await stripe.paymentIntents.create({
      amount: formatAmountForStripe(
        Number(data.get("customDonation") as string),
        CURRENCY,
      ),
      automatic_payment_methods: { enabled: true },
      currency: CURRENCY,
    });

  return { client_secret: paymentIntent.client_secret as string };
}
