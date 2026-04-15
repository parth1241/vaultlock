#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct CustomToken;

#[contractimpl]
impl CustomToken {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&"admin") {
            panic!("already initialized")
        }
        env.storage().instance().set(&"admin", &admin);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&"admin").unwrap();
        admin.require_auth();
        let balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(balance + amount));
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().persistent().get(&id).unwrap_or(0)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_balance: i128 = env.storage().persistent().get(&from).unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance")
        }
        let to_balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);

        env.storage().persistent().set(&from, &(from_balance - amount));
        env.storage().persistent().set(&to, &(to_balance + amount));
    }
}
