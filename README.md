# email-worker
reads items of a supabase pgmq queue and sends emails with nodemailer

# Usage
npm install

create .env file in root dir:
```
SUPABASE_KEY="your-(anon)-user-key"
SUPABASE_URL="http://supabase.at.your.pc"
AMOUNT_QUEUE_ITEMS=10 //defaults to 5
```

npx tsx email-worker.ts
# Supabase Queue Message Format
```
{
    email_id: 1, // id of the email_template row
    email_to: to // email address string
}
```

# Supabase migration example
./supabase_migration.sql

NOTE: still missing RLS policies for tables email_template & processed_emails