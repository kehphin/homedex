const TestimonialsSection = () => {
    const testimonials = [
      {
        quote: "This platform has completely transformed how our team collaborates. We've seen a 40% increase in productivity since we started using it.",
        author: "Sarah Johnson",
        role: "Product Manager at TechCorp",
        avatar: "https://picsum.photos/id/237/200/300"
      },
      {
        quote: "The intuitive interface and powerful features make this the best productivity tool we've ever used. It's been a game-changer for our startup.",
        author: "Alex Chen",
        role: "CEO of InnovateTech",
        avatar: "https://picsum.photos/seed/picsum/200/300"
      },
      {
        quote: "I can't imagine running our projects without this tool now. The real-time collaboration features have made our remote work so much easier.",
        author: "Emily Rodriguez",
        role: "Team Lead at GlobalSolutions",
        avatar: "https://picsum.photos/200/300?grayscale"
      }
    ];
  
    return (
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Clients Say
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-base-100 p-6 rounded-lg border border-base-300">
                <p className="text-base-content mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-14 h-14 rounded-full" />
                  <div className="ml-4">
                    <p className="font-semibold text-base-content">{testimonial.author}</p>
                    <p className="text-sm text-base-content opacity-70">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="btn btn-primary btn-outline rounded-full px-8">
              Read More Testimonials
            </button>
          </div>
        </div>
      </section>
    );
  };

  export default TestimonialsSection;
  