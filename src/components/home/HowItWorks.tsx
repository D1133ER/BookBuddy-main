import { BookOpen, RefreshCw, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { motion } from 'framer-motion';

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StepCard = ({
  icon = <BookOpen />,
  title = 'Step Title',
  description = 'Step description goes here',
}: StepCardProps) => {
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }} className="h-full">
      <Card className="h-full bg-white shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <CardContent className="flex flex-col items-center text-center p-4 sm:p-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 sm:mb-4">
            {icon}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{title}</h3>
          <p className="text-sm sm:text-base text-slate-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface HowItWorksProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const HowItWorks = ({
  title = 'How It Works',
  subtitle = 'Exchange books with your community in three simple steps',
  className = '',
}: HowItWorksProps) => {
  const steps = [
    {
      icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: 'List Your Books',
      description:
        "Add books from your collection that you're willing to share or exchange with others.",
    },
    {
      icon: <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: 'Browse & Request',
      description:
        'Discover books from other community members and request to borrow or exchange them.',
    },
    {
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: 'Exchange & Connect',
      description: 'Meet with community members to exchange books and build your reading network.',
    },
  ];

  return (
    <section className={`bg-slate-50 px-4 py-8 sm:py-12 md:py-16 ${className}`}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center sm:mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">{title}</h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">{subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-full">
                <StepCard icon={step.icon} title={step.title} description={step.description} />
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300">
                    <div className="absolute -right-1 -top-1 w-3 h-3 border-t-2 border-r-2 border-gray-300 transform rotate-45"></div>
                  </div>
                )}
              </div>
              <div className="md:hidden text-2xl sm:text-3xl font-bold text-gray-300 my-1 sm:my-2">
                {index < steps.length - 1 && '↓'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
