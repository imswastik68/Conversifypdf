"use client"

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { BookOpen, Brain, Zap, CheckCircle2, FileText, Sparkles, MessageSquare, Star, ArrowRight, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { testimonials } from "@/data/landing";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Link from "next/link";


export default function Home() {

  const {user} = useUser();
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    const CheckUser = async () => {
      await createUser({
        email: user?.primaryEmailAddress?.emailAddress,
        userName: user?.fullName,
        imageUrl: user?.imageUrl
      });
    };

    if (user) {
      CheckUser();
    }
  }, [user, createUser]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-white to-blue-100 ">
      
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-red-100 p-3 rounded-full">
                  <Zap className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold">The fastest on the market</h3>
              <p className="mt-2 text-gray-600">Process PDFs in seconds with our optimized AI engine</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Brain className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold">AI-Powered Insights</h3>
              <p className="mt-2 text-gray-600">Get intelligent summaries and key points automatically</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold">The most loved</h3>
              <p className="mt-2 text-gray-600">Trusted by thousands of students and professionals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold">Powerful Features for Smart Note-Taking</h2>
            <p className="mt-4 text-xl text-gray-600">Everything you need to transform your PDFs into actionable insights</p>
          </div>
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="h-6 w-6 text-blue-500" />,
                title: "Smart PDF Processing",
                description: "Upload any PDF and get instant access to smart text recognition and processing"
              },
              {
                icon: <Brain className="h-6 w-6 text-purple-500" />,
                title: "AI-Powered Summaries",
                description: "Get automatic summaries of key points and main ideas from your documents"
              },
              {
                icon: <Sparkles className="h-6 w-6 text-yellow-500" />,
                title: "Highlight & Annotate",
                description: "Add highlights, notes, and annotations directly on your PDFs"
              },
              {
                icon: <MessageSquare className="h-6 w-6 text-green-500" />,
                title: "Collaborative Notes",
                description: "Share and collaborate on notes with team members in real-time"
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 text-red-500" />,
                title: "Task Extraction",
                description: "Automatically identify and extract action items and tasks"
              },
              {
                icon: <Star className="h-6 w-6 text-orange-500" />,
                title: "Custom Organization",
                description: "Organize your notes with tags, folders, and smart categories"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gray-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div id="solution" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Transform Your PDF Workflow</h2>
              <div className="space-y-6">
                {[
                  "Upload any PDF and get instant AI-powered analysis",
                  "Extract key insights and summaries automatically",
                  "Collaborate with team members in real-time",
                  "Organize and access your notes from anywhere"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-lg text-gray-700">{item}</p>
                  </div>
                ))}
                <div className="mt-8">
                <Link href="/dashboard">
                    <Button className="text-lg px-8">
                      Try it free <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative h-[600px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80"
                alt="PDF Note-taking Solution"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Loved by Thousands of Users</h2>
            <p className="mt-4 text-xl text-gray-600">See what our users have to say about PDFNote AI</p>
          </div>
          <div className="relative px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <div>
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-700">{testimonial.quote}</p>
                      <div className="mt-4 flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold">PDFNote AI</span>
              </div>
              <p className="text-gray-400">
                Transform your PDF documents into intelligent notes with AI-powered insights.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#solution" className="text-gray-400 hover:text-white transition-colors">Solution</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-5 w-5" />
                  <span>contact@conversifypdf.ai</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Phone className="h-5 w-5" />
                  <span>+91 720554XXXX</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-5 w-5" />
                  <span>NIT Rkl, Rkl Tech City</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 ConversifyPDF All rights reserved.
              </p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
