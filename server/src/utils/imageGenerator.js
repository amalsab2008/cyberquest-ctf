const fs = require('fs');
const path = require('path');

function generateHackerAvatar() {
  const dirPath = path.join(__dirname, '..', '..', 'public', 'files');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, 'hacker_avatar.jpg');
  if (fs.existsSync(filePath)) {
    return; // Already exists
  }

  // Hex representation of a 1x1 pixel JPEG with customized EXIF data
  // containing: Tag 0x010E (ImageDescription) = "cyberquest{ex1f_d4t4_r3v34ls_all}"
  const jpegHex = 
    // SOI
    'FFD8' +
    // APP1 (EXIF)
    'FFE1' + 
    // Length of APP1 segment: 2 bytes (0x005E = 94 bytes)
    '005E' + 
    // EXIF Header: "Exif\0\0"
    '457869660000' +
    // TIFF Header (Little Endian "II", Magic 0x002A, Offset to IFD0 0x00000008)
    '49492A0008000000' +
    // IFD0: 1 entry
    '0100' +
    // Entry 1: Tag 0x010E (ImageDescription), Type 2 (ASCII), Count 34, Offset 0x0000001A
    '0E01' + '0200' + '22000000' + '1A000000' +
    // Offset to next IFD: 4 bytes (0x00000000)
    '00000000' +
    // Value: "cyberquest{ex1f_d4t4_r3v34ls_all}\0" (34 bytes)
    '637962657271756573747B657831665F643474345F72337633346C735F616C6C7D00' +
    // Minimal valid JPEG image segments (SOF, DQT, DHT, SOS, etc., and EOI)
    'FFDB004300080606070605080707070909080A0C140D0C0B0B0C1912130F141D1A1F1E' +
    '1D1A1C1C20242E2720222C231C1C2837292C30313434341F27393D38323C2E333432' +
    'FFC0000B080001000101011100' +
    'FFC40014000100000000000000000000000000000000' +
    'FFC40014100100000000000000000000000000000000' +
    'FFDA0008010100003F0037FFD9';

  const buffer = Buffer.from(jpegHex, 'hex');
  fs.writeFileSync(filePath, buffer);
  console.log('Generated hacker_avatar.jpg with embedded EXIF flag at:', filePath);
}

module.exports = {
  generateHackerAvatar
};
