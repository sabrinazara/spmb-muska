const jwt = require('jsonwebtoken');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function main() {
  const jwtSecret = 'rahasia-spmb-muska-2026';
  const token = jwt.sign(
    { sub: 'test-user-id', email: 'test@example.com', role: 'USER' },
    jwtSecret,
    { expiresIn: '1h' }
  );

  const form = new FormData();
  const filePath = 'd:/FAIZ NIZAR NUAIM/TA/PPDB-MUSKA/api/uploads/1792525141163-images__16_.jpg';
  form.append('file', fs.createReadStream(filePath));
  form.append('studentNik', '1234567890');

  const res = await axios.post('http://localhost:3001/dokumen/scan-preview', form, {
    headers: {
      ...form.getHeaders(),
      Authorization: 'Bearer ' + token
    }
  });

  console.log('STATUS:', res.status);
  console.log('RESPONSE DATA:');
  console.log(JSON.stringify(res.data, null, 2));
}

main().catch(err => {
  console.error('ERROR:', err.response?.data || err.message);
});
