// netlify/functions/create-checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { lines, total, cust } = JSON.parse(event.body);

  // tiny helpers
  const nameMap = {
    jc: 'Jerk Chicken',
    jp: 'Jerk Pork',
    vj: 'Vegan Jackfruit',
    ef: 'Extra Festival (2 pcs)'
  };
  const priceMap = {
    jc: 900,
    jp: 1000,
    vj: 800,
    ef: 200
  };

  const stripeLines = lines.map(l => ({
    price_data: {
      currency: 'gbp',
      product_data: { name: nameMap[l.id] || 'Item' },
      unit_amount: priceMap[l.id] || 0
    },
    quantity: l.qty
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${process.env.URL}/success.html`,
    cancel_url: `${process.env.URL}/#order`,
    customer_email: cust.email,
    metadata: { ...cust, items: JSON.stringify(lines) },
    line_items: stripeLines
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ url: session.url })
  };
};