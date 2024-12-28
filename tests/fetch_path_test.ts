import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

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
    name: "Can add vet record for owned pet",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // First register a pet
        let block = chain.mineBlock([
            Tx.contractCall('fetch_path', 'register-pet', [
                types.ascii("Buddy"),
                types.ascii("Dog"),
                types.uint(1640995200)
            ], wallet1.address)
        ]);
        
        // Then add a vet record
        let vetBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'add-vet-record', [
                types.uint(1),
                types.uint(1641081600), // 2022-01-02
                types.ascii("Annual checkup"),
                types.ascii("Dr. Smith")
            ], wallet1.address)
        ]);
        
        vetBlock.receipts[0].result.expectOk();
        
        // Verify vet record
        let recordBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'get-vet-record', [
                types.uint(1),
                types.uint(1)
            ], wallet1.address)
        ]);
        
        const record = recordBlock.receipts[0].result.expectOk().expectSome();
        assertEquals(record['vet-name'], "Dr. Smith");
        assertEquals(record['description'], "Annual checkup");
    }
});

Clarinet.test({
    name: "Can log activity for owned pet",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // First register a pet
        let block = chain.mineBlock([
            Tx.contractCall('fetch_path', 'register-pet', [
                types.ascii("Buddy"),
                types.ascii("Dog"),
                types.uint(1640995200)
            ], wallet1.address)
        ]);
        
        // Log an activity
        let activityBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'log-activity', [
                types.uint(1),
                types.ascii("Walk"),
                types.uint(1641081600),
                types.uint(30),
                types.ascii("Morning walk in the park")
            ], wallet1.address)
        ]);
        
        activityBlock.receipts[0].result.expectOk();
        
        // Verify activity
        let getActivityBlock = chain.mineBlock([
            Tx.contractCall('fetch_path', 'get-activity', [
                types.uint(1),
                types.uint(1)
            ], wallet1.address)
        ]);
        
        const activity = getActivityBlock.receipts[0].result.expectOk().expectSome();
        assertEquals(activity['activity-type'], "Walk");
        assertEquals(activity['duration'], types.uint(30));
    }
});