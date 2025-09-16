import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import { MongoClient, ObjectId } from 'mongodb';
// axios removed for MERN simplification

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/wander';
const BACKEND_SIGNING_SECRET = process.env.BACKEND_SIGNING_SECRET || 'dev_secret';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: CORS_ORIGIN } });

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

let db, touristsCol, receiptsCol, alertsCol, zonesCol, trackingCol;

async function initMongo() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db();
  touristsCol = db.collection('tourists');
  receiptsCol = db.collection('receipts');
  alertsCol = db.collection('alerts');
  zonesCol = db.collection('zones');
  trackingCol = db.collection('tracking');
}

function signPayload(payload) {
  const json = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(json).digest('hex');
  const hmac = crypto.createHmac('sha256', BACKEND_SIGNING_SECRET).update(hash).digest('hex');
  return { hash, hmac };
}

io.on('connection', (socket) => {
  socket.emit('hello', { message: 'connected' });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/tourists', async (req, res) => {
  const list = await touristsCol.find().sort({ createdAt: -1 }).limit(100).toArray();
  res.json(list);
});

app.post('/api/id', async (req, res) => {
  const { name, docType, docNumber, itinerary, emergencyContacts, tripStart, tripEnd } = req.body || {};
  const now = new Date();
  const payload = { name, docType, docNumber, itinerary, emergencyContacts, tripStart, tripEnd, createdAt: now };
  const { hash, hmac } = signPayload(payload);
  const tourist = { ...payload, safetyScore: null };
  const insert = await touristsCol.insertOne(tourist);
  const touristId = insert.insertedId.toString();

  // In MERN prototype, assign a simple default safety score without AI
  const score = 70;
  await touristsCol.updateOne({ _id: insert.insertedId }, { $set: { safetyScore: score } });
  tourist.safetyScore = score;

  const receipt = { type: 'TOURIST_ID_ISSUED', touristId, hash, hmac, createdAt: now };
  const rec = await receiptsCol.insertOne(receipt);

  io.emit('tourist:new', { touristId, name, itinerary });
  res.json({ touristId, receiptId: rec.insertedId.toString(), safetyScore: tourist.safetyScore });
});

app.post('/api/alert/panic', async (req, res) => {
  const { touristId, lat, lng } = req.body || {};
  const now = new Date();
  const alert = { type: 'PANIC', touristId, location: { lat, lng }, createdAt: now };
  await alertsCol.insertOne(alert);
  io.emit('alert:panic', alert);
  res.json({ ok: true });
});

// Geo-fencing and zone management
app.get('/api/zones', async (req, res) => {
  const zones = await zonesCol.find().toArray();
  res.json(zones);
});

app.post('/api/zones', async (req, res) => {
  const { name, type, center, radius, riskLevel, description } = req.body || {};
  const zone = { name, type, center, radius, riskLevel, description, createdAt: new Date() };
  const result = await zonesCol.insertOne(zone);
  io.emit('zone:new', { ...zone, _id: result.insertedId });
  res.json({ zoneId: result.insertedId.toString() });
});

app.post('/api/geo/event', async (req, res) => {
  const { touristId, event, zoneId, lat, lng } = req.body || {};
  const now = new Date();
  
  // Store tracking data
  await trackingCol.insertOne({ touristId, lat, lng, timestamp: now });
  
  // Check if entering/exiting a zone
  if (zoneId) {
    const zone = await zonesCol.findOne({ _id: new ObjectId(zoneId) });
    if (zone) {
      const alert = {
        type: 'GEO_FENCE',
        touristId,
        zoneId,
        zoneName: zone.name,
        riskLevel: zone.riskLevel,
        location: { lat, lng },
        event,
        createdAt: now
      };
      await alertsCol.insertOne(alert);
      io.emit('geo:alert', alert);
    }
  }
  
  const message = { touristId, event, zoneId, lat, lng, at: now };
  io.emit('geo:event', message);
  res.json({ ok: true });
});

// Real-time tracking
app.post('/api/tracking', async (req, res) => {
  const { touristId, lat, lng, accuracy } = req.body || {};
  const tracking = { touristId, lat, lng, accuracy, timestamp: new Date() };
  await trackingCol.insertOne(tracking);
  io.emit('tracking:update', tracking);
  res.json({ ok: true });
});

app.get('/api/tracking/:touristId', async (req, res) => {
  const { touristId } = req.params;
  const tracking = await trackingCol.find({ touristId }).sort({ timestamp: -1 }).limit(50).toArray();
  res.json(tracking);
});

// E-FIR generation for missing persons
app.post('/api/efir', async (req, res) => {
  const { touristId, reporterName, reporterContact, lastSeenLocation, description } = req.body || {};
  const efir = {
    touristId,
    reporterName,
    reporterContact,
    lastSeenLocation,
    description,
    status: 'ACTIVE',
    createdAt: new Date(),
    firNumber: `FIR-${Date.now()}`
  };
  const result = await db.collection('efirs').insertOne(efir);
  io.emit('efir:new', efir);
  res.json({ firNumber: efir.firNumber, efirId: result.insertedId.toString() });
});

app.get('/api/efirs', async (req, res) => {
  const efirs = await db.collection('efirs').find().sort({ createdAt: -1 }).toArray();
  res.json(efirs);
});

// Dashboard data
app.get('/api/dashboard', async (req, res) => {
  const [tourists, alerts, zones, efirs] = await Promise.all([
    touristsCol.countDocuments(),
    alertsCol.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    zonesCol.countDocuments(),
    db.collection('efirs').countDocuments({ status: 'ACTIVE' })
  ]);
  
  const recentAlerts = await alertsCol.find().sort({ createdAt: -1 }).limit(10).toArray();
  const touristClusters = await trackingCol.aggregate([
    { $match: { timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } } },
    { $group: { _id: { lat: { $round: ['$lat', 2] }, lng: { $round: ['$lng', 2] } }, count: { $sum: 1 } } }
  ]).toArray();
  
  res.json({
    stats: { tourists, alerts, zones, activeEfirs: efirs },
    recentAlerts,
    touristClusters
  });
});

initMongo().then(() => {
  server.listen(PORT, () => console.log(`backend listening on ${PORT}`));
});


