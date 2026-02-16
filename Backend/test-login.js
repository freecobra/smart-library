// Test Login Script - Run this in Backend folder
// Usage: node test-login.js

const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@library.com',
                password: 'admin123'
            })
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('User:', data.user);
        } else {
            console.log('❌ LOGIN FAILED!');
            console.log('Error:', data.error);
        }
    } catch (error) {
        console.log('❌ CONNECTION ERROR!');
        console.log('Error:', error.message);
        console.log('Make sure backend is running on port 5000');
    }
};

testLogin();
