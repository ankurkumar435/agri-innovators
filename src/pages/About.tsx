import React from 'react';
import { ArrowLeft, Leaf, Users, Target, Award, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Leaf,
      title: 'Sustainable Farming',
      description: 'Promoting eco-friendly agricultural practices for a greener future.'
    },
    {
      icon: TrendingUp,
      title: 'Increased Yield',
      description: 'AI-powered recommendations to maximize your crop production.'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Advanced weather monitoring and pest prediction systems.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Agricultural Scientist',
      description: 'Leading expert in sustainable farming practices with 15+ years of experience.'
    },
    {
      name: 'Michael Chen',
      role: 'AI Technology Lead',
      description: 'Specializing in machine learning applications for agricultural optimization.'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Field Operations Manager',
      description: 'Coordinating field testing and farmer feedback integration.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-nature text-white p-4">
        <div className="flex items-center gap-3 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">About SmartFarm</h1>
        </div>
        <p className="text-sm opacity-90">Revolutionizing agriculture with AI technology</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Mission Section */}
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-nature rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To empower farmers worldwide with cutting-edge AI technology and data-driven insights, 
              helping them increase productivity, reduce environmental impact, and build sustainable 
              agricultural practices for future generations.
            </p>
          </div>
        </Card>

        {/* Features */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">What We Offer</h2>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-nature-primary rounded-full flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 text-center">Our Impact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-nature-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">Farmers Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-nature-secondary">25%</div>
              <div className="text-sm text-muted-foreground">Avg. Yield Increase</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-earth">50+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky">95%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </Card>

        {/* Team */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Meet Our Team</h2>
          <div className="space-y-3">
            {team.map((member, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-earth rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-nature-primary font-medium mb-1">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Awards */}
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-earth rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Recognition</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🏆 2023 AgTech Innovation Award</p>
              <p>🌟 Best Sustainable Technology Solution</p>
              <p>🎖️ Global Impact in Agriculture Recognition</p>
            </div>
          </div>
        </Card>

        {/* Contact CTA */}
        <Card className="p-6 bg-gradient-nature text-white">
          <div className="text-center">
            <h2 className="text-lg font-bold mb-2">Join the Revolution</h2>
            <p className="text-sm opacity-90 mb-4">
              Ready to transform your farming practices with AI-powered insights?
            </p>
            <Button 
              variant="secondary"
              onClick={() => navigate('/contact')}
              className="bg-white text-nature-primary hover:bg-white/90"
            >
              Get Started Today
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;