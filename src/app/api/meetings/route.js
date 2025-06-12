import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// POST /api/meetings -> create meeting & notify members
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, date, time, location, link, description, recipients } = body;

    if (!title || !date || !time || !location || !recipients?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO: Persist meeting in database here (e.g., Supabase)

    // Send email notifications
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `NST Dev Club <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipients.join(","),
      subject: `New Meeting Scheduled: ${title}`,
      html: `<p>Hi Dev Club member,</p>
        <p>A new meeting has been scheduled.</p>
        <ul>
          <li><strong>Title:</strong> ${title}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Location:</strong> ${location}${link ? ` (<a href="${link}">Join here</a>)` : ""}</li>
        </ul>
        <p>${description || ""}</p>
        <p>See you there!</p>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Meeting creation error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
