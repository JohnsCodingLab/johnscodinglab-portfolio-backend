const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

async function testGmail() {
  console.log('--- Testing Gmail SMTP Connection ---');
  console.log('Host:', process.env.MAIL_HOST);
  console.log('Port:', process.env.MAIL_PORT);
  console.log('User:', process.env.MAIL_USER);
  console.log(
    'Pass:',
    process.env.MAIL_PASS ? '***[SET]***' : '***[MISSING]***',
  );

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    // Add debug and logger flags to see the full SMTP conversation
    logger: true,
    debug: true,
  });

  try {
    console.log('\nAttempting connection...');
    const result = await transporter.verify();
    console.log('\n✅ SUCCESS: Connection verified!', result);
  } catch (error) {
    console.error('\n❌ ERROR: Connection failed');
    console.error(error);
  }
}

testGmail();
