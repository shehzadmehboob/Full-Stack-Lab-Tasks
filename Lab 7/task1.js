const http = require('node:http');

// Centralized in-memory data store for all modules
const store = {
  students: { data: [], nextId: 1 },
  teachers: { data: [], nextId: 1 },
  attendance: { data: [], nextId: 1 },
  marks: { data: [], nextId: 1 }
};

const server = http.createServer(async (req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  // Parse URL to get the resource (e.g., 'students') and optional ID (e.g., '1')
  const urlParts = req.url.split('/').filter(Boolean);
  const resource = urlParts[0];
  const id = urlParts[1] ? parseInt(urlParts[1], 10) : null;

  // Validate module exists in store
  if (!store[resource]) {
    return send(404, { error: 'Module not found. Use /students, /teachers, /attendance, or /marks' });
  }

  const table = store[resource];

  // READ (All or One)
  if (req.method === 'GET') {
    if (id) {
      const item = table.data.find(i => i.id === id);
      return item ? send(200, item) : send(404, { error: 'Item not found' });
    }
    return send(200, table.data);
  }

  // DELETE
  if (req.method === 'DELETE') {
    if (!id) return send(400, { error: 'ID required' });
    const index = table.data.findIndex(i => i.id === id);
    if (index === -1) return send(404, { error: 'Item not found' });
    const deleted = table.data.splice(index, 1);
    return send(200, deleted[0]);
  }

  // CREATE and UPDATE
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 65536) return send(413, { error: 'Payload too large' });
      }
      const body = JSON.parse(raw);

      // POST: Create
      if (req.method === 'POST') {
        const newItem = { id: table.nextId++, ...body };
        table.data.push(newItem);
        return send(201, newItem);
      }

      // PUT: Update
      if (req.method === 'PUT') {
        if (!id) return send(400, { error: 'ID required' });
        const index = table.data.findIndex(i => i.id === id);
        if (index === -1) return send(404, { error: 'Item not found' });
        table.data[index] = { id, ...body };
        return send(200, table.data[index]);
      }

    } catch (error) {
      if (error instanceof SyntaxError) return send(400, { error: 'Invalid JSON' });
      console.error(error);
      return send(500, { error: 'Server error' });
    }
  }

  send(405, { error: 'Method not allowed' });
});

server.listen(3004, () => {
  console.log('Management API running on http://localhost:3004');
  console.log('Endpoints: /students, /teachers, /attendance, /marks');
});