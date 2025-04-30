import nodemailer from "nodemailer";
import { email_data, emailSendResult } from "./types";
import timeout from "./timeout";
import { SMTP_options } from "./smtp_config";

const transporter = nodemailer.createTransport(SMTP_options);

//ONLY FOR DEMONSTRATION
let flip = true;

export async function sendSMTPRequest(email_data: email_data, email_to: string, queue_msg_id: number) {
    // temporary artificial mailing B)
    console.log(`Start #${queue_msg_id} E-Mail Template #${email_data.id} ${email_data.subject} to ${email_to}`);
    await timeout((Math.random() * 5 + 1) * 1000);
    console.log(`Finished #${queue_msg_id}`);
    flip = !flip;
    const smtp_successful = flip;
    const smtp_error_msg: string | null = "";

    return {
        smtp_successful,
        email_id: email_data.id,
        smtp_error_msg,
        email_to,
        queue_msg_id,
    } as emailSendResult;

    // nodemailer implementation
    let message =
        email_data.attachments == null
            ? {
                  from: email_data.from,
                  to: email_to,
                  subject: email_data.subject,
                  text: email_data.text || "",
                  html: email_data.html,
              }
            : {
                  from: email_data.from,
                  to: email_to,
                  subject: email_data.subject,
                  text: email_data.text || "",
                  html: email_data.html,
                  attachements: email_data.attachments,
              };

    transporter.sendMail(message, (error, info) => {
        console.log(info);
        return {
            smtp_successful: error == null,
            email_id: email_data.id,
            smtp_error_msg: String(error),
            email_to,
            queue_msg_id,
        } as emailSendResult;
    });
}
