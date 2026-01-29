import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

export const runtime = 'nodejs';

// Initialize Viem Client for Server-Side Checks
const publicClient = createPublicClient({
    chain: base,
    transport: http()
});

// ABI for ERC-20 Balance Check
const erc20Abi = parseAbi([
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
]);

// ABI for ERC-721 Balance Check
const erc721Abi = parseAbi([
    'function balanceOf(address owner) view returns (uint256)'
]);

export async function POST(request: NextRequest) {
    try {
        const { slug, userAddress } = await request.json();

        if (!slug || !userAddress) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Get Link & Policy from DB
        const result = await sql`
            SELECT original_url, access_policy
            FROM urls
            WHERE short_code = ${slug}
            LIMIT 1
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        const link = result[0];
        const policy = link.access_policy;

        // 2. If no policy, just give the URL (Shouldn't happen if logic is correct, but fail-safe)
        if (!policy || Object.keys(policy).length === 0) {
            return NextResponse.json({ originalUrl: link.original_url });
        }

        // 3. ON-CHAIN VERIFICATION
        const { type, contractAddress, minBalance } = policy;
        const targetBalance = BigInt(minBalance || 0);

        if (type === 'token') {
            // Check ERC-20
            try {
                // Get decimals first to normalize input (assuming minBalance is human readable e.g. "100")
                // Optimization: You might want to cache decimals in DB later
                const decimals = await publicClient.readContract({
                    address: contractAddress as `0x${string}`,
                    abi: erc20Abi,
                    functionName: 'decimals'
                });

                const rawBalance = await publicClient.readContract({
                    address: contractAddress as `0x${string}`,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [userAddress as `0x${string}`]
                });

                // Convert user input (e.g. 100) to BigInt with decimals (e.g. 100000000000000000000)
                const requiredAmount = BigInt(minBalance) * (BigInt(10) ** BigInt(decimals));

                if (rawBalance < requiredAmount) {
                    return NextResponse.json({ error: 'Insufficient token balance' }, { status: 403 });
                }

            } catch (err) {
                console.error('RPC Error (Token):', err);
                return NextResponse.json({ error: 'Failed to verify token balance on-chain' }, { status: 500 });
            }

        } else if (type === 'nft') {
            // Check ERC-721
            try {
                const balance = await publicClient.readContract({
                    address: contractAddress as `0x${string}`,
                    abi: erc721Abi,
                    functionName: 'balanceOf',
                    args: [userAddress as `0x${string}`]
                });

                if (balance < targetBalance) {
                    return NextResponse.json({ error: 'Insufficient NFT balance' }, { status: 403 });
                }
            } catch (err) {
                console.error('RPC Error (NFT):', err);
                return NextResponse.json({ error: 'Failed to verify NFT balance on-chain' }, { status: 500 });
            }
        }

        // 4. Success!
        return NextResponse.json({
            success: true,
            originalUrl: link.original_url
        });

    } catch (error) {
        console.error('Unlock API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
