/**
 * !!!This file is only to manually populate the Queue!!!
 * Usage: npx tsx populate_queue.ts
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv"

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:8000";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

populateQueue(30);

async function sendToQueue(to: string) {
    const result = await supabase.schema('pgmq_public').rpc('send', {
        queue_name: 'emails',
        message: {
                email_id: 1,
                email_to: to
            },
        sleep_seconds: 1,
    });

    console.log(result);
}

async function populateQueue(amount: number) {
    for(let i = 0; i < amount; i++) {
        await sendToQueue("testmail@mail.de");
    }
}