# Email Configuration Guide

## Issue: Welcome emails and OTP emails not being sent

The email service is currently failing with authentication errors. This affects:
1. **User Creation**: Welcome emails when admins create new users
2. **OTP Login**: Email OTP verification during login process

## Current Error
```
Error: Missing credentials for "PLAIN"
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

## Solution Steps

### 1. Gmail Configuration (Current Setup)

Your current email configuration in `.env`:
```
EMAIL_SERVICE=gmail
EMAIL_USER=sayantanhalder78@gmail.com
EMAIL_PASS=vioomjgrervk
```

### 2. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled

### 3. Generate App Password
1. Go to Google Account → Security → 2-Step Verification
2. Scroll down to "App passwords"
3. Click "App passwords"
4. Select "Mail" as the app
5. Select "Other" as the device and enter "XpenseFlow Server"
6. Copy the generated 16-character password
7. Update your `.env` file with the new app password:
   ```
   EMAIL_PASS=your-new-16-character-app-password
   ```

### 4. Alternative: Use Different Email Service

If Gmail continues to have issues, you can switch to other email services:

#### Option A: SendGrid
```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Option B: Mailgun
```env
EMAIL_SERVICE=mailgun
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASS=your-mailgun-smtp-password
```

#### Option C: Custom SMTP
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

### 5. Test Email Configuration

After updating the configuration:

1. Restart the server
2. Use the test endpoint: `POST /api/users/test-email`
3. Or create a new user and check the logs

### 6. Verify Configuration

Check the server logs for:
- `Email transporter not available` - Credentials missing
- `Email authentication failed` - Wrong credentials
- `Welcome email sent successfully` - Working correctly

## Troubleshooting

### Common Issues:

1. **"Missing credentials"** - EMAIL_USER or EMAIL_PASS not set
2. **"EAUTH" error** - Wrong username/password or 2FA not enabled
3. **"ECONNECTION" error** - Network/firewall issues
4. **"Less secure app access"** - This is deprecated, use App Passwords instead

### Testing Commands:

```bash
# Test email service directly
cd server
node -e "const emailService = require('./src/services/email.service'); emailService.sendWelcomeEmail('test@example.com', 'Test User', '123456').then(result => console.log('Success:', result)).catch(err => console.error('Error:', err))"
```

## Current Status

- ✅ Email service code is implemented
- ✅ Error handling improved for both user creation and OTP emails
- ✅ User creation continues even if email fails
- ✅ OTP login provides better error messages
- ❌ Email credentials need to be fixed
- ❌ Gmail app password needs to be regenerated

## Next Steps

1. Generate a new Gmail App Password
2. Update the `.env` file
3. Restart the server
4. Test user creation
5. Verify emails are being sent

## Support

If you continue to have issues:
1. Check server logs in `server/logs/error.log`
2. Verify your Gmail account settings
3. Consider switching to a different email service provider
4. Contact the development team for assistance
