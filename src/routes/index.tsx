import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Braces,
  FileText,
  Globe,
  ImageIcon,
  Mic,
  MessagesSquare,
  Eye,
  FolderKanban,
  Sparkle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-aurora.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dalla AI — Think Faster. Create Smarter." },
      {
        name: "description",
        content:
          "One AI workspace for chat, document analysis, image generation, vision, research and code — fast, private and beautifully simple.",
      },
      { property: "og:title", content: "Dalla AI — Think Faster. Create Smarter." },
      {
        property: "og:description",
        content:
          "One AI workspace for chat, document analysis, image generation, vision, research and code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: MessagesSquare, title: "Streaming chat", body: "Real-time answers with markdown, code highlighting and message actions." },
  { icon: FileText, title: "Document analysis", body: "Summarise, translate, compare and question PDFs, docs and spreadsheets." },
  { icon: ImageIcon, title: "Image studio", body: "Generate, edit and organise visuals right inside a conversation." },
  { icon: Eye, title: "Vision", body: "Upload a screenshot or diagram and ask anything about it." },
  { icon: Globe, title: "Research mode", body: "Deep answers with structured findings and cited evidence." },
  { icon: Braces, title: "Coding assistant", body: "Generate, debug, refactor and document code in any language." },
  { icon: FolderKanban, title: "Projects", body: "Group chats, files, notes and research into shareable workspaces." },
  { icon: Mic, title: "Voice", body: "Talk to Dalla and listen back, hands free." },
];

const testimonials = [
  { name: "Amara N.", role: "Product lead", quote: "Dalla replaced four tabs in my workflow. Research to draft in one place." },
  { name: "Joel K.", role: "Staff engineer", quote: "The code mode is scarily good at explaining legacy services." },
  { name: "Priya S.", role: "Founder", quote: "Projects keep every client's material separate and searchable. That alone sold me." },
];

const faqs = [
  { q: "What can Dalla AI actually do?", a: "Chat, analyse files, generate and understand images, research with citations, write, and help with code — all inside one workspace." },
  { q: "Is my data private?", a: "Your chats, files and projects are tied to your account and only visible to you unless you deliberately share a project." },
  { q: "Do I need my own AI keys?", a: "No. Dalla AI ships with models built in, so you can start the moment you sign up." },
  { q: "Can I organise work by client or topic?", a: "Yes — projects group chats, files, notes, images and research, with sharing controls per project." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-aurora shadow-glow">
              <Sparkle className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Dalla AI</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#voices" className="transition-colors hover:text-foreground">Customers</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild size="sm" className="shadow-glow">
              <Link to="/auth" search={{ mode: "signup" }}>Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt=""
          width={1600}
          height={1008}
          className="pointer-events-none absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="relative mx-auto max-w-4xl px-5 py-28 text-center md:py-40">
          <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 mx-auto mb-6 w-fit rounded-full border border-border/60 px-4 py-1.5 text-xs tracking-wide text-muted-foreground glass">
            One workspace · every AI ability
          </p>
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-balance text-5xl font-extrabold leading-[1.05] md:text-7xl">
            Think Faster.{" "}
            <span className="text-gradient">Create Smarter.</span>
          </h1>
          <p className="animate-in fade-in duration-1000 mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Dalla AI brings chat, documents, images, research and code into a single calm
            workspace — so your thinking never has to change tabs.
          </p>
          <div className="animate-in fade-in duration-1000 mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start for free <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">See what it does</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-24">
        <h2 className="max-w-2xl text-3xl font-bold md:text-4xl">
          Everything you'd open ten tools for
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Each ability shares the same memory, the same projects and the same interface.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="animate-in fade-in duration-500 rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition-transform hover:-translate-y-1"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-aurora">
                <feature.icon className="size-5 text-primary-foreground" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="voices" className="border-y border-border/60 bg-surface py-24">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="text-3xl font-bold md:text-4xl">Loved by people who ship</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure key={item.name} className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft">
                <blockquote className="text-pretty text-base leading-relaxed">“{item.quote}”</blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-muted-foreground"> · {item.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
        <h2 className="text-3xl font-bold md:text-4xl">Questions, answered</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="rounded-4xl border border-border/60 bg-aurora p-12 text-center shadow-glow">
          <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
            Your next idea deserves a better workspace
          </h2>
          <Button asChild size="lg" variant="secondary" className="mt-8">
            <Link to="/auth" search={{ mode: "signup" }}>Create your free account</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Dalla AI</span>
          <span>Think Faster. Create Smarter.</span>
        </div>
      </footer>
    </div>
  );
}
