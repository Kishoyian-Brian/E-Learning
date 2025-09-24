const nodemailer = require('nodemailer');

async function testEmailConnection() {
  console.log('🔧 Testing Email Connection Fix...\n');

  // Test current configuration
  console.log('1. Testing current Gmail SMTP configuration...');
  
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'maxmillianmuiruri@gmail.com',
      pass: 'bikizemstqjosdnt', // This might be the issue
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

  try {
    // Test connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Test sending a simple email
    const testEmail = await transporter.sendMail({
      from: 'E-learning <maxmillianmuiruri@gmail.com>',
      to: 'maxmillianmuiruri@gmail.com',
      subject: 'Test Email - Connection Fix',
      text: 'This is a test email to verify SMTP connection is working.',
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', testEmail.messageId);
    
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔑 AUTHENTICATION ISSUE DETECTED:');
      console.log('The Gmail app password may be invalid or expired.');
      console.log('\n📋 TO FIX:');
      console.log('1. Go to https://myaccount.google.com/security');
      console.log('2. Enable 2-Factor Authentication if not already enabled');
      console.log('3. Go to "App passwords" section');
      console.log('4. Generate a new app password for "Mail"');
      console.log('5. Replace the MAIL_PASS in your .env file');
      console.log('\nCurrent MAIL_PASS: bikizemstqjosdnt');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.log('\n🌐 NETWORK ISSUE DETECTED:');
      console.log('Network connectivity to Gmail servers is problematic.');
      console.log('\n📋 TO FIX:');
      console.log('1. Check your internet connection');
      console.log('2. Try using a different network (mobile hotspot)');
      console.log('3. Consider using a different email provider (SendGrid, Mailgun)');
      console.log('4. Check if your firewall is blocking SMTP connections');
    }
  }

  console.log('\n🔧 ALTERNATIVE EMAIL PROVIDERS:');
  console.log('If Gmail continues to fail, consider these alternatives:');
  console.log('\n1. SendGrid (Recommended for production):');
  console.log('   MAIL_HOST=smtp.sendgrid.net');
  console.log('   MAIL_PORT=587');
  console.log('   MAIL_USER=apikey');
  console.log('   MAIL_PASS=your_sendgrid_api_key');
  
  console.log('\n2. Mailgun:');
  console.log('   MAIL_HOST=smtp.mailgun.org');
  console.log('   MAIL_PORT=587');
  console.log('   MAIL_USER=your_mailgun_smtp_username');
  console.log('   MAIL_PASS=your_mailgun_smtp_password');
  
  console.log('\n3. For development only - Ethereal Email:');
  console.log('   This creates fake email accounts for testing');
  console.log('   Run: npm install ethereal-email');
}

testEmailConnection();

