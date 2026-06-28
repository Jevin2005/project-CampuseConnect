require('dotenv').config();
const Razorpay = require('razorpay');

console.log('Testing Razorpay with keys:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '***hidden***' : 'not defined');

const rz = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function test() {
  try {
    const order = await rz.orders.create({
      amount: 100, // 1 INR (100 paise)
      currency: 'INR',
      receipt: 'test_receipt_123'
    });
    console.log('SUCCESS! Order created:', order);
  } catch (err) {
    console.error('FAILED to create order!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    console.error('Full Error Object:', JSON.stringify(err, null, 2));
  }
}

test();
