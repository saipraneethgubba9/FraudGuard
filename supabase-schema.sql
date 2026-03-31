-- FraudGuard Supabase Schema
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scam_checks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  analysis TEXT NOT NULL,
  risk_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS scenarios (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_answer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  scenario_id INTEGER REFERENCES scenarios(id),
  selected_answer TEXT NOT NULL,
  is_correct INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scam_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  user_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name, description) VALUES
('OTP Scams', 'Scams involving one-time passwords and fake bank calls.'),
('Job Scams', 'Fake job offers and recruitment fraud.'),
('UPI Scams', 'Fraudulent payment requests and QR code scams.'),
('Phishing Scams', 'Deceptive emails and websites designed to steal credentials.'),
('Investment Scams', 'Get-rich-quick schemes and fraudulent cryptocurrency platforms.'),
('Romance Scams', 'Fraudsters creating fake profiles on dating sites to exploit victims.'),
('Tech Support Scams', 'Fake alerts about computer viruses to gain remote access.'),
('Lottery Scams', 'False claims of winning a prize to extract processing fees.');

-- OTP Scenarios
INSERT INTO scenarios (category_id, question, options, correct_answer) VALUES
(1, 'You receive a call from someone claiming to be from your bank. They say your account is blocked and ask for the OTP sent to your phone to unblock it. What do you do?', '["Share the OTP to unblock the account","Hang up and call the official bank number","Ask them for their employee ID first"]', 'Hang up and call the official bank number'),
(1, 'An SMS says you won a lottery and asks you to click a link and enter the OTP you just received. What is the safest action?', '["Click the link and enter OTP","Ignore and delete the message","Share the link with friends"]', 'Ignore and delete the message'),
(1, 'A delivery agent calls saying they need a confirmation OTP to hand over a package you didn''t order. What do you do?', '["Give the OTP to see what''s inside","Refuse the package and do not share any OTP","Ask them to leave it at the door"]', 'Refuse the package and do not share any OTP'),
(1, 'You get a text with an OTP you didn''t request. Someone calls claiming to be Tech Support and asks for that code. What do you do?', '["Provide the code to secure your account","Hang up and change your password immediately","Tell them the code but ask for a confirmation email"]', 'Hang up and change your password immediately'),
(1, 'A friend messages you on Facebook asking for an OTP that was accidentally sent to your number. What is the most likely situation?', '["It''s a genuine mistake","Your friend''s account is hacked and they are trying to access yours","The network is having a glitch"]', 'Your friend''s account is hacked and they are trying to access yours');

-- Job Scenarios
INSERT INTO scenarios (category_id, question, options, correct_answer) VALUES
(2, 'A recruiter contacts you on WhatsApp offering a high-paying remote job but asks for a security deposit for equipment. Is this legitimate?', '["Yes, many companies do this","No, legitimate employers never ask for money","Maybe, if they provide a receipt"]', 'No, legitimate employers never ask for money'),
(2, 'You get an email for a job you didn''t apply for, asking for your bank details for payroll setup before an interview. What should you do?', '["Provide details to speed up the process","Report as spam and do not provide details","Ask for the company''s address first"]', 'Report as spam and do not provide details'),
(2, 'An employer asks you to perform a test task that involves buying gift cards and sending them the codes. Is this a scam?', '["Yes, this is a common money laundering tactic","No, it''s a test of my efficiency","Only if the amount is over $100"]', 'Yes, this is a common money laundering tactic'),
(2, 'You are offered a job as a Payment Processor where you receive money and transfer it to others, keeping 10% commission. What is this?', '["A legitimate freelance role","Illegal money laundering (Money Mule)","A high-commission banking job"]', 'Illegal money laundering (Money Mule)'),
(2, 'A job posting looks perfect, but the interviewer insists on conducting the entire interview via Telegram. Is this a red flag?', '["No, many tech companies use Telegram","Yes, professional companies use official platforms or video calls","Only if they don''t have a profile picture"]', 'Yes, professional companies use official platforms or video calls');

-- UPI Scenarios
INSERT INTO scenarios (category_id, question, options, correct_answer) VALUES
(3, 'Someone sends you a QR code saying you will receive money if you scan it and enter your UPI PIN. Is this true?', '["Yes, PIN is needed to receive money","No, PIN is only needed to send money","Only if the amount is large"]', 'No, PIN is only needed to send money'),
(3, 'You receive a Collect Request on your UPI app from an unknown person for a refund. What do you do?', '["Approve it to get the refund","Decline the request immediately","Wait for a few hours"]', 'Decline the request immediately'),
(3, 'A stranger asks you to pay a small verification fee via UPI to unlock a prize. What is your response?', '["Pay the fee, it''s small","Block the user and report the profile","Ask for their ID card first"]', 'Block the user and report the profile'),
(3, 'Someone claims you overpaid your electricity bill and wants to refund you via a UPI request asking you to Authorize. What happens if you authorize?', '["You get the refund","Money is deducted from your account","Nothing happens until you enter the amount"]', 'Money is deducted from your account'),
(3, 'You find a Customer Care number on a random blog. The person asks you to download a screen-sharing app to help with a UPI issue. Should you?', '["Yes, they need to see the error","No, screen-sharing allows them to see your PIN and OTPs","Only if I trust the blog"]', 'No, screen-sharing allows them to see your PIN and OTPs');

-- Phishing Scenarios
INSERT INTO scenarios (category_id, question, options, correct_answer) VALUES
(4, 'You receive an email from Netflix saying your payment failed with a link to update billing. The sender is support@netflix-billing.com. What do you do?', '["Click the link and update info","Go directly to netflix.com in your browser","Reply to the email asking for help"]', 'Go directly to netflix.com in your browser'),
(4, 'A text from your bank warns of suspicious activity and asks you to log in via a link. The URL is secure-bank-login.net. Is this safe?', '["Yes, it looks official","No, banks don''t send login links via SMS","Only if I use my private browser"]', 'No, banks don''t send login links via SMS'),
(4, 'You receive a document on Google Drive from an unknown sender. To view it, you are asked to log in with your email provider. What is likely happening?', '["Standard security check","Credential harvesting phishing attack","Google Drive error"]', 'Credential harvesting phishing attack'),
(4, 'A Facebook friend tags you in a post about an accident. The link takes you to a fake login page. What should you do?', '["Log in to see the news","Close the page and warn your friend their account is hacked","Report the post to the police"]', 'Close the page and warn your friend their account is hacked'),
(4, 'You see a sponsored ad for 50% off on a luxury brand. The URL is www.adidas-outlet-store-deals.com. Is this legitimate?', '["Yes, it''s a sponsored ad","No, the domain name is suspicious and likely a scam site","Only if they accept credit cards"]', 'No, the domain name is suspicious and likely a scam site');

-- Investment Scenarios
INSERT INTO scenarios (category_id, question, options, correct_answer) VALUES
(5, 'An Instagram ad promises 500% returns in 24 hours through expert crypto trading. They ask you to join a Telegram group. What do you do?', '["Join and invest a small amount","Ignore it, if it sounds too good to be true, it is","Ask for their trading license"]', 'Ignore it, if it sounds too good to be true, it is'),
(5, 'A friend''s account sends you a link to a new investment platform that pays you for recruiting others. What is this?', '["A great opportunity","A Ponzi/Pyramid scheme","A legitimate multi-level marketing business"]', 'A Ponzi/Pyramid scheme'),
(5, 'You are invited to a Cloud Mining platform where you buy hash power to earn daily Bitcoin. They show fake withdrawal proofs. What is the most likely outcome?', '["I will become rich","The site will disappear once enough people invest","I will earn slow but steady profit"]', 'The site will disappear once enough people invest'),
(5, 'A Financial Advisor on LinkedIn suggests a pre-IPO investment but asks you to send funds to a personal bank account. Is this normal?', '["Yes, for early access","No, legitimate investments are handled through regulated brokerages","Only if they have 500+ connections"]', 'No, legitimate investments are handled through regulated brokerages'),
(5, 'You receive a wrong number text that leads to a conversation about a profitable Gold Trading app. What is this tactic called?', '["Social Engineering / Pig Butchering","Friendly Marketing","Accidental Networking"]', 'Social Engineering / Pig Butchering');

-- Romance Scenarios
INSERT INTO scenarios (category_id, question, options, correct_answer) VALUES
(6, 'You''ve been chatting with someone online for weeks. They claim to be working overseas and suddenly need money for an emergency surgery. What do you do?', '["Send the money immediately","Never send money to someone you haven''t met in person","Offer to pay the hospital directly"]', 'Never send money to someone you haven''t met in person'),
(6, 'An online partner asks you to receive money into your bank account and transfer it to another account as a favor. What is the risk?', '["No risk, just helping a friend","You could be acting as a money mule for illegal funds","It might affect your credit score"]', 'You could be acting as a money mule for illegal funds'),
(6, 'A person you met on a dating app insists on moving to an encrypted app and starts asking about your financial status. Is this a warning sign?', '["No, they just want privacy","Yes, scammers often try to move off-platform and vet victims'' wealth","Only if they are from another country"]', 'Yes, scammers often try to move off-platform and vet victims'' wealth'),
(6, 'Your online partner says they sent you an expensive gift but it''s stuck at customs and you need to pay a clearance fee. What should you do?', '["Pay the fee to get the gift","Realize the gift doesn''t exist and it''s a scam","Ask for a tracking number"]', 'Realize the gift doesn''t exist and it''s a scam'),
(6, 'Someone you met online asks you to send intimate photos. Later, they threaten to share them unless you pay. What is this?', '["A misunderstanding","Sextortion","A test of trust"]', 'Sextortion');

-- Tech Support Scenarios
INSERT INTO scenarios (category_id, question, options, correct_answer) VALUES
(7, 'A pop-up on your computer says VIRUS DETECTED and gives a toll-free number to call Microsoft Support. What should you do?', '["Call the number immediately","Close the browser and run your own antivirus","Follow the instructions on the screen"]', 'Close the browser and run your own antivirus'),
(7, 'A technician calls saying they noticed errors on your computer and need to install AnyDesk to fix it. Should you allow this?', '["Yes, they are trying to help","No, never give remote access to unsolicited callers","Only if they don''t ask for a password"]', 'No, never give remote access to unsolicited callers'),
(7, 'You receive a call from Amazon Support saying there is a fraudulent order. They ask you to buy a gift card to cancel the order. Is this legitimate?', '["Yes, gift cards are used for refunds","No, legitimate companies never ask for payment in gift cards","Only if it''s a high-value order"]', 'No, legitimate companies never ask for payment in gift cards'),
(7, 'Your screen locks and a message says FBI: Your computer is locked due to illegal activity. Pay $500 fine to unlock. What is this?', '["A real legal notice","Ransomware / Scareware scam","A system update"]', 'Ransomware / Scareware scam'),
(7, 'A caller claiming to be from Apple says your iCloud is breached. They ask for your Apple ID password to verify your identity. What do you do?', '["Give the password to secure the account","Hang up; Apple will never ask for your password over the phone","Give a fake password first"]', 'Hang up; Apple will never ask for your password over the phone');

-- Lottery Scenarios
INSERT INTO scenarios (category_id, question, options, correct_answer) VALUES
(8, 'You get a letter saying you won a Global Sweepstakes but must pay a customs clearance fee to receive your millions. What do you do?', '["Pay the fee to get the millions","Tear up the letter, it''s a scam","Call the number to verify"]', 'Tear up the letter, it''s a scam'),
(8, 'An email claims you won an iPhone in a contest you don''t remember entering. It asks for your address and a shipping fee. What is the catch?', '["There is no catch, I''m lucky","They just want your credit card info for the fee","I might have entered it and forgotten"]', 'They just want your credit card info for the fee'),
(8, 'You receive a WhatsApp message from KBC with a lottery check for 25 Lakhs. It asks you to call a Manager on a specific number. What is the best action?', '["Call the manager to claim the prize","Block and report the number as a scam","Share it with family to see if it''s real"]', 'Block and report the number as a scam'),
(8, 'A Government email says you have unclaimed tax refunds but you must provide your bank login details on a portal to receive it. Is this how refunds work?', '["Yes, it''s a direct deposit","No, governments use official channels and never ask for passwords","Only during tax season"]', 'No, governments use official channels and never ask for passwords'),
(8, 'You win a Free Vacation in a lucky draw but must attend a 4-hour sales presentation and pay a membership fee first. Is this a free vacation?', '["Yes, after the presentation","No, it''s a high-pressure sales tactic for expensive timeshares","Only if the hotel is 5-star"]', 'No, it''s a high-pressure sales tactic for expensive timeshares');
