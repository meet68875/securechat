import { authMiddleware } from '../../middleware';
import { cacheMessage } from '../../../../../database/models/chatCache';
import clientPromise from '../../../../../database/mongodb';

export async function POST(request) {
  const auth = await authMiddleware(request);

  // FIX: convert auth failure into Response
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { text } = await request.json();
  if (!text?.trim()) {
    return Response.json({ error: 'Message empty' }, { status: 400 });
  }

  const userId = auth.userId;
  const deviceId = auth.deviceId;

  try {
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('messages').insertOne({
      userId,
      text: text.trim(),
      sender: userId,
      deviceId,
      timestamp: new Date(),
    });

    const savedMessage = {
  id: result.insertedId?.toString() || uuidv4(), // fallback if undefined
  userId,
  text: text.trim(),
  sender: userId,
  deviceId,
  timestamp: new Date(),
};

    await cacheMessage(userId, savedMessage);

    return Response.json({ message: savedMessage });

  } catch (err) {
    console.error('Send message error:', err);
    return Response.json({ error: 'Failed to send' }, { status: 500 });
  }
}
