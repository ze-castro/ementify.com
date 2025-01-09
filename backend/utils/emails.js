function recoverPasswordEmail(user, passwordResetToken) {
  return `<!DOCTYPE html>
  <html>
  <head>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              margin: 0;
              padding: 0;
          }
          .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border: 1px solid #dddddd;
              border-radius: 8px;
              padding: 20px;
          }
          .header {
              text-align: center;
              padding: 10px 0;
              background-color: #4CAF50;
              color: white;
              font-size: 24px;
              font-weight: bold;
              border-radius: 8px 8px 8px 8px;
          }
          .content {
              margin: 20px 0;
              line-height: 1.6;
          }
          .button {
              display: inline-block;
              margin: 20px 0;
              padding: 10px 20px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 16px;
          }
          .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999999;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header">Password Recovery</div>
          <div class="content">
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>You requested to recover your password. Please click on the button below to reset your password:</p>
              <p>
                  <a href="https://ementify.com/change-password?token=${passwordResetToken}" class="button">
                      Reset Your Password
                  </a>
              </p>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <p>Thank you,<br>The Ementify Team</p>
          </div>
          <div class="footer">
              &copy; 2025 Ementify. All rights reserved.
          </div>
      </div>
  </body>
  </html>
  `;
}

export default recoverPasswordEmail;