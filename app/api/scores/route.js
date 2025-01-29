// Create the API route for scores (app/api/scores/route.js)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Score from '@/models/Score';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const score = await Score.create({
      name: body.name,
      wpm: body.wpm,
      accuracy: body.accuracy,
      rawWpm: body.rawWpm
    });

    return NextResponse.json({ success: true, data: score });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const scores = await Score.find({})
      .sort({ wpm: -1 })
      .limit(100);
    
    return NextResponse.json({ success: true, data: scores });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
