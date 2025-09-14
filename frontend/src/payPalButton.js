import { useEffect, useRef } from 'react';
import api from '../api/axiosConfig'; // import your Axios instance

function PayPalButton() {
  const paypalRef = useRef();

  useEffect(() => {
    // Use Axios instead of fetch
    api.post('/create-order')
      .then(res => {
        const orderId = res.data.id;

        window.paypal.Buttons({
          createOrder: () => orderId,
          onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            alert('Transaction completed by ' + details.payer.name.given_name);
            console.log('Details:', details);
          },
          onError: err => {
            console.error('PayPal Error:', err);
          }
        }).render(paypalRef.current);
      })
      .catch(err => {
        console.error('API Error:', err.response?.data || err.message);
      });
  }, []);

  return (
    <div>
      <h3>PayPal Checkout</h3>
      <div ref={paypalRef}></div>
    </div>
  );
}

export default PayPalButton;
