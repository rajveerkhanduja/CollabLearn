import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <svg
                  className="h-8 w-8 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 13.25L19.25 9L12 13.25L4.75 9L12 13.25ZM12 13.25V20.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  EduCollab
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl md:text-7xl">
              <span className="block">Revolutionize Your</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Learning Experience
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              EduCollab is a next-generation collaborative learning platform
              that connects students, facilitates knowledge sharing, and
              enhances the educational experience through interactive tools.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="ml-4 px-8 py-3 text-indigo-600 font-medium bg-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gradient-to-b from-indigo-50 to-white text-lg font-medium text-gray-900">
                  Features
                </span>
              </div>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Collaborative Study Groups
                  </h3>
                  <p className="text-gray-600">
                    Create or join study groups for real-time collaboration with
                    peers. Share resources, discuss topics, and grow together.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Interactive Quizzes
                  </h3>
                  <p className="text-gray-600">
                    Test your knowledge with interactive quizzes. Track your
                    progress, retake quizzes to improve scores, and compete with
                    peers.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Resource Sharing
                  </h3>
                  <p className="text-gray-600">
                    Share study materials, notes, and resources with your peers.
                    Access a growing library of educational content.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Project Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              About Our Project
            </h2>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="prose prose-indigo mx-auto">
                <p className="text-lg text-gray-700 leading-relaxed">
                  EduCollab is an innovative educational platform designed to
                  revolutionize the way students collaborate and learn together.
                  Our mission is to create a comprehensive, user-friendly
                  environment that facilitates knowledge sharing and educational
                  growth.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed mt-4">
                  The platform offers various features such as collaborative
                  study groups, real-time messaging, interactive quizzes,
                  resource sharing, and performance tracking. Students can join
                  subject-specific groups, participate in discussions, take
                  quizzes to test their knowledge, and share valuable study
                  materials.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed mt-4">
                  Administrators have powerful tools to manage users, create
                  educational content, monitor system usage, and ensure a
                  productive learning environment. Our goal is to create a space
                  where education becomes more engaging, collaborative, and
                  effective.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Meet the Creators
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex justify-center items-center">
                  <div className="rounded-full w-32 h-32 bg-white flex items-center justify-center shadow-lg">
                    {/* Placeholder for Suraj's photo - replace with actual photo */}
                    <span className="text-4xl font-bold text-indigo-600">
                      SM
                    </span>
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Suraj Mandal
                  </h3>
                  <p className="text-indigo-600 font-medium mb-4">
                    Lead Developer
                  </p>
                  <p className="text-gray-600">
                    Computer Science enthusiast with expertise in full-stack
                    development. Passionate about creating innovative
                    educational technologies that make learning more accessible
                    and engaging for everyone.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-gradient-to-br from-purple-500 to-indigo-600 p-6 flex justify-center items-center">
                  <div className="rounded-full w-32 h-32 bg-white flex items-center justify-center shadow-lg">
                    {/* Placeholder for Rajveer's photo - replace with actual photo */}
                    <span className="text-4xl font-bold text-purple-600">
                      RS
                    </span>
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Rajveer Singh
                  </h3>
                  <p className="text-purple-600 font-medium mb-4">
                    UI/UX Designer
                  </p>
                  <p className="text-gray-600">
                    Creative designer with a strong focus on user experience.
                    Dedicated to crafting beautiful, intuitive interfaces that
                    enhance the learning experience and make education more
                    accessible and enjoyable.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              What Students Say
            </h2>
            <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
              Discover how EduCollab is transforming the educational experience
              for students around the world.
            </p>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">A</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Alex Johnson</h4>
                    <p className="text-sm text-gray-500">
                      Computer Science Student
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "EduCollab has completely transformed how I study. The
                  collaboration tools make group projects much more efficient,
                  and the quizzes help me prepare for exams."
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">S</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Sarah Williams</h4>
                    <p className="text-sm text-gray-500">Biology Major</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "I love how easy it is to share study materials with my
                  classmates. The quiz feature lets me test my knowledge and
                  identify areas where I need more work."
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">M</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Michael Chen</h4>
                    <p className="text-sm text-gray-500">Engineering Student</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The real-time collaboration features are game-changing. Being
                  able to work with peers remotely while discussing complex
                  topics has improved my understanding significantly."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of students already using EduCollab to enhance their
            education
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-indigo-600 font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 text-indigo-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 13.25L19.25 9L12 13.25L4.75 9L12 13.25ZM12 13.25V20.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="ml-2 text-2xl font-bold">EduCollab</span>
              </div>
              <p className="mt-2 text-gray-400 max-w-md">
                A next-generation collaborative learning platform that enhances
                education through technology.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-4 mb-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.335 18.339H15.67v-4.177c0-.996-.02-2.278-1.39-2.278-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.715zM7.003 8.575a1.546 1.546 0 01-1.548-1.549 1.548 1.548 0 111.547 1.549zm1.336 9.764H5.666V9.75H8.34v8.589zM19.67 3H4.329C3.593 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.338C20.4 21 21 20.42 21 19.703V4.297C21 3.58 20.4 3 19.666 3h.003z" />
                  </svg>
                </a>
              </div>
              <p className="text-gray-400">
                © 2023 EduCollab. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
