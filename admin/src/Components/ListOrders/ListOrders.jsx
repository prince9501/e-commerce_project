import React, { useEffect, useState } from 'react'
import './ListOrders.css'

const ListOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching orders...");
      const response = await fetch('http://localhost:4000/allorders');
      const data = await response.json();
      console.log("Orders data:", data);
      setAllOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id, status) => {
    try {
      await fetch('http://localhost:4000/updateorder', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id, status: status })
      });
      await fetchOrders();
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className='list-orders'>
      <div className="list-orders-header">
        <h1>All Orders</h1>
        <button onClick={fetchOrders} className="refresh-btn">Refresh</button>
      </div>
      
      {allOrders.length === 0 ? (
        <div className="no-orders">
          <h3>No orders found</h3>
          <p>Create sample data first by visiting:</p>
          <code>http://localhost:4000/create-sample-data</code>
        </div>
      ) : (
        <div className="orders-list">
          {allOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.id}</h3>
                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <p><strong>Customer:</strong> {order.user_name}</p>
                <p><strong>Email:</strong> {order.user_email}</p>
                <p><strong>Amount:</strong> ${order.total_amount}</p>
                <p><strong>Date:</strong> {formatDate(order.order_date)}</p>
                <p><strong>Address:</strong> {order.shipping_address}, {order.city}</p>
                <p><strong>Items:</strong> {order.items.length} products</p>
              </div>
              <div className="order-actions">
                {order.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="btn confirm"
                    >
                      Confirm Order
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="btn cancel"
                    >
                      Cancel Order
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                    className="btn ship"
                  >
                    Mark as Shipped
                  </button>
                )}
                {order.status === 'shipped' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="btn deliver"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ListOrders