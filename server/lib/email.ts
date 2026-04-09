import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLink(email: string, token: string) {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Your Magic Link",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">LocalHost</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Your Magic Link is Ready!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.8;">
                Click the button below to sign in to your account. This link will expire in 15 minutes.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 14px 30px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: 600; 
                          display: inline-block;
                          font-size: 16px;">
                  Sign In to LocalHost
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                If you didn't request this link, you can safely ignore this email.
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 10px;">
                Or copy and paste this URL into your browser:<br>
                <span style="color: #667eea; word-break: break-all;">${magicLink}</span>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}
