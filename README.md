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

### Eliza Framework

### Suilend

### Navi Protocol

### Bluefin

## Architecture

## Features

## Run
