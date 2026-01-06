import React from 'react';
import auctionImage from './auctionimg.jpg'; 

function Landing() {
  return (
    <>
      <div className='content'>
        <h2>Welcome to Auction App</h2>
        <img 
          src={auctionImage} 
          alt="Auction" 
          style={{ width: '300px', height: 'auto' }} // Inline style to resize the image
        />
        <p>
          An auction is usually a process of buying and selling goods or services by offering them up for bids, taking bids, and then selling the item to the highest bidder or buying the item from the lowest bidder. Some exceptions to this definition exist and are described in the section about different types.
        </p>
      </div>
    </>
  );
}

export default Landing;
