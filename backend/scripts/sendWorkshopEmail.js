import 'dotenv/config';
import { sendEmail } from '../src/utils/sendEmail.js';

const to = process.argv[2] || 'aniketxai@gmail.com';

const subject = 'Invitation: NeuroTech Workshop — "Brain Meets Tech" | 1 June 2026';

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>NeuroTech Workshop — Invitation</title>
  <style>
    body { margin:0; padding:0; background:#ffffff; font-family:Arial,sans-serif; -webkit-text-size-adjust:none; }
    @media only screen and (max-width:480px){
      .container { width:100% !important; padding:0 !important; }
      .inner { padding:16px !important; }
      .poster-section { padding:0 !important; }
      .btn { width:100% !important; box-sizing:border-box !important; }
      h1 { font-size:18px !important; }
      h2 { font-size:16px !important; }
      p, li { font-size:13px !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px; max-width:100%; background:#ffffff; border-collapse:collapse;">
          <!-- Poster Section -->
          <tr>
            <td align="center" class="poster-section" style="padding:0; text-align:center;">
              <a href="https://docs.google.com/forms/u/2/d/e/1FAIpQLSdMJ3-EHSiBJkb5kWVTHNpMMVlXDUOcn4DXjXGTS3qvzduwiA/viewform?usp=send_form" target="_blank" rel="noopener noreferrer">
                <img src="https://drive.google.com/uc?export=view&id=1zV3tShAARma_XnNrx9aaZAxdFxpjYpOg" alt="NeuroTech Workshop" style="width:100%; height:auto; display:block; border:0; max-width:600px;" />
              </a>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td class="inner" style="padding:24px 20px; color:#333;">
              <p style="margin:0 0 8px 0; font-size:14px; line-height:1.6;">Dear Students,<br><br><strong>Warm Greetings to all!</strong></p>

              <p style="margin:16px 0; font-size:14px; line-height:1.6; color:#444;">We are pleased to invite you to participate in <strong>"NeuroTech Workshop: Brain Meets Tech"</strong>, an interactive online workshop focused on Brain‑Computer Interfaces (BCI), NeuroTechnology, Artificial Intelligence, and real‑world neuroscience innovation.</p>

              <p style="margin:16px 0; font-size:14px; line-height:1.6; color:#444;">The workshop is designed to provide students with practical exposure, industry‑oriented learning, and hands‑on insights into one of the fastest‑growing interdisciplinary technology domains.</p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;"><tr><td align="center"><a href="https://docs.google.com/forms/u/2/d/e/1FAIpQLSdMJ3-EHSiBJkb5kWVTHNpMMVlXDUOcn4DXjXGTS3qvzduwiA/viewform?usp=send_form" target="_blank" rel="noopener noreferrer" class="btn" style="background:#2563eb; color:#fff; padding:12px 28px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">Register Now →</a></td></tr></table>

              <!-- What Participants Will Explore -->
              <h2 style="margin:24px 0 12px 0; font-size:16px; font-weight:bold; color:#1e40af;">🧠 What Participants Will Explore</h2>
              <ul style="margin:0 0 16px 20px; padding:0; font-size:14px; line-height:1.8; color:#444;">
                <li>Fundamentals of Brain‑Computer Interfaces (BCI)</li>
                <li>Neural signal processing and NeuroTechnology concepts</li>
                <li>AI applications in healthcare, robotics, and neuroscience</li>
                <li>Arduino‑based live technical demonstration</li>
                <li>Interactive quizzes, live polls, and Q&amp;A session</li>
              </ul>

              <!-- Industry Collaboration -->
              <h2 style="margin:24px 0 12px 0; font-size:16px; font-weight:bold; color:#1e40af;">🤝 Industry Collaboration</h2>
              <p style="margin:8px 0; font-size:14px; line-height:1.6; color:#444;"><strong>Special Industry Collaboration with Upside Down Labs</strong></p>
              <p style="margin:8px 0; font-size:14px; line-height:1.6; color:#444;">Pioneers in DIY Neuroscience Kits (EEG, EOG, ECG, EMG) and open‑source neuroscience technology.</p>
              <p style="margin:8px 0; font-size:14px; line-height:1.6; color:#444;">Participants will also attend a <strong>Special 30‑Minute Session by Upside Down Labs</strong> focused on practical NeuroTechnology and real‑world neuroscience applications.</p>

              <!-- Participant Benefits -->
              <h2 style="margin:24px 0 12px 0; font-size:16px; font-weight:bold; color:#1e40af;">🎁 Participant Benefits</h2>
              <ul style="margin:0 0 16px 20px; padding:0; font-size:14px; line-height:1.8; color:#444;">
                <li>Verifiable Digital Participation Certificates with unique authentication credentials</li>
                <li>Chance to Win an Exciting Robotic Kit through workshop engagement activities</li>
                <li>Beginner‑friendly learning experience with no prior technical background required</li>
                <li>Exposure to practical and industry‑oriented NeuroTech applications</li>
              </ul>

              <!-- Event Details -->
              <h2 style="margin:24px 0 12px 0; font-size:16px; font-weight:bold; color:#1e40af;">📅 Event Details</h2>
              <p style="margin:8px 0; font-size:14px; line-height:1.6; color:#444;">
                <strong>Date:</strong> 1 June 2026<br>
                <strong>Time:</strong> 11:00 AM – 12:15 PM<br>
                <strong>Mode:</strong> Online (Google Meet / Zoom)<br>
                <strong>Eligibility:</strong> Open to all branches and years
              </p>

              <!-- Registration Info -->
              <h2 style="margin:24px 0 12px 0; font-size:16px; font-weight:bold; color:#1e40af;">📝 Registration</h2>
              <p style="margin:8px 0; font-size:14px; line-height:1.6; color:#444;"><strong>✓ Registration is completely FREE for all participants.</strong></p>
              <p style="margin:8px 0; font-size:14px; line-height:1.6; color:#444;"><strong>⚠ Interested students are requested to REGISTER as early as possible, as participation slots are limited.</strong></p>
              <p style="margin:12px 0; font-size:14px; line-height:1.6;"><a href="https://docs.google.com/forms/u/2/d/e/1FAIpQLSdMJ3-EHSiBJkb5kWVTHNpMMVlXDUOcn4DXjXGTS3qvzduwiA/viewform?usp=send_form" target="_blank" style="color:#2563eb; text-decoration:underline; font-weight:bold;">→ Click here to register</a></p>

              <!-- Contacts -->
              <h2 style="margin:24px 0 12px 0; font-size:16px; font-weight:bold; color:#1e40af;">📞 For Queries</h2>
              <p style="margin:8px 0; font-size:14px; line-height:1.6; color:#444;">
                <strong>Akshat Singh</strong><br>
                Asst. Technical Secretary, Student Council<br>
                📞 +91 9301968695
              </p>
              <p style="margin:12px 0 8px 0; font-size:14px; line-height:1.6; color:#444;"><strong>Student Coordinators</strong></p>
              <p style="margin:8px 0; font-size:14px; line-height:1.6; color:#444;">
                <strong>Aniket Kumar (25BAI11113)</strong><br>
                📞 +91 8210993912
              </p>
              <p style="margin:8px 0; font-size:14px; line-height:1.6; color:#444;">
                <strong>Akshara Shah (25BAI11587)</strong><br>
                📞 +91 9340897576
              </p>

              <!-- Footer -->
              <div style="border-top:1px solid #e0e0e0; margin:24px 0; padding-top:16px;">
                <p style="margin:0; font-size:14px; line-height:1.6; color:#666;">
                  <strong>Warm regards,</strong><br><br>
                  <strong>Dr. Chandan Kumar Behera</strong><br>
                  Asst. Director — Students' Welfare<br>
                  VIT Bhopal University
                </p>
              </div>

              <p style="margin:12px 0 0 0; font-size:12px; color:#999;">Organized by Institution's Innovation Council (DSW, VIT Bhopal University)</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

async function main(){
  try{
    await sendEmail({ to, subject, html });
    console.log(`Email sent to ${to}`);
  }catch(err){
    console.error('Failed to send email:', err.message || err);
    process.exitCode = 1;
  }
}

main();
