import React, { useEffect, useState } from 'react';
import './App.css';

declare global {
  interface Window {
      ethereum: any;
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");

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

  const formatAddress = (address: String) => (address.substring(0, 5) + "..." + address.substr(-4, 4))

  return (
    <div className="App">
      <header className="App-header">
      <div style={{margin: "10px"}}>
        {currentAccount !== "" ? (
          <span className="nes-text is-primary">{formatAddress(currentAccount)}</span>
        ) : (
          
            <button onClick={() => connect()} className="nes-btn is-primary">Connect</button>
        )}
      </div>
      </header>
    </div>
  );
}

export default App;
