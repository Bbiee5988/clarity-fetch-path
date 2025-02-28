import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

// [Previous tests remain unchanged...]

Clarinet.test({
    name: "Can update pet profile",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Register pet
        let block = chain.mineBlock([
            Tx.contractCall('fetch_path', 'register-pet', [
                types.ascii("Buddy"),
                types.ascii("Dog"),
                types.uint(1640995200)
            ], wallet1.address)
        ]);
        
        // Update profile
        let updateBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'update-pet-profile', [
                types.uint(1),
                types.ascii("Max"),
                types.some(wallet2.address)
            ], wallet1.address)
        ]);
        
        updateBlock.receipts[0].result.expectOk();
        
        // Verify update
        let petInfoBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'get-pet-info', [
                types.uint(1)
            ], wallet1.address)
        ]);
        
        const petInfo = petInfoBlock.receipts[0].result.expectOk().expectSome();
        assertEquals(petInfo['name'], "Max");
    }
});

Clarinet.test({
    name: "Can transfer pet ownership",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Register pet
        let block = chain.mineBlock([
            Tx.contractCall('fetch_path', 'register-pet', [
                types.ascii("Buddy"),
                types.ascii("Dog"),
                types.uint(1640995200)
            ], wallet1.address)
        ]);
        
        // Transfer ownership
        let transferBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'transfer-pet-ownership', [
                types.uint(1),
                types.principal(wallet2.address)
            ], wallet1.address)
        ]);
        
        transferBlock.receipts[0].result.expectOk();
        
        // Verify new owner
        let petInfoBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'get-pet-info', [
                types.uint(1)
            ], wallet2.address)
        ]);
        
        const petInfo = petInfoBlock.receipts[0].result.expectOk().expectSome();
        assertEquals(petInfo['owner'], wallet2.address);
    }
});
