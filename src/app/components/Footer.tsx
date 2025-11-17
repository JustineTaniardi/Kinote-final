import Image from "next/image";

export default function Footer() {
  return (
    <footer
      id="about"
      className="w-full bg-[#F9FAFB] text-gray-700 pt-16 pb-10 px-6 border-t border-gray-200"
    >
      {/* Main */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-10 items-start">
        {/* Left */}
        <div className="col-span-2 flex flex-col justify-start">
          {/* Logo */}
          <div className="flex items-center mb-4">
            <Image
              src="/img/landing-page/header_logo_kinote.png"
              alt="Kinote Logo"
              width={180}
              height={60}
              className="object-contain"
            />
          </div>

          {/* Desc */}
          <p className="text-[#1F2937] text-base font-medium mb-4">
            Note It Down With Kinote
          </p>

          {/* Sosmed */}
          <div className="flex gap-5 items-center">
            <a
              href="https://www.instagram.com/justinetaniardi/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition"
            >
              <Image
                src="/icons/instagram.png"
                alt="Instagram"
                width={30}
                height={30}
                className="object-contain"
              />
            </a>
            <a
              href="https://www.linkedin.com/in/justine-taniardi/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition"
            >
              <Image
                src="/icons/linkedin.png"
                alt="LinkedIn"
                width={30}
                height={30}
                className="object-contain"
              />
            </a>
            <a
              href="https://wa.me/6281258126007"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition"
            >
              <Image
                src="/icons/whatsapp.png"
                alt="WhatsApp"
                width={30}
                height={30}
                className="object-contain"
              />
            </a>
          </div>
        </div>

        {/* About */}
        <div className="flex flex-col justify-start">
          <h4 className="font-semibold text-base mb-3">About us</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-gray-800 transition">Mission</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Our team</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Awards</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Testimonials</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Privacy policy</a></li>
          </ul>
        </div>

        {/* Services */}
        <div className="flex flex-col justify-start">
          <h4 className="font-semibold text-base mb-3">Services</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-gray-800 transition">Web design</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Web development</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Mobile design</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">UI/UX design</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Branding design</a></li>
          </ul>
        </div>

        {/* Portfolio */}
        <div className="flex flex-col justify-start">
          <h4 className="font-semibold text-base mb-3">Portfolio</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-gray-800 transition">Corporate websites</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">E-commerce</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Mobile apps</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Landing pages</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">UI/UX projects</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col justify-start">
          <h4 className="font-semibold text-base mb-3">Contact us</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-gray-800 transition">Information</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Request a quote</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Consultation</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Help center</a></li>
            <li><a href="#" className="hover:text-gray-800 transition">Terms and conditions</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-12 pt-6 text-center text-gray-400 text-sm border-t border-gray-200">
        © {new Date().getFullYear()} KINOTE. All rights reserved.
      </div>
    </footer>
  );
}
