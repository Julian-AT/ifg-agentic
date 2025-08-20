import { Suspense, ComponentType } from 'react';

interface LazyIconProps {
  fallback?: ComponentType;
  [key: string]: any;
}

// Fallback icon component
const FallbackIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.5 }}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

// Wrapper component for lazy-loaded icons
export const LazyIcon = ({ 
  component: IconComponent, 
  fallback: Fallback = FallbackIcon,
  ...props 
}: LazyIconProps & { component: ComponentType<any> }) => {
  return (
    <Suspense fallback={<Fallback {...props} />}>
      <IconComponent {...props} />
    </Suspense>
  );
};