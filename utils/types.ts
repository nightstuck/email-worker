import { AttachmentLike } from 'nodemailer/lib/mailer';

export type email_data = {
    id: number,
    from: string,
    subject: string,
    text: string | null,
    attachments: AttachmentLike | null,
    html: string
};

export type readQueueResponse = {
    data: {
        msg_id: number,
        message: {
            email_id: number,
            email_to: string
        }
    }[], 
    error: string | null,
    status: number,
    statusText: string
}

export type emailSendResult = {
    smtp_successful: boolean;
    email_id: number;
    smtp_error_msg: string;
    email_to: string;
    queue_msg_id: number;
}