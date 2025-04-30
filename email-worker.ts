import dotenv from "dotenv";
import { emailSendResult, readQueueResponse } from "./utils/types";
import timeout from "./utils/timeout";
import { sendSMTPRequest } from "./utils/nodemailer";
import { deleteQueueItems, getEmailData, logToDB, readQueueItems } from "./utils/supabase";

dotenv.config();

const amountOfQueueItems = process.env.AMOUNT_QUEUE_ITEMS || 5;

let main = async () => {
    let queueEmtpy = await processNextQueueItems(Number(amountOfQueueItems));

    if (queueEmtpy) {
        console.log("Queue seems empty, waiting 3 Seconds...");
        await timeout(3000);
    }
    main();
};

main();

async function processNextQueueItems(amount: number) {
    const queueItems = await readQueueItems(amount);

    if (queueItems.data.length <= 0) return true;

    const results = await sendEmails(queueItems);

    await logToDB(results);

    await deleteQueueItems(results);

    return false;
}

async function sendEmails(queueItems: readQueueResponse) {
    let promises: Promise<emailSendResult>[] = [];

    for (let i = 0; i < queueItems.data.length; i++) {
        promises.push(
            createSendEmailPromise(
                queueItems.data[i].message.email_id,
                queueItems.data[i].msg_id,
                queueItems.data[i].message.email_to
            )
        );
    }

    const results = await Promise.all(promises);

    return results;
}

function createSendEmailPromise(emailId: number, queueMsgId: number, emailTo: string) {
    const emailPromise = new Promise<emailSendResult>(async (resolve, reject) => {
        let emailData = await getEmailData(emailId);

        if (emailData == null)
            return reject("No E-Mail Data available. Check Supabase ENV Variables and if table/template exists");

        let result = await sendSMTPRequest(emailData, emailTo, queueMsgId);

        resolve(result);
    });

    return emailPromise;
}
