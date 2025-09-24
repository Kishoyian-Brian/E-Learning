const { PrismaClient } = require('@prisma/client');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function testLocalStorage() {
  try {
    console.log('🧪 Testing local file storage for certificates...');
    
    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const certificatesDir = path.join(uploadsDir, 'certificates');
    
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(certificatesDir, { recursive: true });
    
    console.log('✅ Created upload directories');
    
    // Generate a test PDF
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Certificate</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .certificate { text-align: center; }
            .title { font-size: 24px; color: #333; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="title">Test Certificate</div>
            <p>This is a test certificate for local storage.</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    
    console.log('✅ Generated test PDF');
    
    // Save PDF locally
    const certificateNumber = 'TEST-CERT-' + Date.now();
    const fileName = `${certificateNumber}.pdf`;
    const filePath = path.join(certificatesDir, fileName);
    
    await fs.writeFile(filePath, Buffer.from(pdfBuffer));
    
    console.log('✅ Saved PDF to:', filePath);
    console.log('📄 File size:', pdfBuffer.length, 'bytes');
    
    // Test file exists
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    console.log('✅ File exists check:', fileExists);
    
    // Test download URL
    const downloadUrl = `/api/certificates/download/${fileName}`;
    console.log('🔗 Download URL:', downloadUrl);
    
    console.log('\n🎉 Local storage test completed successfully!');
    console.log('📁 Certificate stored at:', filePath);
    console.log('🌐 Access via:', `http://localhost:3000${downloadUrl}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLocalStorage(); 