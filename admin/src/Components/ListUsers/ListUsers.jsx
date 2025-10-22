import React, { useEffect, useState } from 'react'
import './ListUsers.css'

const ListUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      const response = await fetch('http://localhost:4000/allusers');
      const data = await response.json();
      console.log("Users data:", data);
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      await fetch('http://localhost:4000/updateuser', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id, status: newStatus })
      });
      
      await fetchUsers();
      alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  }

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className='list-users'>
      <div className="list-users-header">
        <h1>All Users</h1>
        <button onClick={fetchUsers} className="refresh-btn">Refresh</button>
      </div>
      
      {allUsers.length === 0 ? (
        <div className="no-users">
          <h3>No users found</h3>
          <p>Users will appear here when they register.</p>
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleUserStatus(user._id, user.status)}
                      className={`status-btn ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ListUsers