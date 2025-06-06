import { useEffect, useRef } from 'react';

function PayPalButton() {
  const paypalRef = useRef();

  useEffect(() => {
    fetch('http://localhost:8000/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      window.paypal.Buttons({
        createOrder: () => data.id,
        onApprove: async (data, actions) => {
          const details = await actions.order.capture();
          alert('Transaction completed by ' + details.payer.name.given_name);
          console.log('Details:', details);
        },
        onError: err => {
          console.error('PayPal Error:', err);
        }
      }).render(paypalRef.current);
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
