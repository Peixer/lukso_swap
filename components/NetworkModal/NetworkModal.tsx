import React, { useEffect, useState } from "react";
import styles from "./NetworkModal.module.css";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";

/**
 * NetworkModal
 */
export function NetworkModal() {
  const [
    {
      chains, // the list of chains that web3-onboard was initialized with
      connectedChain, // the current chain the user's wallet is connected to
      settingChain // boolean indicating if the chain is in the process of being set
    },
    setChain // function to call to initiate user to switch chains in their wallet
  ] = useSetChain();

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAction = async () => {
    // Switch Network
    if(wallet){
      disconnect(wallet);
      setChain({ chainNamespace: chains[0].namespace, chainId: chains[0].id });
      connect();
    }
  };

  useEffect(() => {
    console.log("connectedChain change: ", connectedChain);
    console.log("settingChain change: ", settingChain);
    if(connectedChain){
      // If user is connected but not on the testnet
      if(connectedChain.id !== chains[0].id){
        setIsModalOpen(true);
      } else{
        closeModal();
      }
    } else{ // We need to connect the user
      console.debug("user needs to connect a wallet");
    }
  }, [connectedChain, settingChain]);

  useEffect(() => {
    console.log("wallet change: ", wallet);
  }, [wallet]);

  if (!isModalOpen) {
    return null;
  }
  
  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalInnerContainer}>
        <h3 className="mt-0">Wrong network</h3>
        <p>You need to switch network to access LuksoSwap</p>
        <div className={styles.buttonContainer}>
          <button className={styles.switchNetworkButton} onClick={handleAction}>Switch Network</button>
        </div>
      </div>
    </div>
  );
}
