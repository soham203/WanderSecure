import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';
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

let db, touristsCol, receiptsCol, alertsCol;

async function initMongo() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db();
  touristsCol = db.collection('tourists');
  receiptsCol = db.collection('receipts');
  alertsCol = db.collection('alerts');
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

app.post('/api/geo/event', async (req, res) => {
  const { touristId, event, zoneId, lat, lng } = req.body || {};
  const message = { touristId, event, zoneId, lat, lng, at: new Date() };
  io.emit('geo:event', message);
  res.json({ ok: true });
});

initMongo().then(() => {
  server.listen(PORT, () => console.log(`backend listening on ${PORT}`));
});


