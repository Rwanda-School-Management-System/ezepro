import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, Clock, PlayCircle, Star, User } from "lucide-react";
import { toast } from "sonner";
import { contentQueries } from "@/lib/content";
import { SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Course: ${params.slug.replace(/-/g, " ")} — Eze Pro Developer` },
      { name: "description", content: "Course outline, lessons, duration and enrollment for this online course." },
      { property: "og:title", content: "Online course — Eze Pro Developer" },
      { property: "og:description", content: "Enroll and track your learning progress lesson by lesson." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE.url}/courses/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/courses/${params.slug}` }],
  }),
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: course, isLoading } = useQuery(contentQueries.bySlug("courses", slug));
  const [completed, setCompleted] = useState<number[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const storageKey = `course-progress:${slug}`;

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as { enrolled: boolean; completed: number[] };
      setEnrolled(parsed.enrolled);
      setCompleted(parsed.completed);
    }
  }, [storageKey]);

  function persist(next: { enrolled: boolean; completed: number[] }) {
    setEnrolled(next.enrolled);
    setCompleted(next.completed);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  if (isLoading) return <div className="container-page py-24 text-sm text-muted-foreground">Loading course…</div>;
  if (!course) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Button asChild className="mt-6"><Link to="/courses">Back to courses</Link></Button>
      </div>
    );
  }

  const lessons = Array.from({ length: Math.max(course.lessons_count, 1) }, (_, i) => ({
    index: i,
    title: `Lesson ${i + 1}: ${course.title.split(" ").slice(0, 3).join(" ")} — part ${i + 1}`,
  }));
  const percent = Math.round((completed.length / lessons.length) * 100);

  async function enroll() {
    if (!user) {
      toast.info("Please sign in to enroll and save your progress.");
      navigate({ to: "/auth" });
      return;
    }
    await supabase.from("service_requests").insert({
      full_name: user.user_metadata?.["full_name"] ?? user.email ?? "Learner",
      email: user.email ?? "",
      service_needed: `Course enrollment: ${course!.title}`,
      description: "Enrollment requested from the course page.",
      user_id: user.id,
    });
    persist({ enrolled: true, completed });
    toast.success("You're enrolled. Start with lesson 1!");
  }

  function toggleLesson(i: number) {
    if (!enrolled) {
      toast.info("Enroll first to track your progress.");
      return;
    }
    const next = completed.includes(i) ? completed.filter((x) => x !== i) : [...completed, i];
    persist({ enrolled, completed: next });
  }

  return (
    <div className="container-page py-12">
      <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-brand">
        <ArrowLeft className="mr-1 h-4 w-4" /> All courses
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
            {course.image_url ? <img src={course.image_url} alt={course.title} className="h-full w-full object-cover" /> : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary">{course.category}</Badge>
            <Badge variant="outline">{course.level}</Badge>
            <Badge className={course.is_free ? "bg-leaf text-leaf-foreground" : "bg-gold text-gold-foreground"}>
              {course.is_free ? "Free" : `RWF ${Number(course.price).toLocaleString()}`}
            </Badge>
          </div>
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{course.title}</h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{course.description}</p>

          <h2 className="mt-10 font-display text-xl font-semibold">Course content</h2>
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
            {lessons.map((l) => {
              const done = completed.includes(l.index);
              return (
                <li key={l.index}>
                  <button
                    onClick={() => toggleLesson(l.index)}
                    className="flex w-full items-center gap-3 bg-card p-4 text-left text-sm transition-colors hover:bg-accent/60"
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                    <span className={done ? "line-through text-muted-foreground" : ""}>{l.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><PlayCircle className="h-4 w-4" /> {course.lessons_count} lessons</p>
            <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {course.duration}</p>
            <p className="flex items-center gap-2"><User className="h-4 w-4" /> {course.instructor}</p>
            <p className="flex items-center gap-2 text-gold"><Star className="h-4 w-4 fill-current" /> {Number(course.rating).toFixed(1)} rating</p>
          </div>

          {enrolled ? (
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Your progress</span>
                <span className="text-muted-foreground">{percent}%</span>
              </div>
              <Progress value={percent} className="mt-2" />
              {percent === 100 ? (
                <p className="mt-3 rounded-lg bg-leaf/10 p-3 text-xs text-leaf">
                  Course completed. Contact us to request your certificate.
                </p>
              ) : null}
            </div>
          ) : (
            <Button onClick={enroll} className="w-full" size="lg">
              {course.is_free ? "Enroll for free" : "Enroll now"}
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
