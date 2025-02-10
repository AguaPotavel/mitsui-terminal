import { NextResponse } from 'next/server';

// This tells Next.js to handle all HTTP methods dynamically
export const dynamic = 'auto';
// Optionally set revalidation time if needed
export const revalidate = 0; // 0 means validate on every request

// GET /api/flows - List flows
export async function GET() {
  try {
    // Mock data
    const flows = [
      {
        id: '1',
        userId: 'user123',
        name: 'Price Alert & Token Send',
        trigger: {
          service: {
            id: 'token',
            name: 'Token',
            icon: 'Coins',
            color: '#FF6B6B'
          },
          action: {
            id: 'price-below',
            title: 'Price drops below',
            config: {
              token: 'SUI',
              threshold: '0.5',
              timeframe: '1h'
            }
          }
        },
        action: {
          service: {
            id: 'wallet',
            name: 'Wallet',
            icon: 'Wallet',
            color: '#4ECDC4'
          },
          action: {
            id: 'send-token',
            title: 'Send token',
            config: {
              token: 'SUI',
              amount: '10',
              recipient: '0x123...'
            }
          }
        },
        enabled: true,
        createdAt: '2024-03-15T10:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z'
      }
    ];

    return NextResponse.json({ flows }, { status: 200 });
  } catch (error) {
    console.error('GET /api/flows error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flows' }, 
      { status: 500 }
    );
  }
}

// POST /api/flows - Create flow
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.trigger || !body.action) {
      return NextResponse.json(
        { error: 'Missing trigger or action' },
        { status: 400 }
      );
    }

    // Mock creating a new flow
    const newFlow = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'user123',
      ...body,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ flow: newFlow }, { status: 201 });
  } catch (error) {
    console.error('POST /api/flows error:', error);
    return NextResponse.json(
      { error: 'Failed to create flow' }, 
      { status: 500 }
    );
  }
} 