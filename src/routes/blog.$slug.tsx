import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { contentQueries } from "@/lib/content";
import { SITE, formatDate } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Eze Pro Developer Blog` },
      { name: "description", content: "Read this guide from Eze Pro Developer on technology, careers and education in Rwanda." },
      { property: "og:title", content: "Eze Pro Developer Blog" },
      { property: "og:description", content: "Practical guides on technology, careers and education." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE.url}/blog/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/blog/${params.slug}` }],
  }),
  component: PostDetail,
});

function PostDetail() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery(contentQueries.bySlug("blog_posts", slug));

  if (isLoading) return <div className="container-page py-24 text-sm text-muted-foreground">Loading article…</div>;
  if (!post) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <Button asChild className="mt-6"><Link to="/blog">Back to blog</Link></Button>
      </div>
    );
  }

  return (
    <article className="container-page py-12">
      <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-brand">
        <ArrowLeft className="mr-1 h-4 w-4" /> All articles
      </Link>
      <div className="mx-auto mt-6 max-w-3xl">
        <Badge variant="secondary">{post.category}</Badge>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {post.author} · {formatDate(post.published_at)}
        </p>
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover" />
        ) : null}
        <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-foreground/90">{post.content ?? post.excerpt}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Badge key={t} variant="outline">#{t}</Badge>
          ))}
        </div>
      </div>
    </article>
  );
}
