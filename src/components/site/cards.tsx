import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarClock,
  Clock,
  GraduationCap,
  MapPin,
  PlayCircle,
  Star,
} from "lucide-react";
import type { BlogPost, Course, Job, Scholarship, Service } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { daysLeft, formatDate } from "@/lib/site";

const cardBase =
  "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift";

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const left = daysLeft(deadline);
  if (left === null) return null;
  return (
    <Badge variant={left <= 7 ? "destructive" : "secondary"} className="shrink-0">
      <CalendarClock className="mr-1 h-3 w-3" />
      {left < 0 ? "Closed" : `${left} days left`}
    </Badge>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className={`${cardBase} p-6`}>
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-brand">
        <Briefcase className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{service.short_description}</p>
      <Button asChild variant="outline" size="sm" className="mt-5 w-fit">
        <Link to="/applications" search={{ service: service.title }}>
          Request Service <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </Button>
    </article>
  );
}

export function JobCard({ job }: { job: Job }) {
  return (
    <article className={`${cardBase} p-6`}>
      <div className="flex items-start justify-between gap-3">
        <Badge className="bg-accent text-accent-foreground">{job.job_type}</Badge>
        <DeadlineBadge deadline={job.deadline} />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
        <Link to="/jobs/$slug" params={{ slug: job.slug }} className="hover:text-brand">
          {job.title}
        </Link>
      </h3>
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 shrink-0" /> {job.company}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {job.location ?? "Not specified"}
        </p>
      </div>
      <p className="mt-3 flex-1 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">Deadline {formatDate(job.deadline)}</span>
        <Button asChild size="sm">
          <Link to="/jobs/$slug" params={{ slug: job.slug }}>
            View job
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  return (
    <article className={`${cardBase} p-6`}>
      <div className="flex items-start justify-between gap-3">
        <Badge className="bg-leaf text-leaf-foreground">{scholarship.funding_type ?? "Scholarship"}</Badge>
        <DeadlineBadge deadline={scholarship.deadline} />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
        <Link to="/scholarships/$slug" params={{ slug: scholarship.slug }} className="hover:text-brand">
          {scholarship.title}
        </Link>
      </h3>
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0" /> {scholarship.organization}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {scholarship.country ?? "International"}
        </p>
      </div>
      <p className="mt-3 flex-1 line-clamp-2 text-sm text-muted-foreground">{scholarship.eligibility}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{scholarship.degree_level}</span>
        <Button asChild size="sm">
          <Link to="/scholarships/$slug" params={{ slug: scholarship.slug }}>
            View details
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className={cardBase}>
      <Link to="/courses/$slug" params={{ slug: course.slug }} className="block aspect-video overflow-hidden bg-muted">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{course.category}</Badge>
          <Badge className={course.is_free ? "bg-leaf text-leaf-foreground" : "bg-gold text-gold-foreground"}>
            {course.is_free ? "Free" : `RWF ${Number(course.price).toLocaleString()}`}
          </Badge>
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
          <Link to="/courses/$slug" params={{ slug: course.slug }} className="hover:text-brand">
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" /> {course.lessons_count} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.duration}
          </span>
          <span className="flex items-center gap-1 text-gold">
            <Star className="h-3.5 w-3.5 fill-current" /> {Number(course.rating).toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className={cardBase}>
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block aspect-[16/10] overflow-hidden bg-muted">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="secondary">{post.category}</Badge>
          <span>{formatDate(post.published_at)}</span>
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-brand">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="mt-4 inline-flex items-center text-sm font-semibold text-brand"
        >
          Read article <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
