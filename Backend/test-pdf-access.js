// Using native fetch (Node 18+)

async function testPdfAccess() {
    const filename = 'digitalFile-1771229117744-20424196.pdf';
    const url = `http://localhost:5000/uploads/books/${filename}`;

    console.log(`Testing access to: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log(`Content-Length: ${response.headers.get('content-length')}`);

        if (response.ok) {
            console.log('✅ PDF is accessible!');
        } else {
            console.log('❌ Failed to access PDF');
        }

    } catch (error) {
        console.error('❌ Connection error:', error.message);
    }
}

testPdfAccess();
