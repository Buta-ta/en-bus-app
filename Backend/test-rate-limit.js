// test-rate-limit.js
async function testRateLimit() {
    for (let i = 1; i <= 105; i++) {
        try {
            const res = await fetch('http://localhost:3000/api/reservations/EB-123456');
            console.log(`Requête ${i}: ${res.status}`);
        } catch (error) {
            console.error(`Requête ${i}: ERREUR`);
        }
    }
}

testRateLimit();