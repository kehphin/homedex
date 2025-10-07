const ContactSection = () => {
    return (
      <section className="bg-base-300 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap -mx-4">
            {/* Contact Form */}
            <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <form className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input type="text" placeholder="Your Name" className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input type="email" placeholder="your@email.com" className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Message</span>
                  </label>
                  <textarea className="textarea textarea-bordered h-24" placeholder="Your message here..."></textarea>
                </div>
                <button className="btn btn-primary">Send Message</button>
              </form>
            </div>
            
            {/* Quick Links and Info */}
            <div className="w-full lg:w-1/2 px-4">
              <h2 className="text-3xl font-bold mb-6">Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Company</h3>
                  <ul className="space-y-2">
                    <li><a href="/" className="link link-hover">About Us</a></li>
                    <li><a href="/" className="link link-hover">Careers</a></li>
                    <li><a href="/" className="link link-hover">Press</a></li>
                    <li><a href="/" className="link link-hover">Blog</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Support</h3>
                  <ul className="space-y-2">
                    <li><a href="/" className="link link-hover">Help Center</a></li>
                    <li><a href="/" className="link link-hover">Documentation</a></li>
                    <li><a href="/" className="link link-hover">API Status</a></li>
                    <li><a href="/" className="link link-hover">Community</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="footer footer-center p-10 bg-base-300 text-base-content rounded">
          <div className="grid grid-flow-col gap-4">
            <a href='/' className="link link-hover">Terms of Service</a> 
            <a href='/' className="link link-hover">Privacy Policy</a> 
            <a href='/' className="link link-hover">Cookie Policy</a>
          </div> 
          <div>
            <div className="grid grid-flow-col gap-4">
              <a href='/'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a> 
              <a href='/'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a> 
              <a href='/'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
            </div>
          </div> 
          <div>
            <p>Copyright © 2024 - All rights reserved by ACME Industries Ltd</p>
          </div>
        </footer>
      </section>
    );
  };
  
  export default ContactSection;