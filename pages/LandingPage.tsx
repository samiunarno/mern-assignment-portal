
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AdminShieldIcon, MonitorChartIcon, StudentUploadIcon, ChevronDownIcon, QuoteIcon } from '../components/icons/Icons';

const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const [entries, setEntries] = React.useState<IntersectionObserverEntry[]>([]);
  const observer = React.useRef<IntersectionObserver | null>(null);

  React.useEffect(() => {
    observer.current = new IntersectionObserver((observedEntries) => {
      observedEntries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
        }
      });
    }, options);

    return () => observer.current?.disconnect();
  }, [options]);

  return observer;
};

const FAQItem: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b py-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left text-lg font-semibold text-foreground focus:outline-none">
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                <p className="text-muted-foreground">{children}</p>
            </div>
        </div>
    );
};


const LandingPage: React.FC = () => {
  const observer = useIntersectionObserver({ threshold: 0.1 });
  const animatedElements = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    animatedElements.current.forEach(el => {
      if (el && observer.current) {
        observer.current.observe(el);
      }
    });
  }, [observer]);
  
  const addToRefs = (el: HTMLElement | null) => {
    if (el && !animatedElements.current.includes(el)) {
        animatedElements.current.push(el);
    }
  };
  
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center overflow-hidden animated-gradient">
          <div className="z-20 p-4">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl animate-text-focus-in">
              Streamline Your Assignment Workflow
            </h1>
            <p className="mt-6 text-lg max-w-2xl mx-auto leading-8 text-gray-200 animate-text-focus-in" style={{ animationDelay: '0.5s' }}>
              A robust platform for students, monitors, and administrators. Manage submissions, enforce deadlines, and maintain academic integrity with ease.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-slide-in-bottom" style={{ animationDelay: '0.8s' }}>
              <Link to="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 py-3 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus-visible:outline-none transition-transform transform hover:scale-105">
                Get started
              </Link>
              <a href="#features" className="text-sm font-semibold leading-6 text-white transition-colors hover:text-gray-300">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32 bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div ref={addToRefs} style={{ opacity: 0 }} className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-secondary-foreground text-primary">Everything You Need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Tailored for Every Role</p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Our platform provides specialized tools and dashboards for Admins, Monitors, and Students to ensure a smooth and efficient process for everyone.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  { Icon: AdminShieldIcon, title: 'For Admins', description: 'Full control over user management. Approve new accounts, assign roles, and ensure the platform runs securely and smoothly.' },
                  { Icon: MonitorChartIcon, title: 'For Monitors', description: 'Create, edit, and delete assignments. View all student submissions in one place and receive them directly via email.' },
                  { Icon: StudentUploadIcon, title: 'For Students', description: 'View available assignments, get real-time deadline countdowns, and submit work with strict filename and type validation.' }
                ].map((feature, i) => (
                  <div key={i} ref={addToRefs} style={{ opacity: 0 }} className="group bg-card p-8 rounded-lg shadow-sm transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-2 border hover:border-primary/50">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-300 group-hover:bg-secondary group-hover:text-secondary-foreground">
                          <feature.Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-6 text-xl font-semibold leading-7 text-card-foreground">{feature.title}</h3>
                      <p className="mt-4 text-base leading-7 text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-24 sm:py-32 bg-secondary/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div ref={addToRefs} style={{ opacity: 0 }} className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">Simple & Efficient</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">A Seamless Workflow</p>
                </div>
                <div className="relative mt-16">
                    <div className="absolute left-1/2 top-0 h-full w-px bg-border hidden md:block"></div>
                    {[
                        { title: 'Register & Wait', description: 'Create your account. An administrator will review and approve it shortly, ensuring a secure user base.' },
                        { title: 'Manage & Monitor', description: 'Monitors create assignments with clear deadlines, while Admins oversee the platform\'s health and user roles.' },
                        { title: 'Submit & Succeed', description: 'Students submit their work before the deadline. The system validates files, ensuring compliance and order.' }
                    ].map((step, i) => (
                        <div key={i} ref={addToRefs} style={{ opacity: 0 }} className={`flex md:items-center mb-12 md:mb-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                            <div className="hidden md:flex w-1/2"></div>
                            <div className="w-full md:w-1/2 md:px-8">
                                <div className="bg-card p-8 rounded-lg shadow-sm border">
                                    <div className="text-primary font-black text-4xl">0{i + 1}</div>
                                    <h3 className="mt-4 text-xl font-semibold text-card-foreground">{step.title}</h3>
                                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                            <div className={`absolute left-1/2 -ml-3 h-6 w-6 rounded-full ${i === 0 ? 'bg-secondary' : 'bg-primary'} hidden md:block ring-4 ring-background`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Technology Stack Section */}
        <section className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div ref={addToRefs} style={{ opacity: 0 }} className="mx-auto max-w-2xl text-center">
                  <h2 className="text-base font-semibold leading-7 text-primary">Secure & Reliable</h2>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Powered by Modern Technology</p>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                      We use a proven, industry-standard technology stack to ensure your data is safe and the platform is always available.
                  </p>
              </div>
              <div ref={addToRefs} style={{ opacity: 0 }} className="mx-auto mt-16 grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-3 lg:mx-0 lg:max-w-none">
                  {['React', 'Node.js', 'Express', 'MongoDB', 'JSON Web Token', 'Nodemailer'].map((tech) => (
                      <div key={tech} className="text-center bg-card border rounded-lg p-6 transition-transform hover:scale-105">
                          <p className="text-lg font-semibold text-foreground">{tech}</p>
                      </div>
                  ))}
              </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-secondary/20 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div ref={addToRefs} style={{ opacity: 0 }} className="mx-auto max-w-2xl text-center">
                  <h2 className="text-base font-semibold leading-7 text-primary">Trusted by Users</h2>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What Our Users Say</p>
              </div>
              <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                  {[
                      { quote: "Managing users and approvals has never been easier. The dashboard gives me a complete overview at a glance.", name: "Jane Doe", role: "Administrator" },
                      { quote: "Creating assignments and tracking submissions is incredibly streamlined. The email integration saves me so much time.", name: "John Smith", role: "Course Monitor" },
                      { quote: "The clear deadlines and easy upload process reduce my stress. I always know what's due and when.", name: "Alex Ray", role: "Student" },
                  ].map((testimonial, i) => (
                      <div key={i} ref={addToRefs} style={{ opacity: 0 }} className="flex flex-col bg-card p-8 rounded-lg shadow-sm border">
                          <div className="flex-grow">
                              <QuoteIcon className="h-8 w-8 text-primary mb-4" />
                              <p className="text-muted-foreground">"{testimonial.quote}"</p>
                          </div>
                          <div className="mt-6 pt-6 border-t">
                              <p className="font-semibold text-foreground">{testimonial.name}</p>
                              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div ref={addToRefs} style={{ opacity: 0 }} className="mx-auto max-w-2xl text-center">
                  <h2 className="text-base font-semibold leading-7 text-primary">Have Questions?</h2>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Frequently Asked Questions</p>
              </div>
              <div ref={addToRefs} style={{ opacity: 0 }} className="mx-auto mt-16 max-w-3xl">
                  <FAQItem title="How long does account approval take?">
                      Account approval is handled by administrators and typically takes less than 24 hours. You will be able to log in once your account is approved.
                  </FAQItem>
                  <FAQItem title="What file formats are accepted for submissions?">
                      Currently, we only accept PDF files (`.pdf`) to maintain a consistent format for all submissions. Please ensure your file is in this format before uploading.
                  </FAQItem>
                   <FAQItem title="What is the file naming convention?">
                      Your filename must be your Chinese name followed by the `.pdf` extension. For example: `王小明.pdf`. No other characters, numbers, or spaces are allowed.
                  </FAQItem>
                  <FAQItem title="Can I resubmit my assignment?">
                      The system allows only one submission per assignment. Please double-check your work before uploading, as you will not be able to replace the file once it's submitted.
                  </FAQItem>
              </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div ref={addToRefs} style={{ opacity: 0 }} className="relative isolate overflow-hidden bg-card border px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
                    <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Ready to simplify your assignments?
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                        Join now and experience a smarter way to manage academic work, from submission to collection.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link to="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-6 py-3 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform transform hover:scale-105">
                            Register Now
                        </Link>
                    </div>
                    <svg viewBox="0 0 1024 1024" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]" aria-hidden="true">
                        <circle cx="512" cy="512" r="512" fill="url(#8d958450-c69f-4251-94bc-4e091a323369)" fillOpacity="0.7"></circle>
                        <defs>
                        <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
                            <stop stopColor="hsl(var(--secondary))"></stop>
                            <stop offset="1" stopColor="hsl(var(--primary))"></stop>
                        </radialGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
