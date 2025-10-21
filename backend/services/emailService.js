const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send reservation confirmation email to customer
 */
const sendReservationConfirmationEmail = async (reservation, customer, medicine, pharmacy) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"MedLink" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: '✅ Reservation Confirmed - MedLink',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
            .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Reservation Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${customer.name}</strong>,</p>
              <p>Your medicine reservation has been successfully confirmed.</p>
              
              <div class="details">
                <h3>Order Details</h3>
                <div class="detail-row">
                  <span class="label">Reservation ID:</span>
                  <span>#${reservation.id}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Medicine:</span>
                  <span>${medicine.name} (${medicine.brand})</span>
                </div>
                <div class="detail-row">
                  <span class="label">Quantity:</span>
                  <span>${reservation.quantity} units</span>
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span>
                  <span><strong>৳${parseFloat(reservation.totalPrice).toFixed(2)}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="label">Delivery Option:</span>
                  <span>${reservation.deliveryOption === 'pickup' ? '🏪 Pickup' : '🚚 Home Delivery'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span style="color: #10b981;">●  ${reservation.status.toUpperCase()}</span>
                </div>
              </div>

              <div class="details">
                <h3>Pharmacy Information</h3>
                <div class="detail-row">
                  <span class="label">Pharmacy:</span>
                  <span>${pharmacy.name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Address:</span>
                  <span>${pharmacy.address}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Phone:</span>
                  <span>${pharmacy.phone}</span>
                </div>
              </div>

              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>The pharmacy will review your reservation</li>
                <li>You will receive a notification once it's accepted</li>
                <li>You can track your order in your dashboard</li>
              </ul>

              <center>
                <a href="${process.env.CLIENT_URL}/customer/reservations" class="btn">View My Orders</a>
              </center>

              <div class="footer">
                <p>Thank you for using MedLink!</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${customer.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment success email with receipt
 */
const sendPaymentSuccessEmail = async (reservation, customer, medicine, pharmacy) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"MedLink" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: '💳 Payment Successful - MedLink Receipt',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #059669; }
            .total { font-size: 24px; color: #10b981; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Payment Successful!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${customer.name}</strong>,</p>
              <p>Your payment has been successfully processed. Here's your receipt:</p>
              
              <div class="receipt">
                <h3 style="text-align: center; color: #10b981;">PAYMENT RECEIPT</h3>
                <div class="detail-row">
                  <span class="label">Transaction ID:</span>
                  <span>${reservation.transactionId}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Reservation ID:</span>
                  <span>#${reservation.id}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Date:</span>
                  <span>${new Date(reservation.paidAt).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Method:</span>
                  <span>${reservation.paymentMethod || 'SSLCommerz'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Medicine:</span>
                  <span>${medicine.name} (${medicine.brand})</span>
                </div>
                <div class="detail-row">
                  <span class="label">Quantity:</span>
                  <span>${reservation.quantity} units</span>
                </div>
                <div class="detail-row" style="border-bottom: 2px solid #10b981;">
                  <span class="label">Amount Paid:</span>
                  <span class="total">৳${parseFloat(reservation.totalPrice).toFixed(2)}</span>
                </div>
              </div>

              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Your order is being prepared by ${pharmacy.name}</li>
                <li>You will receive updates on your order status</li>
                <li>${reservation.deliveryOption === 'pickup' ? 'Please visit the pharmacy to collect your medicine' : 'Your medicine will be delivered to your address'}</li>
              </ul>

              <div class="footer">
                <p>Thank you for your payment!</p>
                <p>For questions, contact us at support@medlink.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment receipt sent to ${customer.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending payment email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send status update email (accepted, rejected, delivered)
 */
const sendStatusUpdateEmail = async (reservation, customer, medicine, pharmacy, newStatus) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();

    // Status-specific content
    const statusConfig = {
      accepted: {
        color: '#3b82f6',
        icon: '✅',
        title: 'Order Accepted',
        message: 'Good news! Your reservation has been accepted by the pharmacy.',
      },
      rejected: {
        color: '#ef4444',
        icon: '❌',
        title: 'Order Rejected',
        message: 'Unfortunately, your reservation has been rejected by the pharmacy.',
      },
      delivered: {
        color: '#10b981',
        icon: '🎉',
        title: 'Order Delivered',
        message: 'Your medicine has been successfully delivered!',
      },
    };

    const config = statusConfig[newStatus] || statusConfig.accepted;

    const mailOptions = {
      from: `"MedLink" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: `${config.icon} ${config.title} - Reservation #${reservation.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${config.color}; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${config.icon} ${config.title}</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${customer.name}</strong>,</p>
              <p>${config.message}</p>
              
              <div class="details">
                <h3>Order Summary</h3>
                <div class="detail-row">
                  <span class="label">Reservation ID:</span>
                  <span>#${reservation.id}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Medicine:</span>
                  <span>${medicine.name} (${medicine.brand})</span>
                </div>
                <div class="detail-row">
                  <span class="label">Pharmacy:</span>
                  <span>${pharmacy.name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span style="color: ${config.color}; font-weight: bold;">${newStatus.toUpperCase()}</span>
                </div>
              </div>

              ${newStatus === 'delivered' ? '<p><strong>Thank you for choosing MedLink! We hope you have a speedy recovery.</strong></p>' : ''}

              <div class="footer">
                <p>MedLink - Your Neighborhood Medicine Locator</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${customer.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending status update email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendReservationConfirmationEmail,
  sendPaymentSuccessEmail,
  sendStatusUpdateEmail,
};
