'use client';

import React, { useState, useEffect } from 'react';
import { useStellarWallet } from '@/lib/context/StellarWalletContext';
import { Contract, rpc, TransactionBuilder, Networks, xdr, Address, scValToNative } from '@stellar/stellar-sdk';
import { useToast } from '@/lib/context/ToastContext';
import { Loader2, ArrowDownCircle, ArrowUpCircle, Coins, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';

const POOL_CONTRACT_ID = process.env.NEXT_PUBLIC_POOL_CONTRACT_ID || '';
const TOKEN_CONTRACT_ID = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID || '';
const TESTNET_NETWORK_PASSPHRASE = Networks.TESTNET;
const rpcServer = new rpc.Server(process.env.NEXT_PUBLIC_SOROBAN_RPC || 'https://soroban-testnet.stellar.org:443');

export function LiquidityPoolCard() {
  const { address, kit } = useStellarWallet();
  const { showToast } = useToast();
  
  const [balance, setBalance] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [allowance, setAllowance] = useState<string>('0');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (address && POOL_CONTRACT_ID && TOKEN_CONTRACT_ID) {
      fetchAllData();
    }
  }, [address]);

  const fetchAllData = async () => {
    if (!address) return;
    try {
      setLoadingBalance(true);
      const poolContract = new Contract(POOL_CONTRACT_ID);
      const tokenContract = new Contract(TOKEN_CONTRACT_ID);
      const userAddr = new Address(address);
      const loadeAccount = await rpcServer.getAccount(address);

      const txBuilder = new TransactionBuilder(loadeAccount, { fee: '100', networkPassphrase: TESTNET_NETWORK_PASSPHRASE });
      
      // Batch simulation for performance
      const simTx = txBuilder
        .addOperation(poolContract.call('balance_of', userAddr.toScVal()))
        .addOperation(tokenContract.call('balance', userAddr.toScVal()))
        .addOperation(tokenContract.call('allowance', userAddr.toScVal(), poolContract.address().toScVal()))
        .setTimeout(30).build();

      const simResult = await rpcServer.simulateTransaction(simTx);
      
      if (rpc.Api.isSimulationSuccess(simResult)) {
        // results are in order of operations
        const results = simResult.result.results || [];
        if (results[0]?.retval) setBalance(scValToNative(results[0].retval).toString());
        if (results[1]?.retval) setTokenBalance(scValToNative(results[1].retval).toString());
        if (results[2]?.retval) setAllowance(scValToNative(results[2].retval).toString());
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleAirdrop = async () => {
    if (!address) return;
    try {
      setMinting(true);
      const contract = new Contract(TOKEN_CONTRACT_ID);
      const sourceAccount = await rpcServer.getAccount(address);
      const tx = new TransactionBuilder(sourceAccount, { fee: '1000', networkPassphrase: TESTNET_NETWORK_PASSPHRASE })
        .addOperation(contract.call('airdrop', new Address(address).toScVal(), xdr.ScVal.scvI128(new xdr.Int128Parts({
          lo: xdr.Uint64.fromString("1000"),
          hi: xdr.Int64.fromString("0")
        }))))
        .setTimeout(30).build();

      const preparedTx = await rpcServer.prepareTransaction(tx);
      const signedXdr = await kit.signTransaction(preparedTx.toXDR());
      const signedTx = TransactionBuilder.fromXDR(signedXdr.signedTxXdr, TESTNET_NETWORK_PASSPHRASE) as any;
      const response = await rpcServer.sendTransaction(signedTx);
      
      if (response.status !== 'ERROR') {
        showToast('Airdrop successful (1000 TOK)', 'success');
        await fetchAllData();
      } else {
        showToast(`Airdrop failed: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (err: any) {
      console.error('Airdrop error:', err);
      showToast(err.message || 'Airdrop failed - check network connection', 'error');
    } finally {
      setMinting(false);
    }
  };

  const handleApprove = async () => {
    if (!address || !amount) return;
    try {
      setLoading(true);
      const contract = new Contract(TOKEN_CONTRACT_ID);
      const poolContract = new Contract(POOL_CONTRACT_ID);
      const sourceAccount = await rpcServer.getAccount(address);
      
      const latestLedger = await rpcServer.getLatestLedger();
      const expiration = latestLedger.sequence + 500000; // ~1 month of ledger time

      const tx = new TransactionBuilder(sourceAccount, { fee: '1000', networkPassphrase: TESTNET_NETWORK_PASSPHRASE })
        .addOperation(contract.call('approve', 
          new Address(address).toScVal(), 
          poolContract.address().toScVal(),
          xdr.ScVal.scvI128(new xdr.Int128Parts({
            lo: xdr.Uint64.fromString(amount.toString()),
            hi: xdr.Int64.fromString("0")
          })),
          xdr.ScVal.scvU32(expiration)
        ))
        .setTimeout(30).build();

      const preparedTx = await rpcServer.prepareTransaction(tx);
      const signedXdr = await kit.signTransaction(preparedTx.toXDR());
      const signedTx = TransactionBuilder.fromXDR(signedXdr.signedTxXdr, TESTNET_NETWORK_PASSPHRASE) as any;
      const response = await rpcServer.sendTransaction(signedTx);
      
      if (response.status !== 'ERROR') {
        showToast('Pool approved successfully', 'success');
        await fetchAllData();
      } else {
        showToast(`Approval failed: ${response.error || 'User rejected or network error'}`, 'error');
      }
    } catch (err: any) {
      console.error('Approval error:', err);
      showToast(err.message || 'Approval failed - please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'deposit' | 'withdraw') => {
    if (!address) return showToast('Connect wallet first', 'error');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return showToast('Enter valid amount', 'error');

    if (action === 'deposit' && Number(allowance) < Number(amount)) {
      return showToast('Please approve the pool first', 'error');
    }

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
          await fetchAllData();
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

  const needsApproval = amount && Number(allowance) < Number(amount);

  return (
    <div className="card-surface p-6 rounded-xl border border-indigo-500/20 bg-[#120f00]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Coins size={20} className="text-indigo-400" />
            Liquidity Pool
          </h2>
          <p className="text-xs text-slate-400 mt-1">Interact with the Soroban Sep-41 pool</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Your Share</p>
          <div className="font-mono text-indigo-400 font-bold flex items-center space-x-2">
            {loadingBalance ? <Loader2 size={12} className="animate-spin" /> : <span>{balance} TOK</span>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Your Tokens</p>
            <p className="text-sm font-mono text-slate-200">{tokenBalance} TOK</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Allowance</p>
            <p className={cn("text-sm font-mono", Number(allowance) > 0 ? "text-indigo-400" : "text-slate-500")}>
              {allowance} TOK
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {address && (
              <button 
                onClick={handleAirdrop}
                disabled={minting}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
              >
                {minting ? 'Minting...' : 'Airdrop'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {needsApproval && (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="w-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-500/30 transition-all"
            >
              <Fingerprint size={16} />
              Approve Pool toSpend TOK
            </button>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleAction('deposit')}
              disabled={loading || !address || needsApproval}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 py-2.5 text-sm disabled:grayscale disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownCircle size={16} />}
              <span>Deposit</span>
            </button>
            <button
              onClick={() => handleAction('withdraw')}
              disabled={loading || !address}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpCircle size={16} />}
              <span>Withdraw</span>
            </button>
          </div>
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
      </div>
    </div>
  );
}
