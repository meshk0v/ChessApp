import React, { useEffect, useState } from 'react';
import './MarketPlace.css'; // Стили для страницы
import axios from 'axios';

const MarketPlace = () => {
  const [nftItems, setNftItems] = useState([]); // Состояние для NFT
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Получение данных с API
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await axios.get('https://example.com/api/nfts'); // URL для получения данных
        setNftItems(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch NFTs. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  // Обработка покупки NFT
  const handleBuy = async (nftId) => {
    if (!window.TonWallet || !window.TonWallet.requestPayment) {
      alert('TON Wallet not connected. Please connect your wallet.');
      return;
    }

    try {
      // Запрос оплаты через TON Wallet
      await window.TonWallet.requestPayment({
        recipient: 'TON_WALLET_ADDRESS', // Замените на ваш адрес TON
        amount: '0.5', // Укажите цену (в TON)
        comment: `Purchase NFT: ${nftId}`,
      });
      alert('Payment successful! Your NFT will be transferred shortly.');
    } catch (err) {
      alert('Payment failed. Please try again.');
    }
  };

  if (isLoading) return <div className="marketplace-container"><div className="marketplace-loading">Loading NFTs...</div></div>;
  if (error) return <div className="marketplace-container"><div className="marketplace-error">{error}</div></div>;

  return (
    <div className="marketplace-container">
      <h1>MarketPlace</h1>
      <div className="nft-grid">
        {nftItems.map((nft) => (
          <div key={nft.id} className="nft-card">
            <img src={nft.image} alt={nft.name} className="nft-image" />
            <div className="nft-info">
              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
              <p className="nft-price">{nft.price} TON</p>
              <button onClick={() => handleBuy(nft.id)}>Buy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketPlace;
