
    const args = process.argv.slice(2);
    const url = args[0];
    const method = args[1];
    const key = args[2];
    const bodyStr = args[3];
    
    fetch(url, {
      method,
      headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: bodyStr ? bodyStr : undefined
    })
    .then(r => r.text())
    .then(t => { console.log(t); process.exit(0); })
    .catch(e => { console.error(e); process.exit(1); });
  