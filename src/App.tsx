import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import gameAbi from './Game.json';
import { contractAddress } from './constants';
import './App.css';
import SelectCharacter from './SelectCharacter';
import { Character } from './Character';
import Arena from './Arena';

declare global {
  interface Window {
      ethereum: any;
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [character, setCharacter] = useState<Character>();

  const isConnected = async () => {
    const { ethereum } = window;
    if (ethereum) {
      console.log("Connected!");

      // eth_accounts only gets the accounts, does not connect
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length > 0) {
        console.log("Found account", accounts[0])
        setCurrentAccount(accounts[0])
      } else {
        console.log("No accounts found")
      }
    } else {
      alert('Please install MetaMask');
      return;
    }
  }

  useEffect(() => {
    isConnected()
  }, [])

  const connect = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setCurrentAccount(accounts[0])
      } else {
        console.log("No accounts found")
      }
    } else {
      console.log("No metamask");
    }
  }

  const formatAddress = (address: string) => (address.substring(0, 5) + "..." + address.substr(-4, 4))

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const { ethereum } = window;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        contractAddress,
        gameAbi.abi,
        signer
      );

      const txn = await gameContract.getPlayer();
      if (txn.name) {
        console.log('User has character NFT');
        const cleanedCharacter: Character = {
          name: txn.name,
          image: txn.image,
          hp: txn.hp.toNumber(),
          xp: txn.xp.toNumber(),
          gold: txn.gold.toNumber(),
        };

        setCharacter(cleanedCharacter);
      } else {
        console.log('No character NFT found');
      }
    };

    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  const connected = currentAccount !== ""

  return (
    <div className="App">
      <header className="App-header">
        <div style={{margin: "10px"}}>
          {connected ? (
            <span className="nes-text is-primary">{formatAddress(currentAccount)}</span>
          ) : (
            <button onClick={() => connect()} className="nes-btn is-primary">Connect</button>
          )}
        </div>
      </header>
      <div className="App-main">
        {connected && !character && (
          <SelectCharacter setCharacterNFT={setCharacter}/>
        )}
        {connected && character && (
          <Arena/>
        )}
      </div>
    </div>
  );
}

export default App;
