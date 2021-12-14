import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import lootAbi from './Loot.json';
import './App.css';

declare global {
  interface Window {
      ethereum: any;
  }
}

const contractAddress = "0xA070454b144bC7D589a78CC50a4c3e4a263f8663"


function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [mintResult, setMintResult] = useState("");
  const [mintError, setMintError] = useState("");

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

  const mint = async (tokenId: any) => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, lootAbi.abi, signer)
        const tx = await contract.mintLoot(tokenId)
        await tx.wait()
        
        console.log("Minted nft with transaction hash", tx.hash)
        setMintResult(`https://testnets.opensea.io/assets/${contractAddress}/${tokenId}`)
        setMintError("")
      }
    } catch (err: any) {
      console.log(err)
      setMintResult("")
      setMintError(err.message)
    }
  }

  const connected = currentAccount !== ""

  const updateTokenId = (event: any) => {
    setTokenId(event.target.value)
  }

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
        <div className="nes-field">
          <label htmlFor="tokenIdField" style={{color: "white"}}>Token Id</label>
          <input type="text" id="tokenIdField" onChange={updateTokenId} className="nes-input"/>
        </div>
        <button disabled={!connected} onClick={() => mint(tokenId)} className="nes-btn is-primary">Mint</button>
        {mintResult && <a style={{color: "white", fontSize: "10px"}} href={mintResult}>OpenSea link</a>}
        {mintError && <span style={{color: "white", fontSize: "10px"}}>{mintError}</span>}
      </div>
    </div>
  );
}

export default App;
