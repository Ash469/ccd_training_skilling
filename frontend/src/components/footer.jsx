import React from 'react';
import { FaLinkedin, FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = ({ darkMode }) => {
  return (
    <footer
      className={`p-6 mt-10 w-full border-t backdrop-blur ${darkMode
        ? 'bg-gray-900/95 border-gray-600'
        : 'bg-white/95 border-gray-200'
        }`}
    >
      <div className="container mx-auto px-4 pt-6">
        {/* Top Footer Content */}
        <div
          className={`border-b pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-300'
            }`}
        >

          <div className="flex flex-col md:flex-row justify-evenly items-center md:items-start text-center md:text-left gap-8">

            {/* CCD Logo and Social */}
            <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="CCD Logo" className="h-10 w-10" />
                <span className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  CCD, IIT Guwahati
                </span>
              </div>
              <div className="flex items-center self-center gap-4">

                <a
                  href="mailto:ccd@iitg.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaEnvelope
                    size={20}
                    style={{ color: darkMode ? 'white' : '#1a202c' }}
                  />
                </a>

                <a
                  href="https://www.linkedin.com/in/ccdiitg/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin size={20} style={{ color: '#0A66C2' }} />
                </a>
                <a
                  href="https://www.instagram.com/ccd.iitg/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={20} style={{ color: '#E1306C' }} />
                </a>
              </div>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                TEL: +91-361-258-2175
              </span>
            </div>

            {/* For Companies */}
            <div>
              <h2 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>For Companies</h2>
              <ul className="text-sm flex flex-col gap-2">
                <li>
                  <a
                    href="https://iitg.ac.in/ccd/brochures.html"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Placement Process & Brochures
                  </a>
                </li>
                <li>
                  <a
                    href="https://iitg.ac.in/intern/auth/login"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Internship Portal
                  </a>
                </li>
              </ul>
            </div>

            {/* For Students */}
            <div>
              <h2 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>For Students</h2>
              <ul className="text-sm flex flex-col gap-2">
                <li>
                  <a
                    href="https://iitg.ac.in/ccd/for_students.html"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Resume Builder & Resources
                  </a>
                </li>
                <li>
                  <a
                    href="https://iitg.ac.in/intern/auth/login/"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Internship Portal
                  </a>

                </li>
                <li>
                  <a
                    href="https://iitg.ac.in/placements/auth/login/"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Placement Portal
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div
          className={`pt-4 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
        >
          © 2025 • Developed by Technical Team CCD IITG
        </div>
      </div>
    </footer>
  );
};

export default Footer;
