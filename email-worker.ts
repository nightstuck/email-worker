import dotenv from "dotenv";
import { emailSendResult, readQueueResponse } from "./utils/types";
import timeout from "./utils/timeout";
import { sendSMTPRequest } from "./utils/nodemailer";
import {
    deleteQueueItems,
    getEmailData,
    logToDB,
    readQueueItems,
} from "./utils/supabase";


dotenv.config();

const amountOfQueueItems = process.env.AMOUNT_QUEUE_ITEMS || 5;

let main = async () => {
    let queue_emtpy = await processNextQueueItems(Number(amountOfQueueItems));

    if (queue_emtpy) {
        console.log("Queue seems empty, waiting 3 Seconds...");
        await timeout(3000);
    }
    main();
};

main();

async function processNextQueueItems(amount: number) {
    const queue_items = await readQueueItems(amount);

    if (queue_items.data.length <= 0) return true;

    const results = await sendEmails(queue_items);

    await logToDB(results);

    await deleteQueueItems(results);

    return false;
}

async function sendEmails(queue_items: readQueueResponse) {
    let email_data, result;
    let results: emailSendResult[] = [];

    for (let i = 0; i < queue_items.data.length; i++) {
        email_data = await getEmailData(queue_items.data[i].message.email_id);
        result = await sendSMTPRequest(
            email_data,
            queue_items.data[i].message.email_to,
            queue_items.data[i].msg_id,
        );
        results.push(result);
    }

    return results;
}
