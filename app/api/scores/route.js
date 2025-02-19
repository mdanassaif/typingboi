import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Score from '@/models/Score';

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    // Validate the request body
    if (!body.name || !body.wpm || !body.accuracy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a new score in the database
    const score = await Score.create({
      name: body.name,
      wpm: body.wpm,
      accuracy: body.accuracy,
      rawWpm: body.rawWpm || body.wpm, // Use provided rawWpm or default to wpm
    });

    return NextResponse.json({ success: true, data: score });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    // Fetch the top 100 scores, sorted by WPM in descending order
    const scores = await Score.find({})
      .sort({ wpm: -1 })
      .limit(100);

    return NextResponse.json({ success: true, data: scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}