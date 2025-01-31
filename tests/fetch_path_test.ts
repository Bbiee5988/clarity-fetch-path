import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can register an authorized vet",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('fetch_path', 'register-authorized-vet', [
                types.ascii("Dr. Smith"),
                types.ascii("VET123456"),
                types.buff("0102030405060708091011121314151617181920212223242526272829303132")
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk();
    }
});

Clarinet.test({
    name: "Can register a new pet",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('fetch_path', 'register-pet', [
                types.ascii("Buddy"),
                types.ascii("Dog"),
                types.uint(1640995200) // 2022-01-01
            ], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Verify pet info
        let petInfoBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'get-pet-info', [
                types.uint(1)
            ], wallet1.address)
        ]);
        
        const petInfo = petInfoBlock.receipts[0].result.expectOk().expectSome();
        assertEquals(petInfo['name'], "Buddy");
        assertEquals(petInfo['species'], "Dog");
    }
});

Clarinet.test({
    name: "Authorized vet can add verified record",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        // First register vet
        let vetBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'register-authorized-vet', [
                types.ascii("Dr. Smith"),
                types.ascii("VET123456"),
                types.buff("0102030405060708091011121314151617181920212223242526272829303132")
            ], deployer.address)
        ]);
        
        // Register pet
        let petBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'register-pet', [
                types.ascii("Buddy"),
                types.ascii("Dog"),
                types.uint(1640995200)
            ], deployer.address)
        ]);
        
        // Add vet record
        let recordBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'add-vet-record', [
                types.uint(1),
                types.uint(1641081600),
                types.ascii("Annual checkup"),
                types.ascii("Healthy"),
                types.ascii("None required"),
                types.uint(1641081600),
                types.buff("000102030405060708091011121314151617181920212223242526272829303132333435363738394041424344454647484950515253545556575859606162636465")
            ], deployer.address)
        ]);
        
        recordBlock.receipts[0].result.expectOk();
        
        // Verify record is marked as verified
        let verifyBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'is-vet-verified', [
                types.uint(1),
                types.uint(1)
            ], deployer.address)
        ]);
        
        verifyBlock.receipts[0].result.expectOk().expectBool(true);
    }
});
