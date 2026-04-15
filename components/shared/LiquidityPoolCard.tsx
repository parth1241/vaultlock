'use client';

import React, { useState, useEffect } from 'react';
import { useStellarWallet } from '@/lib/context/StellarWalletContext';
import { Contract, SorobanRpc, TransactionBuilder, Networks, xdr, Address, scValToNative } from '@stellar/stellar-sdk';
import { useToast } from '@/lib/context/ToastContext';
import { Loader2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const POOL_CONTRACT_ID = process.env.NEXT_PUBLIC_POOL_CONTRACT_ID || '';
const TESTNET_NETWORK_PASSPHRASE = Networks.TESTNET;
const rpcServer = new SorobanRpc.Server(process.env.NEXT_PUBLIC_SOROBAN_RPC || 'https://soroban-testnet.stellar.org:443');

export function LiquidityPoolCard() {
  const { address, kit } = useStellarWallet();
  const { showToast } = useToast();
  
  const [balance, setBalance] = useState<string>('0');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (address && POOL_CONTRACT_ID) {
      fetchBalance();
    }
  }, [address]);

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const contract = new Contract(POOL_CONTRACT_ID);
      
      const txBuilder = new TransactionBuilder(await rpcServer.getAccount(address!), { fee: '100', networkPassphrase: TESTNET_NETWORK_PASSPHRASE });
      const tx = txBuilder.addOperation(
        contract.call('balance_of', new Address(address!).toScVal())
      ).setTimeout(30).build();

      const simResult = await rpcServer.simulateTransaction(tx);
      
      if (SorobanRpc.Api.isSimulationSuccess(simResult)) {
        const val = scValToNative(simResult.result.retval);
        setBalance(val.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleAction = async (action: 'deposit' | 'withdraw') => {
    if (!address) return showToast('Connect wallet first', 'error');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return showToast('Enter valid amount', 'error');
    if (!POOL_CONTRACT_ID) return showToast('Pool contract not configured', 'error');

    try {
      setLoading(true);
      setTxHash(null);
      const contract = new Contract(POOL_CONTRACT_ID);
      
      const sourceAccount = await rpcServer.getAccount(address);
      const txBuilder = new TransactionBuilder(sourceAccount, { fee: '1000', networkPassphrase: TESTNET_NETWORK_PASSPHRASE });
      
      const tx = txBuilder.addOperation(
        contract.call(action, new Address(address).toScVal(), xdr.ScVal.scvI128(new xdr.Int128Parts({
          lo: xdr.Uint64.fromString(amount.toString()),
          hi: xdr.Int64.fromString("0")
        })))
      ).setTimeout(30).build();

      const preparedTx = await rpcServer.prepareTransaction(tx);
      const signedXdr = await kit.signTransaction(preparedTx.toXDR());
      const signedTx = TransactionBuilder.fromXDR(signedXdr.signedTxXdr, TESTNET_NETWORK_PASSPHRASE) as any;
      
      const response = await rpcServer.sendTransaction(signedTx);
      
      if (response.status === 'PENDING') {
        let statusResponse;
        do {
          await new Promise(resolve => setTimeout(resolve, 2000));
          statusResponse = await rpcServer.getTransaction(response.hash);
        } while (statusResponse.status === 'NOT_FOUND');

        if (statusResponse.status === 'SUCCESS') {
          showToast(`Successfully ${action === 'deposit' ? 'deposited' : 'withdrawn'} tokens`, 'success');
          setTxHash(response.hash);
          setAmount('');
          await fetchBalance();
        } else {
          showToast(`Failed to ${action} tokens`, 'error');
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Transaction failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-surface p-6 rounded-xl border border-indigo-500/20 bg-[#120f00]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Liquidity Pool</h2>
          <p className="text-xs text-slate-400 mt-1">Interact with the Soroban SAC pool</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Your Share</p>
          <div className="font-mono text-indigo-400 font-bold flex items-center space-x-2">
            {loadingBalance ? <Loader2 size={12} className="animate-spin" /> : <span>{balance} TOK</span>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => handleAction('deposit')}
            disabled={loading || !address}
            className="flex-1 btn-primary flex items-center justify-center space-x-2 py-2.5 text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownCircle size={16} />}
            <span>Deposit</span>
          </button>
          <button
            onClick={() => handleAction('withdraw')}
            disabled={loading || !address}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpCircle size={16} />}
            <span>Withdraw</span>
          </button>
        </div>

        {txHash && (
          <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg break-all text-center">
            <p className="text-xs text-slate-400 mb-1">Transaction Hash</p>
            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono block truncate"
            >
              {txHash}
            </a>
          </div>
        )}
        
        {!address && (
          <p className="text-xs text-rose-400 text-center mt-2 font-medium">Connect wallet to interact with the pool</p>
        )}
      </div>
    </div>
  );
}
