#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

#[contract]
pub struct CustomToken;

#[contractimpl]
impl CustomToken {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            panic!("already initialized")
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();
        let balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(balance + amount));
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().persistent().get(&id).unwrap_or(0)
    }

    pub fn airdrop(env: Env, to: Address, amount: i128) {
        let balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        env.storage().persistent().set(&to, &(balance + amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        Self::do_transfer(&env, &from, &to, amount);
    }

    pub fn approve(env: Env, from: Address, spender: Address, amount: i128, _expiration_ledger: u32) {
        from.require_auth();
        let key = (Symbol::new(&env, "allowance"), from, spender);
        env.storage().temporary().set(&key, &amount);
    }

    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let key = (Symbol::new(&env, "allowance"), from, spender);
        env.storage().temporary().get(&key).unwrap_or(0)
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        let key = (Symbol::new(&env, "allowance"), from.clone(), spender.clone());
        let allowance: i128 = env.storage().temporary().get(&key).unwrap_or(0);
        
        if allowance < amount {
            panic!("insufficient allowance");
        }
        
        env.storage().temporary().set(&key, &(allowance - amount));
        Self::do_transfer(&env, &from, &to, amount);
    }

    fn do_transfer(env: &Env, from: &Address, to: &Address, amount: i128) {
        let from_balance: i128 = env.storage().persistent().get(from).unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance")
        }
        let to_balance: i128 = env.storage().persistent().get(to).unwrap_or(0);

        env.storage().persistent().set(from, &(from_balance - amount));
        env.storage().persistent().set(to, &(to_balance + amount));
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_token() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        
        env.mock_all_auths();
        
        let contract_id = env.register_contract(None, CustomToken);
        let client = CustomTokenClient::new(&env, &contract_id);
        
        client.initialize(&admin);
        client.mint(&user1, &1000);
        assert_eq!(client.balance(&user1), 1000);
        
        client.transfer(&user1, &user2, &300);
        assert_eq!(client.balance(&user1), 700);
        assert_eq!(client.balance(&user2), 300);
        
        let spender = Address::generate(&env);
        client.approve(&user1, &spender, &500, &100);
        assert_eq!(client.allowance(&user1, &spender), 500);
        
        client.transfer_from(&spender, &user1, &user2, &200);
        assert_eq!(client.balance(&user1), 500);
        assert_eq!(client.balance(&user2), 500);
        assert_eq!(client.allowance(&user1, &spender), 300);
    }
}
