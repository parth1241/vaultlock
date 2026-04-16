#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, token, Symbol};

#[contract]
pub struct LiquidityPool;

#[contractimpl]
impl LiquidityPool {
    pub fn initialize(env: Env, token: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "token")) {
            panic!("already initialized");
        }
        env.storage().instance().set(&Symbol::new(&env, "token"), &token);
    }

    pub fn deposit(env: Env, from: Address, amount: i128) {
        from.require_auth();
        let token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "token")).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        
        // Transfer tokens from the caller to this contract using transfer_from
        // The pool (current contract) is the spender
        token_client.transfer_from(&env.current_contract_address(), &from, &env.current_contract_address(), &amount);

        // Update user pool share
        let current_share: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        env.storage().persistent().set(&from, &(current_share + amount));
    }

    pub fn withdraw(env: Env, to: Address, amount: i128) {
        to.require_auth();
        
        // Update user pool share
        let current_share: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        if current_share < amount {
            panic!("insufficient pool share");
        }
        env.storage().persistent().set(&to, &(current_share - amount));

        // Transfer tokens from this contract to the user
        let token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "token")).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &to, &amount);
    }

    pub fn balance_of(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&user).unwrap_or(0)
    }
    
    // Total liquidity in the pool (from token contract)
    pub fn pool_balance(env: Env) -> i128 {
        let token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "token")).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        token_client.balance(&env.current_contract_address())
    }
}
