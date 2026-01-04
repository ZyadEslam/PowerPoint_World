# Paymob Payment Integration Setup

This guide explains how to set up Paymob as the payment gateway for your e-commerce application.

## Overview

Paymob (Accept) is a popular payment gateway in Egypt and the MENA region. This integration supports:
- Visa/Mastercard credit and debit cards
- Meeza cards
- Mobile wallets (optional)

## Prerequisites

1. A Paymob merchant account (sign up at [accept.paymob.com](https://accept.paymob.com))
2. API credentials from your Paymob dashboard

## Getting Your Credentials

1. Log in to your Paymob Dashboard at [accept.paymob.com/portal2](https://accept.paymob.com/portal2)

2. **API Key**: 
   - Go to **Settings** → **Account Info**
   - Copy your **API Key**

3. **Integration ID**:
   - Go to **Developers** → **Payment Integrations**
   - Create a new integration or use an existing one (e.g., "Card Payments")
   - Copy the **Integration ID**

4. **iFrame ID**:
   - Go to **Developers** → **iFrames**
   - Create a new iFrame or use an existing one
   - Copy the **iFrame ID**

5. **HMAC Secret**:
   - Go to **Developers** → **Payment Integrations**
   - Click on your integration
   - Copy the **HMAC Secret** (used for webhook verification)

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Paymob Payment Gateway
PAYMOB_API_KEY=your-paymob-api-key
PAYMOB_INTEGRATION_ID=your-integration-id
PAYMOB_IFRAME_ID=your-iframe-id
PAYMOB_HMAC_SECRET=your-hmac-secret

# App URL (required for webhooks)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Webhook Configuration

To receive payment notifications, configure webhooks in your Paymob dashboard:

1. Go to **Developers** → **Payment Integrations**
2. Click on your integration
3. Set the **Transaction processed callback** URL to:
   ```
   https://your-domain.com/api/paymob/webhook
   ```
4. Set the **Transaction response callback** URL to the same URL

## Payment Flow

1. Customer selects "Card Payment" at checkout
2. System creates a Paymob order and generates a payment key
3. Paymob iFrame is displayed for secure card entry
4. Customer enters card details in the Paymob secure form
5. Payment is processed by Paymob
6. Webhook notification updates order status
7. Customer is redirected to order confirmation

## API Endpoints

### Create Payment
- **POST** `/api/paymob/create-payment`
- Creates a Paymob order and returns an iFrame URL

### Webhook Handler
- **POST** `/api/paymob/webhook`
- Receives payment notifications from Paymob
- **GET** `/api/paymob/webhook`
- Handles redirect callbacks from Paymob

## Security

- All card data is entered directly in Paymob's secure iFrame
- No card data is stored or transmitted through your server
- HMAC verification ensures webhook authenticity
- PCI DSS compliance is handled by Paymob

## Testing

Use these test card numbers in Paymob's test environment:

| Card Type | Number | Expiry | CVV |
|-----------|--------|--------|-----|
| Visa (Success) | 5123456789012346 | Any future date | Any 3 digits |
| Visa (Declined) | 4000000000000002 | Any future date | Any 3 digits |

## Supported Currencies

- EGP (Egyptian Pound) - Default
- USD (if enabled in your Paymob account)

## Troubleshooting

### Common Issues

1. **"Failed to authenticate with Paymob"**
   - Verify your API key is correct
   - Ensure it's not expired

2. **"Payment service unavailable"**
   - Check that all environment variables are set
   - Verify PAYMOB_INTEGRATION_ID is correct

3. **Webhook not receiving events**
   - Ensure your webhook URL is publicly accessible
   - Check HMAC_SECRET is correctly configured
   - Verify SSL certificate is valid

4. **iFrame not loading**
   - Check PAYMOB_IFRAME_ID is correct
   - Ensure the iFrame is enabled in your dashboard

## Support

For Paymob-specific issues, contact:
- Email: support@paymob.com
- Documentation: [accept.paymob.com/docs](https://accept.paymob.com/docs)

