const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('=== STARTING INTEGRATION TESTS FOR ZEAL HEALING ===');
  
  const testEmail = `customer_${Date.now()}@example.com`;
  const password = 'Password@123';
  let clientToken = '';
  let adminToken = '';
  let selectedClassId = '';
  let selectedDuration = 15;
  let selectedClassName = '';
  let selectedDate = '';
  let selectedSlot = '';
  let bookingId = '';

  try {
    // 1. Register a new user
    console.log('\n[1] Registering a new customer...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test Customer',
      email: testEmail,
      phone: '9876543210',
      password: password
    });
    console.log('✔ Registration successful! User ID:', registerResponse.data._id);
    console.log('Email registered:', testEmail);

    // 2. Login as the newly registered user
    console.log('\n[2] Logging in as the new customer...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testEmail,
      password: password
    });
    clientToken = loginResponse.data.token;
    console.log('✔ Customer login successful! Token received.');

    // 3. Fetch list of classes
    console.log('\n[3] Fetching available classes/sessions...');
    const classesResponse = await axios.get(`${BASE_URL}/api/classes`);
    if (classesResponse.data.length === 0) {
      throw new Error('No classes found in the database. Ensure db is seeded.');
    }
    const targetClass = classesResponse.data.find(c => c.status === 'Active') || classesResponse.data[0];
    selectedClassId = targetClass._id;
    selectedDuration = targetClass.duration;
    selectedClassName = targetClass.title;
    console.log(`✔ Found active session: "${selectedClassName}" (${selectedDuration} Mins) ID: ${selectedClassId}`);

    // 4. Fetch available slots for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    selectedDate = tomorrow.toISOString().split('T')[0];
    console.log(`\n[4] Fetching slots for date: ${selectedDate}...`);
    
    const slotsResponse = await axios.get(
      `${BASE_URL}/api/bookings/slots?date=${selectedDate}&duration=${selectedDuration}`
    );
    const slots = slotsResponse.data.slots;
    if (!slots || slots.length === 0) {
      throw new Error(`No slots available for ${selectedDate}.`);
    }
    selectedSlot = slots[0];
    console.log(`✔ Available slots count: ${slots.length}. Selected first slot: ${selectedSlot}`);

    // 5. Create a booking (Manual Payment flow)
    console.log('\n[5] Creating a new appointment booking...');
    const bookingPayload = {
      appointmentType: selectedClassName,
      callType: 'Voice Call',
      duration: selectedDuration,
      price: targetClass.price,
      customerName: 'Test Customer',
      customerEmail: testEmail,
      customerPhone: '9876543210',
      customerWhatsApp: '9876543210',
      district: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      countryCategory: 'india',
      appointmentDate: selectedDate,
      appointmentTime: selectedSlot,
      paymentMethod: 'Manual Bank Transfer',
      senderAccountNumber: '123456789',
      transactionId: 'TXN_' + Date.now(),
      paymentScreenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // tiny valid base64 transparent png
      paymentRemarks: 'Test booking payment',
      notes: 'Testing slot integration'
    };

    const bookingResponse = await axios.post(
      `${BASE_URL}/api/bookings/create`,
      bookingPayload,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    bookingId = bookingResponse.data._id;
    console.log('✔ Booking created successfully!');
    console.log('Booking ID:', bookingId);
    console.log('Payment status:', bookingResponse.data.paymentStatus);
    console.log('Booking status:', bookingResponse.data.bookingStatus);
    console.log('GST rate applied:', bookingResponse.data.gstRate + '%');
    console.log('GST amount:', bookingResponse.data.gstAmount);
    console.log('Total Amount:', bookingResponse.data.totalAmount);

    // 6. Login as Admin
    console.log('\n[6] Logging in as Admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@zealhealing.com',
      password: 'Admin@123'
    });
    adminToken = adminLoginResponse.data.token;
    console.log('✔ Admin login successful!');

    // 7. Admin: Get all bookings & verify new booking exists
    console.log('\n[7] Admin: Fetching all bookings to verify ours exists...');
    const adminBookingsResponse = await axios.get(`${BASE_URL}/api/admin/bookings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundBooking = adminBookingsResponse.data.find(b => b._id === bookingId);
    if (!foundBooking) {
      throw new Error('Created booking not found in admin bookings list!');
    }
    console.log('✔ Booking successfully verified in Admin portal. Transaction UTR:', foundBooking.transactionId);

    // 8. Admin: Accept booking (which confirms payment & triggers invoice generation)
    console.log('\n[8] Admin: Accepting booking & confirming payment...');
    const acceptResponse = await axios.put(
      `${BASE_URL}/api/admin/bookings/${bookingId}`,
      { bookingStatus: 'Accepted' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✔ Booking accepted by admin!');
    console.log('Updated Payment status:', acceptResponse.data.paymentStatus);
    console.log('Updated Booking status:', acceptResponse.data.bookingStatus);
    console.log('Assigned Invoice number:', acceptResponse.data.invoiceNumber);

    // 9. Admin: Verify Invoice exists
    console.log('\n[9] Admin: Fetching all invoices to verify ours is present...');
    const adminInvoicesResponse = await axios.get(`${BASE_URL}/api/admin/invoices`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const invoice = adminInvoicesResponse.data.find(i => i.bookingId === bookingId || i.bookingId?._id === bookingId);
    if (!invoice) {
      throw new Error('Invoice not generated/found for the accepted booking!');
    }
    console.log('✔ Invoice successfully generated and verified!');
    console.log('Invoice Number:', invoice.invoiceNumber);
    console.log('Invoice Subtotal:', invoice.subtotal);
    console.log('Invoice GST (CGST + SGST):', invoice.CGST + invoice.SGST);
    console.log('Invoice Grand Total:', invoice.grandTotal);

    console.log('\n================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('================================================');
  } catch (error) {
    console.error('\n❌ TEST FAILED with error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runTests();
