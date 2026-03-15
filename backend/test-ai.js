async function testAI() {
  try {
    const response = await fetch('http://localhost:3000/api/ai/generate-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skillId: '699d25f672f9c9012baa369b'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('SUCCESS:', data);
    } else {
      console.error('SERVER ERROR (500):', data);
    }
  } catch (err) {
    console.error('NETWORK ERROR:', err.message);
  }
}

testAI();
