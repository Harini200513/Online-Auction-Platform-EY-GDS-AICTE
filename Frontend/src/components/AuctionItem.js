import React, { useState, useEffect } from 'react';
import axios from 'axios';
<<<<<<< HEAD
import { useParams, useNavigate } from 'react-router-dom';

function AuctionItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({});
  const [bid, setBid] = useState('');
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState(null);

  const fetchItem = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/auctions/${id}`);
      const itemData = res.data;
      setItem(itemData);
      
      // Check if auction is closed and set winner
      if (itemData.isClosed || (itemData.closingTime && new Date() > new Date(itemData.closingTime))) {
        if (itemData.highestBidder) {
          setWinner({
            username: itemData.highestBidder,
            amount: itemData.currentBid
          });
        }
      }
    } catch (error) {
      setMessage('Error fetching auction item: ' + (error.response?.data?.message || error.message));
      console.error(error);
    }
  };

  useEffect(() => {
    fetchItem();
    
    // Poll every 5 seconds to check if auction ended
    const interval = setInterval(() => {
      fetchItem();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const handleBid = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setMessage('You must be signed in to place a bid.');
      navigate('/signin');
      return;
    }

    const bidAmount = parseFloat(bid);
    
    if (isNaN(bidAmount) || bidAmount <= 0) {
      setMessage('Please enter a valid bid amount.');
      return;
    }

    if (bidAmount <= (item.currentBid || 0)) {
=======
import { useParams } from 'react-router-dom';

function AuctionItem() {
  const { id } = useParams();
  const [item, setItem] = useState({});
  const [bid, setBid] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/auctions/${id}`);
        setItem(res.data);
      } catch (error) {
        setMessage('Error fetching auction item: ' + error.response?.data?.message || error.message);
        console.error(error);
      }
    };

    fetchItem();
  }, [id]);

  const handleBid = async () => {
    const username = prompt('Enter your username to place a bid:');

    if (bid <= item.currentBid) {
>>>>>>> df1169c9deb288991c0467a0f5379b2fbd4d9809
      setMessage('Bid must be higher than the current bid.');
      return;
    }

<<<<<<< HEAD
    if (item.isClosed) {
      setMessage('This auction is closed.');
      return;
    }

    // Check if auction has ended
    if (item.closingTime && new Date() > new Date(item.closingTime)) {
      setMessage('This auction has ended.');
      fetchItem(); // Refresh to get winner
      return;
    }

    setMessage('');
    
    try {
      const res = await axios.post(
        `http://localhost:5001/bid/${id}`,
        { bid: bidAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(res.data.message);
      
      // If auction closed, set winner
      if (res.data.winner) {
        const winnerAmount = res.data.amount || res.data.item?.currentBid || item.currentBid;
        setWinner({
          username: res.data.winner,
          amount: winnerAmount
        });
      }
      
      // Refresh item data to update current bid and highest bidder
      await fetchItem();
      setBid(''); // Clear bid input
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error placing bid.';
      setMessage(errorMessage);
      console.error('Bid error:', error);
      
      // If auction closed error, refresh to get winner
      if (errorMessage.includes('closed') || errorMessage.includes('ended')) {
        await fetchItem();
      }
    }
  };

  const isAuctionClosed = item.isClosed || (item.closingTime && new Date() > new Date(item.closingTime));

=======
    try {
      const res = await axios.post(`http://localhost:5001/bid/${id}`, { bid, username });
      setMessage(res.data.message);
      if (res.data.winner) {
        setMessage(`Auction closed. Winner: ${res.data.winner}`);
      }
    } catch (error) {
      setMessage('Error placing bid.');
      console.error(error);
    }
  };

>>>>>>> df1169c9deb288991c0467a0f5379b2fbd4d9809
  return (
    <div>
      <h2>{item.itemName}</h2>
      <p>{item.description}</p>
<<<<<<< HEAD
      <p>Current Bid: ${item.currentBid || 0}</p>
      <p>Highest Bidder: {item.highestBidder || 'No bids yet'}</p>
      {item.closingTime && (
        <p>Closing Time: {new Date(item.closingTime).toLocaleString()}</p>
      )}
      
      {winner && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '5px',
          margin: '15px 0',
          color: '#155724'
        }}>
          <h3>🏆 Auction Ended - Winner Declared!</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Winner: {winner.username} with bid ${winner.amount}
          </p>
        </div>
      )}
      
      {!isAuctionClosed && (
        <>
          <input
            type="number"
            value={bid}
            onChange={(e) => setBid(e.target.value)}
            placeholder="Enter your bid"
            min={item.currentBid ? item.currentBid + 0.01 : 0.01}
            step="0.01"
          />
          <button onClick={handleBid}>Place Bid</button>
        </>
      )}
      
      {message && (
        <p className="message" style={{ 
          color: message.includes('successful') ? 'green' : 'red',
          marginTop: '10px'
        }}>
          {message}
        </p>
      )}
=======
      <p>Current Bid: ${item.currentBid}</p>
      <p>Highest Bidder: {item.highestBidder || 'No bids yet'}</p>
      <input
        type="number"
        value={bid}
        onChange={(e) => setBid(e.target.value)}
        placeholder="Enter your bid"
      />
      <button onClick={handleBid}>Place Bid</button>
      {message && <p className="message">{message}</p>}
>>>>>>> df1169c9deb288991c0467a0f5379b2fbd4d9809
    </div>
  );
}

export default AuctionItem;
