// In a real application, this would be a database connection.
// For this demo, we're using a mock in-memory store.

const farmersData: Record<string, any> = {
    "FARMER12345": {
        name: 'Ramesh Kumar',
        fatherName: 'Suresh Kumar',
        aadhaarNumber: '1234-5678-9012',
        mobileNumber: '9876543210',
        bank: {
            name: 'State Bank of India',
            accountNumber: '12345678901',
            ifsc: 'SBIN0001234',
        },
        landRecords: [
            {
                khasra: '101/1',
                khatauni: '00123',
                area: '2.5 Acres',
                village: 'Rampur',
                district: 'Sitapur',
                state: 'Uttar Pradesh',
            },
        ],
        address: {
            village: 'Rampur',
            block: 'Rampur Block',
            subDistrict: 'Rampur Tehsil',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261001',
        },
        gender: 'Male',
        category: 'General',
        farmerType: 'Small (1-2 Ha)'
    }
};

export const db = {
    async getFarmerById(id: string): Promise<any | null> {
        console.log(`Fetching farmer with ID: ${id}`);
        // Simulate an async database call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(farmersData[id] || null);
            }, 500);
        });
    }
};
