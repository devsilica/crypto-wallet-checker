import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";


// --- Networks / Exchanges ---
const networks = {
  ethereum: { name: "Ethereum", rpc: "https://rpc.ankr.com/eth", symbol: "ETH" },
  polygon: { name: "Polygon", rpc: "https://polygon-rpc.com", symbol: "MATIC" },
  bnb: { name: "BNB Chain", rpc: "https://bsc-dataseed.binance.org", symbol: "BNB" },
  arbitrum: { name: "Arbitrum", rpc: "https://arb1.arbitrum.io/rpc", symbol: "ETH" },
  optimism: { name: "Optimism", rpc: "https://mainnet.optimism.io", symbol: "ETH" },
  base: { name: "Base", rpc: "https://mainnet.base.org", symbol: "ETH" },
};

export default function App() {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("ethereum");
  const [balance, setBalance] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [refresh, setRefresh] = useState(false);

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAddress(accounts[0]);
    setProvider(new ethers.BrowserProvider(window.ethereum));
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAddress("");
    setProvider(null);
    setBalance(0);
    setUsdValue(0);
  };

  // Fetch Balance & USD
  const fetchBalance = async () => {
    if (!address) return;
    const rpc = new ethers.JsonRpcProvider(networks[network].rpc);
    const bal = await rpc.getBalance(address);
    const eth = Number(ethers.formatEther(bal));
    setBalance(eth);

    let current = 0;
    const step = eth / 50;
    const anim = setInterval(() => {
      current += step;
      if (current >= eth) {
        current = eth;
        clearInterval(anim);
      }
      setAnimatedBalance(current);
    }, 20);

    // USD value
    const price = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    ).then((res) => res.json());
    setUsdValue((eth * price.ethereum.usd).toFixed(2));
  };

  useEffect(() => {
    if (address) fetchBalance();
  }, [address, network, refresh]);

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>Crypto Wallet Checker</h1>
        <div className="header-right">
          {/* Network Selection Pills */}
          <div className="network-pills">
            {Object.keys(networks).map((key) => (
              <button
                key={key}
                className={`pill ${network === key ? "active" : ""}`}
                onClick={() => setNetwork(key)}
              >
                {networks[key].name}
              </button>
            ))}
          </div>

          {!address ? (
            <button className="connect-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect
            </button>
          )}
        </div>
      </header>

      {/* DASHBOARD */}
      <main className="dashboard">
        {!address ? (
          <div className="placeholder-card">
            <p>Connect your wallet to view balances & portfolio</p>
          </div>
        ) : (
          <>
            <div className="card wallet-card">
              <h2>Wallet Overview</h2>
              <p className="address">{address}</p>
              <h1>{animatedBalance.toFixed(4)} {networks[network].symbol}</h1>
              <p className="usd">${usdValue} USD</p>
              <button className="refresh-btn" onClick={() => setRefresh((p) => !p)}>Refresh</button>
            </div>

            <div className="card token-card">
              <h2>Tokens</h2>
              <p className="coming-soon">Token balances and portfolio will display here...</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
