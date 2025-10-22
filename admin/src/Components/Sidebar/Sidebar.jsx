// import React from 'react'
// import './Sidebar.css'
// import {Link} from 'react-router-dom'
// import add_product_icon from '../../assets/Product_Cart.png';
// import list_product_icon from '../../assets/product-list.png';


// const Sidebar = () => {
//   return (
//     <div className='sidebar'>
//       <Link to={'/addproduct'} style={{textDecoration:"none"}}>
//       <div className="sidebar-item">
//         <img src={add_product_icon} alt="" />
//         <p>Add Product</p>
//       </div>
      
//       </Link>
//        <Link to={'/listproduct'} style={{textDecoration:"none"}}>
//       <div className="sidebar-item">
//         <img src={list_product_icon} alt="" />
//         <p>Product List</p>
//       </div>
      
//       </Link>
//     </div>
//   )
// }

// export default Sidebar





import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className='sidebar'>
      <h2>Admin Panel</h2>
      <div className="sidebar-menu">
        <div className="menu-section">
          <h3>Products</h3>
          <Link 
            to="/admin/addproduct" 
            className={location.pathname === '/admin/addproduct' ? 'active' : ''}
          >
            Add Product
          </Link>
          <Link 
            to="/admin/listproduct" 
            className={location.pathname === '/admin/listproduct' ? 'active' : ''}
          >
            List Products
          </Link>
        </div>
        <div className="menu-section">
          <h3>Management</h3>
          <Link 
            to="/admin/orders" 
            className={location.pathname === '/admin/orders' ? 'active' : ''}
          >
            Orders
          </Link>
          <Link 
            to="/admin/users" 
            className={location.pathname === '/admin/users' ? 'active' : ''}
          >
            Users
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Sidebar