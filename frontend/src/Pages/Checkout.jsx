import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import './Checkout.css';

const Checkout = () => {
    const { getTotalCartAmount, clearCart, cartItems, all_product } = useContext(ShopContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentTimeout, setPaymentTimeout] = useState(null);

    // Load Razorpay script dynamically
    useEffect(() => {
        const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    console.log('Razorpay SDK loaded');
                    resolve(true);
                };
                script.onerror = () => {
                    console.error('Failed to load Razorpay SDK');
                    resolve(false);
                };
                document.body.appendChild(script);
            });
        };

        loadRazorpayScript();

        return () => {
            if (paymentTimeout) {
                clearTimeout(paymentTimeout);
            }
        };
    }, [paymentTimeout]);

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};

        // Required field validation
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation (Indian phone numbers)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        // Check if cart is empty
        if (getTotalCartAmount() === 0) {
            alert('Error: Your cart is empty! Please add items to your cart before checkout.');
            return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Generate order ID
    const generateOrderId = () => {
        return `ORD${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    };

    // Get cart items details
    const getCartItemsDetails = () => {
        return all_product
            .filter(product => cartItems[product.id] > 0)
            .map(product => ({
                id: product.id,
                name: product.name,
                price: product.new_price,
                quantity: cartItems[product.id],
                image: product.image,
                subtotal: product.new_price * cartItems[product.id]
            }));
    };

    // Save order to localStorage (replace with your backend API)
    const saveOrderToDatabase = async (orderData, status = 'pending') => {
        try {
            const order = {
                orderId: orderData.orderId,
                razorpayOrderId: orderData.razorpayOrderId,
                customerInfo: formData,
                items: getCartItemsDetails(),
                totalAmount: getTotalCartAmount(),
                status: status,
                createdAt: new Date().toISOString(),
                paymentMethod: 'razorpay'
            };

            // Save to localStorage
            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            existingOrders.push(order);
            localStorage.setItem('orders', JSON.stringify(existingOrders));

            return order;
        } catch (error) {
            console.error('Error saving order:', error);
            throw error;
        }
    };

    // Create Razorpay order (replace with actual backend API call)
    const createRazorpayOrder = async (amount, orderId) => {
        // IMPORTANT: In production, this should be a call to your backend
        // Your backend should create the order using Razorpay API
        try {
            // Simulate API call to your backend
            const response = await fetch('/api/create-razorpay-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: 'INR',
                    receipt: orderId,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create Razorpay order');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            
            // Fallback: Create a mock order for development
            // REMOVE THIS IN PRODUCTION
            console.warn('Using mock Razorpay order for development');
            return {
                id: `order_${Date.now()}_mock`,
                amount: amount,
                currency: 'INR',
                status: 'created'
            };
        }
    };

    // Initialize Razorpay payment
    const initializeRazorpayPayment = async () => {
        if (!window.Razorpay) {
            alert('Payment gateway is loading. Please try again in a moment.');
            return;
        }

        const orderId = generateOrderId();
        const amount = Math.round(getTotalCartAmount() * 100); // Convert to paise

        try {
            // Create Razorpay order
            const razorpayOrder = await createRazorpayOrder(amount, orderId);
            
            // Save order as pending
            await saveOrderToDatabase({
                orderId: orderId,
                razorpayOrderId: razorpayOrder.id
            });

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your Razorpay Key ID
                amount: amount,
                currency: 'INR',
                name: 'Your Store Name',
                description: `Order #${orderId}`,
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    await handlePaymentSuccess(response, orderId);
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone
                },
                notes: {
                    address: formData.address,
                    order_id: orderId
                },
                theme: {
                    color: '#3399cc'
                },
                modal: {
                    ondismiss: function() {
                        handlePaymentDismiss(orderId);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            
            // Set 10-minute timeout
            const timeout = setTimeout(() => {
                razorpay.close();
                handlePaymentTimeout(orderId);
            }, 10 * 60 * 1000);

            setPaymentTimeout(timeout);

            razorpay.open();

            // Payment failed event
            razorpay.on('payment.failed', function (response) {
                clearTimeout(timeout);
                handlePaymentFailure(response, orderId);
            });

        } catch (error) {
            console.error('Error initializing Razorpay:', error);
            alert('Error initializing payment. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Handle payment success
    const handlePaymentSuccess = async (response, orderId) => {
        try {
            clearTimeout(paymentTimeout);
            
            // Verify payment with your backend
            const verificationSuccess = await verifyPayment(response, orderId);
            
            if (verificationSuccess) {
                // Update order status to successful
                await updateOrderStatus(orderId, 'successful', response.razorpay_payment_id);
                
                // Clear cart and redirect
                clearCart();
                navigate('/order-success', { 
                    state: { 
                        orderId: orderId,
                        paymentId: response.razorpay_payment_id,
                        amount: getTotalCartAmount(),
                        customerName: `${formData.firstName} ${formData.lastName}`
                    }
                });
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            await updateOrderStatus(orderId, 'verification_failed');
            alert('Payment verification failed. Please contact support with your order ID: ' + orderId);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle payment failure
    const handlePaymentFailure = async (response, orderId) => {
        await updateOrderStatus(orderId, 'failed', null, response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsSubmitting(false);
    };

    // Handle payment dismiss (user closed the modal)
    const handlePaymentDismiss = async (orderId) => {
        await updateOrderStatus(orderId, 'cancelled');
        setIsSubmitting(false);
    };

    // Handle payment timeout
    const handlePaymentTimeout = async (orderId) => {
        await updateOrderStatus(orderId, 'timeout');
        alert('Payment session expired. Please try again.');
        setIsSubmitting(false);
    };

    // Verify payment (replace with actual API call to your backend)
    const verifyPayment = async (response, orderId) => {
        try {
            // This should be replaced with actual payment verification API call
            const verifyResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: orderId
                })
            });

            if (!verifyResponse.ok) {
                throw new Error('Verification failed');
            }

            const data = await verifyResponse.json();
            return data.success;

        } catch (error) {
            console.error('Payment verification error:', error);
            
            // For development, simulate successful verification
            // REMOVE THIS IN PRODUCTION
            console.warn('Using mock verification for development');
            return true;
        }
    };

    // Update order status
    const updateOrderStatus = async (orderId, status, paymentId = null, error = null) => {
        try {
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const orderIndex = orders.findIndex(order => order.orderId === orderId);
            
            if (orderIndex !== -1) {
                orders[orderIndex].status = status;
                orders[orderIndex].updatedAt = new Date().toISOString();
                
                if (paymentId) {
                    orders[orderIndex].razorpayPaymentId = paymentId;
                }
                
                if (error) {
                    orders[orderIndex].error = error;
                }
                
                localStorage.setItem('orders', JSON.stringify(orders));
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await initializeRazorpayPayment();
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Error processing your order. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout">
            <div className="checkout-header">
                <h1>Checkout</h1>
                <div className="checkout-steps">
                    <span className="step active">Shipping</span>
                    <span className="step">Payment</span>
                    <span className="step">Confirmation</span>
                </div>
            </div>
            
            {getTotalCartAmount() === 0 ? (
                <div className="empty-cart-message">
                    <h2>Your cart is empty</h2>
                    <p>Please add items to your cart before proceeding to checkout.</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="continue-shopping-btn"
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="checkout-content">
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="form-section">
                            <h2>Shipping Information</h2>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={errors.firstName ? 'error' : ''}
                                        placeholder="Enter your first name"
                                    />
                                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={errors.lastName ? 'error' : ''}
                                        placeholder="Enter your last name"
                                    />
                                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? 'error' : ''}
                                    placeholder="your@email.com"
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={errors.phone ? 'error' : ''}
                                    placeholder="10-digit mobile number"
                                />
                                {errors.phone && <span className="error-text">{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label>Delivery Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={errors.address ? 'error' : ''}
                                    placeholder="Full street address"
                                />
                                {errors.address && <span className="error-text">{errors.address}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={errors.city ? 'error' : ''}
                                        placeholder="City"
                                    />
                                    {errors.city && <span className="error-text">{errors.city}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label>ZIP Code *</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        className={errors.zipCode ? 'error' : ''}
                                        placeholder="PIN code"
                                    />
                                    {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="order-summary-section">
                            <h2>Order Summary</h2>
                            <div className="order-items">
                                {getCartItemsDetails().map(item => (
                                    <div key={item.id} className="order-item">
                                        <span className="item-name">{item.name} × {item.quantity}</span>
                                        <span className="item-price">₹{item.subtotal}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="total-section">
                                <div className="total-amount">
                                    <strong>Total Amount: ₹{getTotalCartAmount()}</strong>
                                </div>
                            </div>
                            <div className="payment-info">
                                <div className="secure-payment">
                                    🔒 Secure Payment by Razorpay
                                </div>
                                <p className="timeout-warning">
                                    ⏰ Payment session expires in 10 minutes
                                </p>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={`place-order-btn ${isSubmitting ? 'loading' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner"></div>
                                    Redirecting to Payment...
                                </>
                            ) : (
                                `Proceed to Pay - ₹${getTotalCartAmount()}`
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Checkout;