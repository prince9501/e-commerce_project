import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './CartItems.css'
import { ShopContext } from '../../Context/ShopContext.jsx'
import remove_icon from '../Assets/cart_cross_icon.png'

const CartItems = () => {
    const { getTotalCartAmount, all_product, cartItems, removeFromCart } = useContext(ShopContext);
    const navigate = useNavigate();
    
    // Check if cart is empty
    const isCartEmpty = getTotalCartAmount() === 0;

    return (
        <div className='cartitems'>
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {all_product.map((e) => {
                if (cartItems[e.id] > 0) {
                    return (
                        <div key={e.id}>
                            <div className="cartitems-format cartitems-format-main">
                                <img src={e.image} alt="" className='carticon-product-icon' />
                                <p>{e.name}</p>
                                <p>Rs{e.new_price}</p>
                                <button className='cartitems-quantity'>{cartItems[e.id]}</button>
                                <p>Rs{e.new_price * cartItems[e.id]}</p>
                                <img 
                                    className='cartitems-remove-icon' 
                                    src={remove_icon} 
                                    onClick={() => { removeFromCart(e.id) }} 
                                    alt="Remove" 
                                />                              
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
                            <p>Rs{getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                          <p>Shipping Fee</p>
                          <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>Rs{getTotalCartAmount()}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/checkout')}
                        disabled={isCartEmpty}
                        className={isCartEmpty ? 'checkout-btn disabled' : 'checkout-btn'}
                    >
                        {isCartEmpty ? 'Cart is Empty' : 'Proceed to Checkout'}
                    </button>
                </div>
                <div className="cartitems-promocode">
                    <p>Apply your promocode</p>
                    <div className="cartitems-promobox">
                        <input type="text" placeholder='Enter your Promocode' />
                        <button>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartItems;