# Mitsui Terminal 
![mitsui-banner](https://github.com/user-attachments/assets/41f52c06-4ac3-4357-918c-27b684841551)


## Table of Contents

## Overview
Mitsui Terminal is a next-gen DeFi trading and management platform, seamlessly integrating AI-driven automation with DeFi protocols on Sui. Powered by Mitsui Protocol, Mitsui Terminal simplifies DeFi interactions, enhances market intelligence, and provides smart insights for traders, investors, and developers. Designed to be intuitive yet powerful, Mitsui Terminal brings together seamless tooling integrations, predictive analytics, and automated workflows to optimize trading, lending, and asset management across multiple protocols.

<img src="https://github.com/user-attachments/assets/264211f3-7c46-45f2-acb0-d9b836a40617" alt="Mitsui High Level Design" width="600"/>

Unlike other AI-driven automation tools, Mitsui Terminal is a self-hosted and non-custodial platform, meaning users maintain full control over their assets at all times. Mitsui Terminal does not store private keys or require third-party trust, which ensures maximum security and privacy. Users can deploy and manage their own instance of the terminal, giving them the flexibility to customize workflows, integrate new protocols, leverage mini apps, and retain full sovereignty over their DeFi interactions.
With Mitsui Terminal, users can engage in a variety of workflows:
- **Trading Automation**: Set up AI-driven driven strategies that execute trades based on real-time market conditions through its If-This-Then-That (IFTTT) mini app. 
- **Lending Optimization**: Allocate assets across multiple lending markets while minimizing risk.
- **Airdrop Management**: Track, qualify for, and automatically claim upcoming airdrops such Walrus.
- **Risk Assessment & Alerts**: Receive predictive insights and alerts on potential market downturns or opportunities based on open data sets, and real-time data (e.g. Twitter feed, RSS)
- **DeFi Portfolio Tracking**: Monitor and rebalance assets across multiple protocols with real-time updates.

## Integrations

### Sui Network
Mitsui Terminal implements two non-custodial login methods:
1. **ZK Login** through Google OAuth
2. Import & wallet creation

![mitsui-zk-login](https://github.com/user-attachments/assets/111b8feb-df7a-4bae-b270-51a1129fe260)

Implementation details can be found here:
- [Google Sign In](https://github.com/Mitsui-Protocol/mitsui-terminal/blob/main/src/components/auth/GoogleSignIn.tsx)
- [ZK Login Local Service](https://github.com/Mitsui-Protocol/mitsui-terminal/blob/main/src/utils/zkLogin.ts)
- [ZK Login JWTAddress + Proof](https://github.com/Mitsui-Protocol/mitsui-terminal/blob/main/src/app/api/zk-login/route.ts)

Beyond this, Mitsui Terminal leverages **Walrus devnet storage** to store sentiment analysis data processed in batches.
The plan is to create enough timestamp datasets that can be leveraged by the community. Implementaton of this can be found here:
- [General data batch procesing scripts](https://github.com/Mitsui-Protocol/mitsui-terminal/tree/main/scripts)
- [Walrus upload implementation](https://github.com/Mitsui-Protocol/mitsui-terminal/blob/main/scripts/push-to-walrus.js)

### Atoma Network
Mitsui Terminal has the ability to leverage local open source models ran on-device, and also remotely access models such as DeepSeek offered by Atoma Network. 

Implementation of the agent functionality can be found here:
- [Atoma agent queries](https://github.com/Mitsui-Protocol/mitsui-terminal/blob/main/src/app/api/chat/route.js)

We further leverage Atoma's model to analyze tweets:
- [Analyzer scripts](https://github.com/Mitsui-Protocol/mitsui-terminal/tree/main/scripts)
- [Tweet analyzer](https://github.com/Mitsui-Protocol/mitsui-terminal/blob/main/scripts/analyze-tweets.js)

### Eliza Framework
To afford Mitsui Terminal with a personality the Eliza Framework is used to create multiple characters. Additionally, we leverage their Twitter service to scrape tweets.

The initial Eliza character sheet can be found here:
- [Character sheet](https://github.com/Mitsui-Protocol/mitsui-terminal/blob/main/src/characters/mitsui.character.json)


### Suilend

### Navi Protocol

### Bluefin

## Architecture

## Features

## Run

To fully run Mitsui Terminal locally, you need the following environment variables. 
```
# .env.local
NEXT_PUBLIC_GOOGLE_DESKTOP_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=

ATOMA_API_KEY=
INSIDEX_API_KEY=
OPENAI_API_KEY=
WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
SUI_RPC_URL=https://fullnode.mainnet.sui.io
SUI_SCAN_API=https://api.suiscan.xyz
NEXT_PUBLIC_PUBLIC_KEY=
NEXT_PUBLIC_SAMPLE_SEED_PHRASE=
NEXT_PUBLIC_PUBLIC_KEY2=
NEXT_PUBLIC_PRIVATE_KEY2=
NEXT_PUBLIC_BLOCKVISION_API_KEY=
NEXT_PUBLIC_BLOCKVISION_HTPPS=
NEXT_PUBLIC_BLOCKVISION_WEBSOCKETS=
```
### Steps
```
# STEP 1: Install depedencies
pnpm install

# STEP 2: Run terminal 
npm run tauri dev

```

