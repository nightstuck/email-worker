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
  let promises: Promise<emailSendResult>[] = [];

  for (let i = 0; i < queue_items.data.length; i++) {
    promises.push(
      createSendEmailPromise(
        queue_items.data[i].message.email_id,
        queue_items.data[i].msg_id,
        queue_items.data[i].message.email_to
      )
    );
  }

  const results = await Promise.all(promises);

  return results;
}

function createSendEmailPromise(
  email_id: number,
  queue_msg_id: number,
  email_to: string
) {
  const emailPromise = new Promise<emailSendResult>(async (resolve, reject) => {
    let emailData = await getEmailData(email_id);

    if (emailData == null)
      return reject("No E-Mail Data available. Check Supabase ENV Variables.");

    let result = await sendSMTPRequest(emailData, email_to, queue_msg_id);

    resolve(result);
  });

  return emailPromise;
}
