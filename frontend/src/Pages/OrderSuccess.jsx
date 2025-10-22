import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, paymentId, amount } = location.state || {};

    if (!orderId) {
        return (
            <div className="order-success">
                <div className="error-message">
                    <h2>Order Not Found</h2>
                    <p>Unable to retrieve order details.</p>
                    <button onClick={() => navigate('/')}>Continue Shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-success">
            <div className="success-container">
                <div className="success-icon">✓</div>
                <h1>Order Placed Successfully!</h1>
                <div className="order-details">
                    <p><strong>Order ID:</strong> {orderId}</p>
                    <p><strong>Payment ID:</strong> {paymentId}</p>
                    <p><strong>Amount Paid:</strong> ₹{amount}</p>
                    <p><strong>Status:</strong> Payment Successful</p>
                </div>
                <div className="success-message">
                    <p>Thank you for your purchase! Your order has been confirmed.</p>
                    <p>You will receive an email confirmation shortly.</p>
                </div>
                <div className="action-buttons">
                    <button onClick={() => navigate('/orders')}>View Orders</button>
                    <button onClick={() => navigate('/')}>Continue Shopping</button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;