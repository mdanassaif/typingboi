import connectMongoDB from '@/lib/mongodb';
import Score from '@/models/Score';

export async function POST(request) {
  try {
    await connectMongoDB();
    const { name, wpm, accuracy } = await request.json();

    // Prevent duplicate submissions within 2 seconds
    const existing = await Score.findOne({
      name,
      wpm,
      accuracy,
      timestamp: { $gt: new Date(Date.now() - 2000) }
    });

    if (existing) {
      return new Response(JSON.stringify({ error: 'Duplicate submission' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }


    const newScore = await Score.create({
      name: name.trim().substring(0, 50),
      wpm: Math.min(Math.round(wpm), 500),
      accuracy: Math.min(Math.round(accuracy), 100)
    });

    return new Response(JSON.stringify(newScore), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  try {
    await connectMongoDB();
    const scores = await Score.find()
      .sort({ wpm: -1, accuracy: -1 })
      .limit(10)
      .lean()
      .exec(); // Use .exec() for better performance with Mongoose

    return new Response(JSON.stringify(scores), { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch scores' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}