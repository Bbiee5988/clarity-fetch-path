// [Previous imports remain unchanged...]

Clarinet.test({
    name: "Can register a new pet",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('fetch_path', 'register-pet', [
                types.ascii("Buddy"),
                types.ascii("Dog"),
                types.uint(1640995200)
            ], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Verify pet registration
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

// [Previous tests remain unchanged...]
