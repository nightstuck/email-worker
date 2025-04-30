import { createClient } from "@supabase/supabase-js";
import { emailData, emailSendResult, readQueueResponse } from "./types";

import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:8000";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

let emailDataCache: emailData | null = null;

export async function readQueueItems(amount: number) {
    const queueItems = (await supabase.schema("pgmq_public").rpc("read", {
        queue_name: "emails",
        sleep_seconds: 5 * amount,
        n: amount,
    })) as readQueueResponse;

    return queueItems;
}

export async function deleteQueueItems(results: emailSendResult[]) {
    for (let i = 0; i < results.length; i++) {
        if (results[i].smtp_successful) {
            await supabase.schema("pgmq_public").rpc("delete", {
                queue_name: "emails",
                message_id: results[i].queue_msg_id,
            });
        }
    }
}

export async function logToDB(results: emailSendResult[]) {
    const { error } = await supabase.from("processed_emails").insert(results);
    if (error != null) console.log(error);
}

export async function getEmailData(email_id: number) {
    if (emailDataCache != null && emailDataCache.id == email_id) {
        return emailDataCache;
    }

    let { error, data } = await supabase.from("email_template").select().eq("id", email_id);
    if (error != null || data == null) return null;
    emailDataCache = data[0] as emailData;

    return emailDataCache;
}
