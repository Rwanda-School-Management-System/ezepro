-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- shared updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  username text UNIQUE,
  email text,
  phone text,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, phone)
  VALUES (NEW.id,
          NEW.raw_user_meta_data->>'full_name',
          NULLIF(NEW.raw_user_meta_data->>'username',''),
          NEW.email,
          NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN lower(coalesce(NEW.raw_user_meta_data->>'username','')) = 'ezeprodeveloper'
                       OR lower(coalesce(NEW.email,'')) = 'ezeprodeveloper@gmail.com'
                  THEN 'admin'::public.app_role ELSE 'user'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- HERO SLIDES
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  button_text text,
  button_url text,
  secondary_button_text text,
  secondary_button_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  short_description text,
  description text,
  icon text,
  image_url text,
  category text NOT NULL DEFAULT 'technology',
  price_from text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- JOBS
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  location text,
  job_type text NOT NULL DEFAULT 'Full-time',
  category text NOT NULL DEFAULT 'Job',
  experience_level text,
  salary text,
  deadline date,
  description text,
  requirements text,
  application_link text,
  image_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SCHOLARSHIPS
CREATE TABLE public.scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  organization text NOT NULL,
  country text,
  degree_level text,
  funding_type text,
  category text NOT NULL DEFAULT 'Fully funded',
  deadline date,
  eligibility text,
  requirements text,
  benefits text,
  instructions text,
  application_link text,
  image_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- COURSES
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  instructor text,
  category text NOT NULL DEFAULT 'Web Development',
  level text NOT NULL DEFAULT 'Beginner',
  duration text,
  description text,
  image_url text,
  price numeric NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT true,
  lessons_count int NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 5,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- BLOG
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  author text,
  category text NOT NULL DEFAULT 'Technology',
  excerpt text,
  content text,
  image_url text,
  tags text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  story text NOT NULL,
  service_used text,
  rating int NOT NULL DEFAULT 5,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- FAQS
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SITE SETTINGS
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SUBMISSIONS
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_needed text NOT NULL,
  description text,
  document_url text,
  preferred_contact text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.repair_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  device_type text NOT NULL,
  brand text,
  problem text NOT NULL,
  location text,
  preferred_date date,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GRANTS + RLS for public content tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['hero_slides','services','jobs','scholarships','courses','blog_posts','testimonials','faqs','site_settings']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin'')) WITH CHECK (public.has_role(auth.uid(),''admin''))', t);
    EXECUTE format('CREATE TRIGGER %1$s_updated BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;

CREATE POLICY "public read active slides" ON public.hero_slides FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "public read services" ON public.services FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "public read jobs" ON public.jobs FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "public read scholarships" ON public.scholarships FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "public read courses" ON public.courses FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "public read posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "public read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (is_approved);
CREATE POLICY "anyone submits testimonial" ON public.testimonials FOR INSERT TO anon, authenticated WITH CHECK (is_approved = false);
CREATE POLICY "public read faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

-- submissions grants/rls
GRANT INSERT ON public.service_requests TO anon;
GRANT SELECT, INSERT ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone submits service request" ON public.service_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "own service requests" ON public.service_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins manage service requests" ON public.service_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER service_requests_updated BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT INSERT ON public.repair_requests TO anon;
GRANT SELECT, INSERT ON public.repair_requests TO authenticated;
GRANT ALL ON public.repair_requests TO service_role;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone submits repair request" ON public.repair_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "own repair requests" ON public.repair_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins manage repair requests" ON public.repair_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER repair_requests_updated BEFORE UPDATE ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone sends message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins manage messages" ON public.contact_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone subscribes" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins manage subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SEED
INSERT INTO public.site_settings (key, value) VALUES
 ('site_name','Eze Pro Developer'),
 ('tagline','Technology, Education and Opportunities in One Place'),
 ('phone','0793054502'),
 ('whatsapp','250793054502'),
 ('email','ezeprodeveloper@gmail.com'),
 ('address','Kigali, Rwanda'),
 ('facebook','https://facebook.com'),
 ('twitter','https://x.com'),
 ('instagram','https://instagram.com'),
 ('linkedin','https://linkedin.com'),
 ('youtube','https://youtube.com');

INSERT INTO public.hero_slides (title, subtitle, image_url, button_text, button_url, secondary_button_text, secondary_button_url, sort_order) VALUES
 ('Build Your Digital Future','Websites, mobile apps and IT support built in Rwanda for businesses, schools and organizations.','https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80','Request a Service','/services','Talk on WhatsApp','/contact',1),
 ('Learn. Create. Apply. Grow.','Practical online courses in web development, mobile apps, Microsoft Office and digital skills.','https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80','Browse Courses','/courses','See Opportunities','/jobs',2),
 ('Technology, Education and Opportunities','Find jobs, scholarships and internships, and get help applying for them.','https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80','Find Opportunities','/jobs','Get Application Help','/applications',3);

INSERT INTO public.services (slug,title,short_description,description,icon,category,sort_order) VALUES
 ('website-development','Website Development','Professional websites for individuals, businesses, schools and organizations.','We design and build fast, responsive and secure websites tailored to your goals, including school portals, business sites and e-commerce.','Globe','technology',1),
 ('mobile-app-development','Mobile App Development','Android and modern mobile application development.','From idea to published app: UI design, development, testing and maintenance for Android and cross-platform apps.','Smartphone','technology',2),
 ('computer-repair','Computer Repair','Computer diagnosis, troubleshooting, hardware and software support.','Laptop, desktop and printer repair with honest diagnosis and fast turnaround in Kigali and beyond.','Wrench','repair',3),
 ('microsoft-office','Microsoft Office Services','Installation, configuration and updates for Microsoft Office.','Legal installation guidance, configuration, updates and training for Word, Excel, PowerPoint and Outlook.','FileText','technology',4),
 ('software-installation','Software Installation','Install and configure useful software according to your needs.','Operating systems, drivers, design tools, developer tools and security software installed and configured properly.','Download','technology',5),
 ('it-support','IT Support','Remote and local technology support for people and teams.','Ongoing IT support, network setup, data backup assistance and computer setup for offices and schools.','Headphones','technology',6),
 ('online-learning','Online Learning','Learn technology and other useful skills online.','Structured online courses with lessons, materials and certificates so you can learn at your own pace.','GraduationCap','education',7),
 ('logo-design','Logo & Graphic Design','Logos, banners and brand materials.','Original logo design, social media graphics and print materials that make your brand memorable.','PenTool','design',8),
 ('domain-hosting','Domain & Hosting Guidance','Get your domain and hosting set up correctly.','We help you choose, register and configure domains, hosting and professional email.','Server','technology',9);

INSERT INTO public.jobs (slug,title,company,location,job_type,category,experience_level,salary,deadline,description,requirements,application_link) VALUES
 ('junior-web-developer-kigali','Junior Web Developer','Kigali Tech Hub','Kigali, Rwanda','Full-time','Job','Entry level','RWF 400,000 - 600,000', current_date + 30,'Join a growing product team building web applications for local businesses.','Knowledge of HTML, CSS, JavaScript and one modern framework. Diploma or degree in IT is an advantage.','https://example.com/apply'),
 ('it-support-intern','IT Support Intern','Rwanda Education Board','Kigali, Rwanda','Internship','Internship','Student','Stipend', current_date + 21,'Support staff with hardware, software and network issues during a 3-month internship.','Currently studying IT or recently graduated. Good communication skills.','https://example.com/apply'),
 ('remote-mobile-developer','Remote Flutter Developer','Afri Apps','Remote','Remote','Remote jobs','Mid level','USD 1,200 - 1,800/month', current_date + 45,'Build and maintain cross-platform mobile apps for clients across Africa.','2+ years with Flutter or React Native, Git, REST APIs.','https://example.com/apply'),
 ('data-entry-part-time','Part-time Data Entry Officer','Umurava Ltd','Musanze, Rwanda','Part-time','Part-time jobs','Entry level','RWF 200,000', current_date + 14,'Accurate entry and verification of customer records.','Fast typing, Microsoft Excel skills, attention to detail.','https://example.com/apply');

INSERT INTO public.scholarships (slug,title,organization,country,degree_level,funding_type,category,deadline,eligibility,requirements,benefits,instructions,application_link) VALUES
 ('mastercard-foundation-scholars','Mastercard Foundation Scholars Program','Mastercard Foundation','Rwanda / International','Undergraduate','Fully funded','Fully funded', current_date + 60,'Academically talented young people from economically disadvantaged backgrounds.','Academic transcripts, recommendation letters, personal statement.','Tuition, accommodation, stipend, laptop and mentorship.','Apply online through the partner university portal before the deadline.','https://example.com/apply'),
 ('daad-masters-scholarship','DAAD Masters Scholarship','DAAD','Germany','Master''s','Fully funded','Master''s', current_date + 90,'Graduates with at least two years of professional experience.','Degree certificate, CV, motivation letter, language certificate.','Monthly stipend, travel allowance, health insurance.','Prepare documents and submit via the DAAD portal.','https://example.com/apply'),
 ('chevening-scholarship','Chevening Scholarship','UK Government','United Kingdom','Master''s','Fully funded','Fully funded', current_date + 75,'Leadership potential and at least two years work experience.','Three course choices, references, English language requirement.','Full tuition, living allowance, flights.','Create a Chevening account and complete the online application.','https://example.com/apply'),
 ('short-course-digital-skills','Digital Skills Short Course Grant','ICT Chamber','Rwanda','Short courses','Partially funded','Short courses', current_date + 25,'Youth aged 18-30 living in Rwanda.','National ID, short motivation statement.','Covers 70% of the training fee.','Fill the online form and attend the selection interview.','https://example.com/apply');

INSERT INTO public.courses (slug,title,instructor,category,level,duration,description,image_url,price,is_free,lessons_count,rating) VALUES
 ('web-development-basics','Web Development from Zero','Eze Pro Developer','Web Development','Beginner','8 weeks','Learn HTML, CSS, JavaScript and build your first real website.','https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80',0,true,32,4.8),
 ('mobile-app-flutter','Mobile App Development with Flutter','Eze Pro Developer','Mobile App Development','Intermediate','10 weeks','Build Android apps from scratch and publish them to the Play Store.','https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',45000,false,40,4.7),
 ('microsoft-office-mastery','Microsoft Office Mastery','Eze Pro Developer','Microsoft Office','Beginner','4 weeks','Word, Excel, PowerPoint and Outlook skills employers actually ask for.','https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',20000,false,24,4.9),
 ('computer-basics','Computer Basics for Everyone','Eze Pro Developer','Computer Basics','Beginner','3 weeks','Start from switching on a computer to using the internet safely.','https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80',0,true,18,4.6),
 ('graphic-design-starter','Graphic Design Starter','Eze Pro Developer','Graphic Design','Beginner','5 weeks','Design logos, posters and social media graphics that look professional.','https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',30000,false,22,4.5),
 ('cybersecurity-awareness','Cybersecurity Awareness','Eze Pro Developer','Cybersecurity awareness','Beginner','2 weeks','Protect your accounts, data and business from common online attacks.','https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',0,true,12,4.8);

INSERT INTO public.blog_posts (slug,title,author,category,excerpt,content,image_url,tags) VALUES
 ('how-to-choose-a-laptop-in-rwanda','How to Choose a Laptop in Rwanda in 2026','Eze Pro Developer','Computer tips','A practical guide to picking a laptop that fits your work, your studies and your budget.','Buying a laptop is a big decision. Start with what you will actually do with it: writing documents and browsing needs far less power than video editing or software development.

For students, an 8GB RAM machine with an SSD is the sweet spot. For developers, aim for 16GB RAM. Always check the battery health when buying second-hand, and insist on a warranty or a trusted technician who can inspect it before you pay.

If you need help checking a machine before you buy, we offer diagnosis and setup services.','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80','{laptops,tips}'),
 ('free-ways-to-learn-programming','5 Free Ways to Start Learning Programming Today','Eze Pro Developer','Programming tutorials','You do not need money to start coding. You need a plan and consistency.','The hardest part of learning to code is not the code, it is staying consistent.

1. Pick one language and stick with it for three months.
2. Build small projects instead of only watching videos.
3. Read other people''s code.
4. Join a community where you can ask questions.
5. Teach what you learn, even to one friend.

Our free Web Development from Zero course follows exactly this path.','https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80','{programming,learning}'),
 ('writing-a-scholarship-motivation-letter','Writing a Motivation Letter That Wins Scholarships','Eze Pro Developer','Scholarship news','What selection committees actually look for in your motivation letter.','A motivation letter is not your CV in paragraphs. It is the story of why you, why this program, and why now.

Open with a concrete moment, not a generic sentence. Show impact with numbers where you can. Connect the program to a specific goal you already started working towards. End with what you will do after graduating.

We help students structure and review these letters through our Application Center.','https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80','{scholarships,applications}');

INSERT INTO public.testimonials (name,story,service_used,rating,is_approved,photo_url) VALUES
 ('Aline U.','They built our school website in two weeks and trained our staff to update it. Parents finally find information without calling us.','Website Development',5,true,'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'),
 ('Jean Bosco M.','My laptop was dead after a power surge. It was diagnosed and repaired the same day at a fair price.','Computer Repair',5,true,'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
 ('Claudine I.','I took the free web development course and got my first freelance client three months later.','Online Learning',5,true,'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80');

INSERT INTO public.faqs (question,answer,category,sort_order) VALUES
 ('How long does it take to build a website?','A simple business website takes 1-2 weeks. Larger platforms with dashboards and payments take 4-8 weeks depending on the features.','Website development',1),
 ('Do you repair laptops and printers?','Yes. We diagnose and repair laptops, desktops and printers, including hardware and software problems.','Computer repair',2),
 ('Are the online courses really free?','Some courses are completely free and others are paid. Every course clearly shows a Free or Paid label.','Online courses',3),
 ('Can you help me apply for a scholarship?','Yes. Through the Application Center we help with CVs, cover letters, motivation letters and the application process itself.','Applications',4),
 ('Do you help with Microsoft Office installation?','Yes, we install, configure and update Microsoft Office and advise on proper licensing.','Microsoft Office support',5),
 ('How can I contact you quickly?','Call 0793054502, message us on WhatsApp at +250 793 054 502, or email ezeprodeveloper@gmail.com.','Contact and support',6);