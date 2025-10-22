import React, { useState } from 'react'
import './AdminDashboard.css'
import AddProduct from '../AddProduct/AddProduct'
import ListProduct from '../ListProduct/ListProduct'
import ListOrders from '../ListOrders/ListOrders'
import ListUsers from '../ListUsers/ListUsers'

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('add-product')

  const renderSection = () => {
    switch(activeSection) {
      case 'add-product':
        return <AddProduct />
      case 'list-products':
        return <ListProduct />
      case 'orders':
        return <ListOrders />
      case 'users':
        return <ListUsers />
      default:
        return <AddProduct />
    }
  }

  return (
    <div className='admin-dashboard'>
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <div className="sidebar-menu">
          <div className="menu-section">
            <h3>Products</h3>
            <button 
              className={activeSection === 'add-product' ? 'active' : ''}
              onClick={() => setActiveSection('add-product')}
            >
              Add Product
            </button>
            <button 
              className={activeSection === 'list-products' ? 'active' : ''}
              onClick={() => setActiveSection('list-products')}
            >
              List Products
            </button>
          </div>
          <div className="menu-section">
            <h3>Management</h3>
            <button 
              className={activeSection === 'orders' ? 'active' : ''}
              onClick={() => setActiveSection('orders')}
            >
              Orders
            </button>
            <button 
              className={activeSection === 'users' ? 'active' : ''}
              onClick={() => setActiveSection('users')}
            >
              Users
            </button>
          </div>
        </div>
      </div>
      <div className="admin-content">
        {renderSection()}
      </div>
    </div>
  )
}

export default AdminDashboard