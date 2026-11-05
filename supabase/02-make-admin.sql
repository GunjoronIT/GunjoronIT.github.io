-- আগে Dashboard → Authentication → Users → "Add user" → "Create new user" দিয়ে
-- আপনার ইমেইল + পাসওয়ার্ড দিয়ে ইউজার বানান ("Auto Confirm User" টিক দিন)।
-- তারপর নিচের লাইনে আপনার ইমেইল বসিয়ে এটি SQL Editor-এ Run করুন:

insert into public.admins (user_id)
select id from auth.users where email = 'আপনার-ইমেইল@example.com'
on conflict do nothing;

-- ঠিক হয়েছে কিনা যাচাই (১টি সারি আসা উচিত):
select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
