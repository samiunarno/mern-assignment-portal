// FIX: Add reference to Node.js types to resolve issues with global types like Buffer.
/// <reference types="node" />

import nodemailer from 'nodemailer';

interface Attachment {
    filename: string;
    content: Buffer;
    contentType: string;
}

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
    attachments?: Attachment[];
}

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (options: EmailOptions) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // In a real app, you might use a more robust logging or error handling service
        throw new Error('Failed to send email.');
    }
};