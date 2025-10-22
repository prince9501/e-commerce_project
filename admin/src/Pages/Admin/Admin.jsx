// import React from 'react'
// import './Admin.css'
// import Sidebar from '../../Components/Sidebar/Sidebar'
// import { Routes,Route } from 'react-router-dom'
// import AddProduct from '../../Components/AddProduct/AddProduct'
// import ListProduct from '../../Components/ListProduct/ListProduct'
// import ListOrders from '../../Components/ListOrders/ListOrders'
// import ListUsers from '../../Components/ListUsers/ListUsers'
// const Admin = () => {
//   return (
//     <div className='admin'>
//       <Sidebar/>
//       <Routes>
//         <Route path='/addproduct' element={<AddProduct/>}/>
//         <Route path='/listproduct' element={<ListProduct/>}/>
//          <Route path='/orders' element={<ListOrders/>}/> 
//          <Route path='/users' element={<ListUsers/>}/>
//       </Routes>
//     </div>
//   )
// }

// export default Admin






import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'  // Check if this file exists
import ListProduct from '../../Components/ListProduct/ListProduct' // Check if this file exists
import ListOrders from '../../Components/ListOrders/ListOrders'    // NEW - Make sure this exists
import ListUsers from '../../Components/ListUsers/ListUsers'      // NEW - Make sure this exists

const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar/>
      <Routes>
        <Route path='/addproduct' element={<AddProduct/>}/>
        <Route path='/listproduct' element={<ListProduct/>}/>
        <Route path='/orders' element={<ListOrders/>}/>
        <Route path='/users' element={<ListUsers/>}/>
      </Routes>
    </div>
  )
}

export default Admin