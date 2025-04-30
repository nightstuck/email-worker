import { createClient } from "@supabase/supabase-js";
import { email_data, emailSendResult, readQueueResponse } from "./types";

import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:8000";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

let email_data_cache: email_data | null = null;

export async function readQueueItems(amount: number) {
    const queue_items = (await supabase.schema("pgmq_public").rpc("read", {
        queue_name: "emails",
        sleep_seconds: 5 * amount,
        n: amount,
    })) as readQueueResponse;

    return queue_items;
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
    if (email_data_cache != null && email_data_cache.id == email_id) {
        return email_data_cache;
    }

    let { error, data } = await supabase.from("email_template").select().eq("id", email_id);
    if (error != null || data == null) return null;
    email_data_cache = data[0] as email_data;

    return email_data_cache;
}
