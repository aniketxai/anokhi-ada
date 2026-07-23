import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Reveal from './Reveal';

export default function SectionHeader({ eyebrow, title, subtitle, viewAllHref, center = false }) {
  return (
    <Reveal>
      <div className={`flex items-end justify-between gap-4 mb-6 ${center ? 'flex-col text-center' : ''}`}>
        <div className={center ? 'max-w-2xl' : ''}>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              {eyebrow}
            </p>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl text-balance text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground max-w-md">{subtitle}</p>
          )}
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all shrink-0"
          >
            View all <FiArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </Reveal>
  );
}
