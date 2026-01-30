import { Globe, Users, Shield } from 'lucide-react';

const AuthFeatures = () => {
  const features = [
    {
      icon: Globe,
      title: 'Global Assessments',
      description: 'Access 10+ programming languages'
    },
    {
      icon: Users,
      title: 'Team Organizations',
      description: 'Custom content and analytics'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Enterprise-grade security'
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-[#2a2a2e]">
      <div className="grid grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-amber-500" />
              </div>
              <h6 className="text-sm font-medium text-[#f5f5f4] mb-1">
                {feature.title}
              </h6>
              <p className="text-xs text-[#6b6b70]">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuthFeatures;
