import { Link } from 'react-router-dom'
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa'
import { MdLocationOn, MdPhone, MdEmail, MdAccessTime } from 'react-icons/md'

const Footer = () => {
  return (
    <footer className="bg-secondary text-gray-400 relative overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-black text-sm">QB</span>
              </div>
              <span className="text-xl font-black text-white">
                Quick<span className="text-primary">Bite</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 mb-5">
              Fresh, fast, and affordable food delivered straight to your door. Restaurant-quality meals from the comfort of your home.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaInstagram, href: '#', label: 'Instagram' },
                { icon: FaTwitter, href: '#', label: 'Twitter' },
                { icon: FaFacebook, href: '#', label: 'Facebook' },
                { icon: FaYoutube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-xl flex items-center justify-center text-gray-500 transition-all duration-200 hover:scale-110"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/menu', label: 'Our Menu' },
                { to: '/cart', label: 'Cart' },
                { to: '/dashboard', label: 'My Orders' },
                { to: '/login', label: 'Sign In' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-500 hover:text-primary transition-colors duration-150 hover:translate-x-1 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">Contact Us</h3>
            <ul className="space-y-3">
              {[
                { icon: MdLocationOn, text: '123 Food Street, Bengaluru 560001' },
                { icon: MdPhone, text: '+91 98765 43210' },
                { icon: MdEmail, text: 'hello@quickbite.com' },
                { icon: MdAccessTime, text: 'Mon–Sun: 9:00 AM – 11:00 PM' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5">
                  <Icon size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-500 leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide uppercase">Stay Updated</h3>
            <p className="text-sm text-gray-500 mb-4">Get exclusive offers and new menu updates straight to your inbox.</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
              />
              <button
                type="submit"
                className="w-full btn-primary py-3 text-sm rounded-2xl"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} QuickBite. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-600">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
