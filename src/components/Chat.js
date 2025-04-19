/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import Nav from './Nav';
import '../styles/chat.css';

let socket = null;

const initializeSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      transports: ['polling', 'websocket'],
    });
    console.log('Socket instance created');
  }
  return socket;
};

const Chat = () => {
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socketInstance = initializeSocket();

    const onConnect = () => {
      console.log('Socket connected with ID:', socketInstance.id);
      setSocketConnected(true);
      toast.success('Chat connection established');
    };

    const onDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketConnected(false);
    };

    const onConnectError = (err) => {
      console.error('Socket connection error:', err);
      setSocketConnected(false);
      if (!searchAttempted) {
        toast.warning('Chat connection issue. Messages may be delayed.');
      }
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onConnectError);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('connect_error', onConnectError);
    };
  }, [searchAttempted]);

  useEffect(() => {
    const socketInstance = initializeSocket();

    const onMessage = (message) => {
      console.log('Message received:', message);
      
      // Update messages if this message belongs to the current conversation
      if (selectedUser && 
          ((message.sender_id === userId && message.receiver_id === selectedUser.user_id) || 
           (message.sender_id === selectedUser.user_id && message.receiver_id === userId))) {
        setMessages((prev) => {
          const exists = prev.some(
            msg =>
              msg.sender_id === message.sender_id &&
              msg.receiver_id === message.receiver_id &&
              msg.message === message.message &&
              (msg.id === message.id ||
                (msg.timestamp &&
                  message.timestamp &&
                  new Date(msg.timestamp).getTime() === new Date(message.timestamp).getTime()))
          );
          return exists ? prev : [...prev, message];
        });
      }
      
      // Always refresh the conversation list when a new message arrives
      fetchRecentConversations();
    };

    socketInstance.on('message', onMessage);

    return () => {
      socketInstance.off('message', onMessage);
    };
  }, [selectedUser, userId]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        try {
          setLoading(true);
          const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: user.email, password: user.uid }),
          });

          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

          const data = await response.json();
          if (data.user && data.user.user_id) {
            setUserId(data.user.user_id);
          } else {
            toast.error('Failed to fetch user data');
            navigate('/login');
          }
        } catch (error) {
          toast.error(`Error fetching user data: ${error.message}`);
          console.error('User fetch error:', error);
          navigate('/login');
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch recent conversations when userId is available
  useEffect(() => {
    if (userId) {
      fetchRecentConversations();
    }
  }, [userId]);

  const fetchRecentConversations = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'getRecentConversations',
          userId: userId,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += `, Details: ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If the response isn't JSON, just use the status
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.conversations) {
        setRecentConversations(data.conversations);
        
        // If no user is selected yet and we have conversations, select the first one
        if (!selectedUser && data.conversations.length > 0) {
          setSelectedUser(data.conversations[0]);
          fetchMessages(data.conversations[0].user_id);
        }
      }
    } catch (error) {
      console.error('Conversations error:', error);
      toast.error(`Error fetching conversations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!userId) {
      toast.warning('Please wait for authentication to complete');
      return;
    }

    setLoading(true);
    setSearchAttempted(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'search',
          query: searchQuery,
          senderId: userId,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += `, Details: ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If the response isn't JSON, just use the status
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
        if (data.users.length === 0) toast.info('No users found');
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error(`Error searching users: ${error.message}`);
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (receiverId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'getMessages',
          senderId: userId,
          receiverId,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += `, Details: ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If the response isn't JSON, just use the status
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.messages) {
        // Additional filter to ensure messages are actually between these two users
        const filteredMessages = data.messages.filter(msg => (
          (msg.sender_id === userId && msg.receiver_id === receiverId) || 
          (msg.sender_id === receiverId && msg.receiver_id === userId)
        ));
        setMessages(filteredMessages);
      } else {
        toast.error('Failed to fetch messages');
      }
    } catch (error) {
      toast.error(`Error fetching messages: ${error.message}`);
      console.error('Messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage || !selectedUser || !userId) {
      toast.error('Please select a user and type a message');
      return;
    }

    const message = {
      sender_id: userId,
      receiver_id: selectedUser.user_id,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    const socketInstance = initializeSocket();

    if (socketConnected) {
      socketInstance.emit('message', message);
    } else {
      fetch('http://localhost:3000/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(message),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          console.log('Message sent via HTTP fallback:', data);
          // Refresh conversation list after sending a message
          fetchRecentConversations();
        })
        .catch((error) => {
          console.error('HTTP fallback error:', error);
          toast.error('Failed to send message. Please try again.');
        });
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user.user_id);
    // Close search results after selecting a user
    setShowSearch(false);
  };

  // Function to display a preview of the last message
  const renderMessagePreview = (message) => {
    if (!message) return "";
    return message.length > 25 ? message.substring(0, 25) + '...' : message;
  };

  return (
    <div className="chat-page">
      <Nav />
      <div className="chat-container">
        <h2>Chat {socketConnected ? '(Connected)' : '(Offline Mode)'}</h2>
        <div className="chat-content">
          <div className="user-search">
            <div className="search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && (fetchUsers(), setShowSearch(true))}
              />
              <button 
                onClick={() => {
                  fetchUsers();
                  setShowSearch(true);
                }} 
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {showSearch && (
              <div className="search-results">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.user_id}
                      className={`user-item ${selectedUser?.user_id === user.user_id ? 'selected' : ''}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      {user.name} ({user.email})
                    </div>
                  ))
                ) : searchAttempted ? (
                  <div className="no-users">No users found</div>
                ) : null}
              </div>
            )}
            
            <h3>Recent Conversations</h3>
            <div className="conversation-list">
              {recentConversations.length > 0 ? (
                recentConversations.map((convo) => (
                  <div
                    key={convo.user_id}
                    className={`conversation-item ${selectedUser?.user_id === convo.user_id ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(convo)}
                  >
                    <div className="conversation-name">{convo.name}</div>
                    <div className="conversation-preview">
                      {renderMessagePreview(convo.lastMessage)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-conversations">
                  No recent conversations
                </div>
              )}
            </div>
          </div>
          <div className="chat-area">
            {selectedUser ? (
              <>
                <div className="chat-header">
                  <h3>Chatting with {selectedUser.name}</h3>
                </div>
                <div className="messages">
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`message ${msg.sender_id === userId ? 'sent' : 'received'}`}
                      >
                        <span>{msg.sender_id === userId ? 'You' : selectedUser.name}:</span> {msg.message}
                      </div>
                    ))
                  ) : (
                    <div className="no-messages">
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  )}
                </div>
                <div className="message-input">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={loading}
                  />
                  <button onClick={sendMessage} disabled={loading}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>Select a user to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { io } from 'socket.io-client';
// import { toast } from 'react-toastify';
// import Nav from './Nav';
// import '../styles/chat.css';

// // Define socket URL and create socket instance - outside component to prevent recreation

// let socket=null;

// // Improved socket initialization function
// const initializeSocket = () => {
//     if (!socket) {
//       socket = io('http://localhost:5000', {
//         // Simplified config
//         transports: ['polling', 'websocket'], // Try polling first, then websocket
//       });
      
//       console.log('Socket instance created');
//     }
//     return socket;
//   };

// const Chat = () => {
//   const [userId, setUserId] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [searchAttempted, setSearchAttempted] = useState(false);
//   const navigate = useNavigate();

//   // Initialize socket once and set up connection events
//   // Replace your existing socket connection useEffect with this
// useEffect(() => {
//     const socketInstance = initializeSocket();
    
//     // Define event handlers
//     const onConnect = () => {
//       console.log('Socket connected successfully with ID:', socketInstance.id);
//       setSocketConnected(true);
//       toast.success('Chat connection established');
//     };
  
//     const onDisconnect = (reason) => {
//       console.log('Socket disconnected:', reason);
//       setSocketConnected(false);
//     };
  
//     const onConnectError = (err) => {
//       console.error('Socket connection error:', err);
//       setSocketConnected(false);
//       if (!searchAttempted) {
//         toast.warning('Chat connection issue. Messages will be delayed.');
//       }
//     };
  
//     // Attach event listeners
//     socketInstance.on('connect', onConnect);
//     socketInstance.on('disconnect', onDisconnect);
//     socketInstance.on('connect_error', onConnectError);
    
//     // Cleanup
//     return () => {
//       socketInstance.off('connect', onConnect);
//       socketInstance.off('disconnect', onDisconnect);
//       socketInstance.off('connect_error', onConnectError);
//     };
//   }, [searchAttempted]);
//   // Set up message listener
//   useEffect(() => {
//     const socketInstance = initializeSocket();
    
//     const onMessage = (message) => {
//       console.log('Message received:', message);
//       setMessages((prev) => {
//         // Check if message already exists to avoid duplicates
//         const exists = prev.some(
//           msg => msg.sender_id === message.sender_id && 
//                  msg.receiver_id === message.receiver_id && 
//                  msg.message === message.message &&
//                  (msg.id === message.id || 
//                   (msg.timestamp && message.timestamp && 
//                    new Date(msg.timestamp).getTime() === new Date(message.timestamp).getTime()))
//         );
        
//         if (exists) return prev;
//         return [...prev, message];
//       });
//     };
    
//     socketInstance.on('message', onMessage);
    
//     return () => {
//       socketInstance.off('message', onMessage);
//     };
//   }, []);

//   // Auth check
//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user && user.emailVerified) {
//         try {
//           setLoading(true);
//           const response = await fetch('http://localhost:3000/api/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             credentials: 'include',
//             body: JSON.stringify({ email: user.email, password: user.uid }),
//           });
          
//           if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }
          
//           const data = await response.json();
//           if (data.user && data.user.user_id) {
//             setUserId(data.user.user_id);
//           } else {
//             toast.error('Failed to fetch user data');
//             navigate('/login');
//           }
//         } catch (error) {
//           toast.error(`Error fetching user data: ${error.message}`);
//           console.error('User fetch error:', error);
//           navigate('/login');
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         navigate('/login');
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   const fetchUsers = async () => {
//     if (!userId) {
//       toast.warning('Please wait for authentication to complete');
//       return;
//     }
    
//     setLoading(true);
//     setSearchAttempted(true);
    
//     try {
//       console.log('Searching users with query:', searchQuery);
//       const response = await fetch('http://localhost:3000/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({ 
//           action: 'search', 
//           query: searchQuery, 
//           senderId: userId 
//         }),
//       });
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Server error response:', errorText);
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       if (data.users) {
//         console.log('Users found:', data.users);
//         setUsers(data.users);
//         if (data.users.length === 0) {
//           toast.info('No users found matching your search');
//         }
//       } else {
//         toast.error('Failed to fetch users');
//       }
//     } catch (error) {
//       toast.error(`Error searching users: ${error.message}`);
//       console.error('Search error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMessages = async (receiverId) => {
//     if (!userId) return;
//     setLoading(true);
//     try {
//       const response = await fetch('http://localhost:3000/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({ 
//           action: 'getMessages', 
//           senderId: userId, 
//           receiverId 
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       if (data.messages) {
//         setMessages(data.messages);
//       } else {
//         toast.error('Failed to fetch messages');
//       }
//     } catch (error) {
//       toast.error(`Error fetching messages: ${error.message}`);
//       console.error('Messages error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendMessage = () => {
//     if (!newMessage || !selectedUser || !userId) {
//       toast.error('Please select a user and type a message');
//       return;
//     }
    
//     const message = {
//       sender_id: userId,
//       receiver_id: selectedUser.user_id,
//       message: newMessage,
//       timestamp: new Date().toISOString(),
//     };
    
//     // Optimistically add to UI first
//     setMessages((prev) => [...prev, message]);
//     setNewMessage('');
    
//     // Try socket.io first
//     const socketInstance = initializeSocket();
    
//     if (socketConnected) {
//       console.log('Sending message via socket:', message);
//       socketInstance.emit('message', message);
//     } else {
//       console.log('Socket not connected, using HTTP fallback...');
      
//       // HTTP fallback
//       fetch('http://localhost:3000/api/send-message', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify(message)
//       })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         console.log('Message sent via HTTP fallback:', data);
//       })
//       .catch(error => {
//         console.error('HTTP fallback error:', error);
//         toast.error('Failed to send message. Please try again.');
//       });
//     }
//   };  const handleUserSelect = (user) => {
//     setSelectedUser(user);
//     fetchMessages(user.user_id);
//   };

//   return (
//     <div className="chat-page">
//       <Nav />
//       <div className="chat-container">
//         <h2>Chat {socketConnected ? '(Connected)' : '(Offline Mode)'}</h2>
//         <div className="chat-content">
//           <div className="user-search">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search users..."
//               disabled={loading}
//               onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
//             />
//             <button onClick={fetchUsers} disabled={loading}>
//               {loading ? 'Searching...' : 'Search'}
//             </button>
//             <div className="user-list">
//               {users.length > 0 ? (
//                 users.map((user) => (
//                   <div
//                     key={user.user_id}
//                     className={`user-item ${selectedUser?.user_id === user.user_id ? 'selected' : ''}`}
//                     onClick={() => handleUserSelect(user)}
//                   >
//                     {user.name} ({user.email})
//                   </div>
//                 ))
//               ) : searchAttempted ? (
//                 <div className="no-users">No users found</div>
//               ) : null}
//             </div>
//           </div>
//           <div className="chat-area">
//             {selectedUser ? (
//               <>
//                 <div className="chat-header">
//                   <h3>Chatting with {selectedUser.name}</h3>
//                 </div>
//                 <div className="messages">
//                   {messages.length > 0 ? (
//                     messages.map((msg, index) => (
//                       <div
//                         key={index}
//                         className={`message ${msg.sender_id === userId ? 'sent' : 'received'}`}
//                       >
//                         <span>{msg.sender_id === userId ? 'You' : selectedUser.name}:</span> {msg.message}
//                       </div>
//                     ))
//                   ) : (
//                     <div className="no-messages">
//                       <p>No messages yet. Start a conversation!</p>
//                     </div>
//                   )}
//                 </div>
//                 <div className="message-input">
//                   <input
//                     type="text"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     placeholder="Type a message..."
//                     onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//                     disabled={loading}
//                   />
//                   <button 
//                     onClick={sendMessage} 
//                     disabled={loading}
//                   >
//                     Send
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <div className="no-selection">
//                 <p>Select a user to start chatting</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;