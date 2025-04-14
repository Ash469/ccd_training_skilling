import { Link } from "react-router-dom"
import { CalendarClock, Users, Bell } from "lucide-react"
import Footer from "../components/footer"
import Navbar from "../components/navbar"

export default function Home({ darkMode, toggleDarkMode }) {
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className={`py-16 ${
          darkMode 
            ? 'bg-gray-800' 
            : 'bg-gray-50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold">
                    <span className={darkMode ? 'text-purple-400' : 'text-purple-600'}>Stay Updated</span> with{" "}
                    <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>Training and Skilling</span>
                  </h1>
                  <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Never miss an opportunity to learn and grow. Register for events, workshops, and seminars organized
                    by the Training and Skilling Team.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/events">
                    <button className={`flex items-center px-6 py-3 rounded-lg ${
                      darkMode 
                        ? 'bg-purple-500 hover:bg-purple-600' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white font-medium`}>
                      <CalendarClock className="h-5 w-5 mr-2" />
                      Browse Events
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className={`flex items-center px-6 py-3 rounded-lg border-2 ${
                      darkMode 
                        ? 'border-purple-400 text-purple-400 hover:bg-purple-900/30' 
                        : 'border-purple-600 text-purple-600 hover:bg-purple-50'
                    } font-medium`}>
                      <Users className="h-5 w-5 mr-2" />
                      Create Account
                    </button>
                  </Link>
                </div>
              </div>
              {/* Right Column */}
              <div className={`rounded-xl p-8 ${
                darkMode 
                  ? 'bg-gray-700 shadow-gray-900/30' 
                  : 'bg-white shadow-lg'
              }`}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <CalendarClock className={`h-16 w-16 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h2 className="text-2xl font-bold">Upcoming Events</h2>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Register for the latest workshops, seminars, and training sessions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <FeatureSection darkMode={darkMode} />
        </section>
      </main>
      <Footer darkMode={darkMode} />
    </div>
  )
}

function FeatureSection({ darkMode }) {
  const features = [
    {
      icon: <CalendarClock className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />,
      title: "Event Calendar",
      description: "Browse and register for upcoming events, workshops, and seminars"
    },
    {
      icon: <Bell className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />,
      title: "Email Notifications",
      description: "Get notified about new events and updates via email"
    },
    {
      icon: <Users className={`h-8 w-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />,
      title: "Admin Portal",
      description: "Dedicated portal for Training and Skilling Team to manage events"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold">Features</h2>
          <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Everything you need to stay updated with college events
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              desc={feature.description}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc, darkMode }) {
  return (
    <div className={`p-6 rounded-xl transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800 hover:bg-gray-700' 
        : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className={`rounded-full p-3 inline-block ${
        darkMode ? 'bg-gray-700' : 'bg-white'
      }`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
        {desc}
      </p>
    </div>
  )
}
