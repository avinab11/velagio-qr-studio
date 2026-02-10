import { Link } from 'react-router-dom';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogPage: React.FC = () => {
  const posts = [
    {
      title: "How to Use QR Codes Effectively for Your Business",
      slug: "how-to-use-qr-codes-for-business",
      excerpt: "QR codes have become powerful marketing tools. Learn how to bridge the gap between offline and online experiences instantly with zero friction for customers.",
      date: "Feb 12, 2026",
      author: "Marketing Expert",
      category: "Guide"
    },
    {
      title: "The Future of QR Codes in 2026",
      slug: "future-of-qr-codes-2026",
      excerpt: "As we move into 2026, QR codes are becoming smarter, more integrated, and more essential. Explore emerging trends and how businesses can stay ahead.",
      date: "Feb 10, 2026",
      author: "Design Team",
      category: "Trends"
    },
    {
      title: "Why Static QR Codes Are Better for Print",
      slug: "why-static-qr-codes-are-better-for-print",
      excerpt: "Static QR codes are the gold standard for long-term print materials. Discover why permanence, reliability, and cost-effectiveness make them the superior choice.",
      date: "Feb 08, 2026",
      author: "Print Specialist",
      category: "Tutorial"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 md:py-20 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-[10px] md:text-xs">
            <BookOpen className="w-3.5 h-3.5 md:w-4 h-4" />
            <span>Our Blog</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Latest Insights</h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl">
            Explore our articles on design, marketing, and the technical side of QR code technology.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post, i) => (
          <article key={i} className="apple-card group hover:scale-[1.02] transition-all duration-300 p-0 overflow-hidden flex flex-col h-full bg-card">
            <Link to={`/blog/${post.slug}`} className="block">
              <div className="h-40 md:h-48 bg-muted animate-pulse group-hover:bg-muted/80 transition-colors" />
            </Link>
            <div className="p-6 md:p-8 flex flex-col flex-1">
              <div className="flex items-center gap-4 mb-3 md:mb-4">
                <span className="px-3 py-0.5 md:py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {post.category}
                </span>
              </div>
              <Link to={`/blog/${post.slug}`}>
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {post.title}
                </h2>
              </Link>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-6 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="mt-auto pt-4 md:pt-6 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 md:mt-20 apple-card p-8 md:p-12 bg-black text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold">Subscribe to our newsletter</h2>
          <p className="text-white/60 text-sm md:text-base">Get the latest design tips and updates directly in your inbox.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full md:w-64 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button className="rounded-full px-8 h-11 md:h-12 bg-white text-black hover:bg-white/90 font-bold">Join</Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
