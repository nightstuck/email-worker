import nodemailer from "nodemailer";
import { emailData, emailSendResult } from "./types";
import timeout from "./timeout";
import { SMTP_options } from "./smtp_config";

const transporter = nodemailer.createTransport(SMTP_options);

//ONLY FOR DEMONSTRATION
let flip = 0;

export async function sendSMTPRequest(emailData: emailData, emailTo: string, queueMsgId: number) {
    // temporary artificial mailing B)
    console.log(`Start #${queueMsgId} E-Mail Template #${emailData.id} ${emailData.subject} to ${emailTo}`);
    await timeout((Math.random() * 5 + 1) * 1000);
    flip++;
    const smtpSuccessful = flip % 5 != 0;
    if (smtpSuccessful) console.log(`Finished #${queueMsgId}`);
    else console.log(`Failed #${queueMsgId}`);
    const smtpErrorMsg: string | null = "";

    return {
        smtp_successful: smtpSuccessful,
        email_id: emailData.id,
        smtp_error_msg: smtpErrorMsg,
        email_to: emailTo,
        queue_msg_id: queueMsgId,
    } as emailSendResult;

    /* nodemailer implementation
    let message =
        emailData.attachments == null
            ? {
                  from: emailData.from,
                  to: email_to,
                  subject: emailData.subject,
                  text: emailData.text || "",
                  html: emailData.html,
              }
            : {
                  from: emailData.from,
                  to: email_to,
                  subject: emailData.subject,
                  text: emailData.text || "",
                  html: emailData.html,
                  attachements: emailData.attachments,
              };

    transporter.sendMail(message, (error, info) => {
        console.log(info);
        return {
            smtp_successful: error == null,
            email_id: emailData.id,
            smtp_error_msg: String(error),
            email_to,
            queue_msg_id,
        } as emailSendResult;
    });*/
}
