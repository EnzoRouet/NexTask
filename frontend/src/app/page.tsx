"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Kanban,
  FileText,
  ArrowRight,
  CheckSquare,
  LayoutDashboard,
  Shield,
  ChevronRight,
  Circle,
  X,
  Menu,
} from "lucide-react";

function Logo() {
  return (
    <span className="text-xl font-bold tracking-tight">
      <span className="text-text-main">Nex</span>
      <span className="text-accent">Task</span>
    </span>
  );
}

function Badge({
  children,
  color = "default",
}: {
  children: React.ReactNode;
  color?: "violet" | "blue" | "green" | "default";
}) {
  const colors = {
    violet: "bg-violet-950/60 text-violet-400 border-violet-900",
    blue: "bg-blue-950/60 text-blue-400 border-blue-900",
    green: "bg-green-950/60 text-green-400 border-green-900",
    default: "bg-surface-hover text-text-muted border-border-dim",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}
    >
      {children}
    </span>
  );
}

const kanbanColumns = [
  {
    title: "TODO",
    count: 4,
    cards: [
      "Implémenter auth OAuth",
      "Design system tokens",
      "API rate limiting",
    ],
  },
  {
    title: "En cours",
    count: 2,
    cards: ["Migration base de données", "Refacto composants UI"],
  },
  {
    title: "QA",
    count: 1,
    cards: ["Tests end-to-end login"],
  },
  {
    title: "DONE",
    count: 3,
    cards: ["Setup CI/CD pipeline"],
    done: true,
  },
];

function KanbanPreview() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {kanbanColumns.map((col) => (
        <div key={col.title} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {col.title}
            </span>
            <span className="text-xs bg-surface-hover text-text-muted rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {col.count}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {col.cards.map((card) => (
              <div
                key={card}
                className={`rounded-lg border border-border-dim p-2.5 text-xs text-text-main bg-surface ${col.done ? "opacity-40" : ""}`}
              >
                <span className="line-clamp-1">{card}</span>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-[9px] text-white font-bold">
                    T
                  </div>
                  <span className="text-text-muted text-[10px]">TA TÂCHE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WikiPreview() {
  const docs = [
    { title: "Architecture technique", date: "6/25/2026" },
    { title: "Guide d'onboarding", date: "6/24/2026" },
    { title: "API Reference", date: "6/20/2026" },
  ];
  return (
    <div className="flex flex-col gap-3">
      {docs.map((doc) => (
        <div
          key={doc.title}
          className="flex items-center justify-between rounded-lg border border-border-dim bg-surface px-4 py-3 group cursor-pointer hover:border-color-accent/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText size={15} className="text-text-muted shrink-0" />
            <span className="text-sm text-text-main">{doc.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              Modifié le {doc.date}
            </span>
            <ChevronRight
              size={14}
              className="text-text-muted group-hover:text-accent transition-colors"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RBACPreview() {
  const members = [
    { name: "Alice Martin", email: "alice@corp.dev", role: "OWNER" },
    { name: "Bob Dupont", email: "bob@corp.dev", role: "PO" },
    { name: "Claire Petit", email: "claire@corp.dev", role: "DEV" },
    { name: "David Roy", email: "david@corp.dev", role: "DEV" },
  ];
  const roleColor = (r: string) =>
    r === "OWNER" ? "violet" : r === "PO" ? "blue" : "green";
  return (
    <div className="overflow-hidden rounded-lg border border-border-dim">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-dim bg-surface-hover/40">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
              Identité
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
              Rôle
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr
              key={m.email}
              className="border-b border-border-dim last:border-0"
            >
              <td className="px-4 py-3 text-text-main font-medium">{m.name}</td>
              <td className="px-4 py-3 text-text-muted font-mono text-xs">
                {m.email}
              </td>
              <td className="px-4 py-3 text-right">
                <Badge color={roleColor(m.role) as "violet" | "blue" | "green"}>
                  {m.role}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const features = [
  {
    icon: Kanban,
    title: "Kanban intégré",
    desc: "Gérez vos sprints avec des colonnes TODO, En cours, QA et DONE. Créez des tickets, assignez-les à votre équipe et suivez l'avancement en temps réel.",
    preview: <KanbanPreview />,
    badge: "Kanban",
  },
  {
    icon: FileText,
    title: "Wiki de projet",
    desc: "Centralisez toute votre documentation technique, vos specs et vos guides d'onboarding. Un éditeur riche, directement dans votre espace de travail.",
    preview: <WikiPreview />,
    badge: "Documentation",
  },
  {
    icon: Shield,
    title: "RBAC & Gestion des membres",
    desc: "Contrôlez précisément les accès avec des rôles Owner, PO et Dev. Invitez votre équipe, définissez les permissions et gardez la main sur chaque projet.",
    preview: <RBACPreview />,
    badge: "Sécurité",
  },
];

const roles = [
  {
    name: "Owner",
    color: "text-violet-400",
    bg: "bg-violet-950/40 border-violet-900/60",
    dot: "bg-violet-500",
    perms: [
      "Accès complet au projet",
      "Gestion des membres et rôles",
      "Suppression du projet",
      "Centre de contrôle admin",
    ],
  },
  {
    name: "Product Owner",
    color: "text-blue-400",
    bg: "bg-blue-950/40 border-blue-900/60",
    dot: "bg-blue-500",
    perms: [
      "Création et gestion des tickets",
      "Gestion des colonnes Kanban",
      "Édition de la documentation",
      "Invitation de membres",
    ],
  },
  {
    name: "Développeur",
    color: "text-green-400",
    bg: "bg-green-950/40 border-green-900/60",
    dot: "bg-green-500",
    perms: [
      "Consultation du Kanban",
      "Mise à jour de ses tickets",
      "Lecture de la documentation",
      "Participation aux sprints",
    ],
  },
];

const steps = [
  {
    n: "01",
    title: "Créez votre espace",
    desc: "Ouvrez un projet en quelques secondes. Nommez-le, invitez votre équipe.",
  },
  {
    n: "02",
    title: "Structurez votre workflow",
    desc: "Configurez vos colonnes Kanban et rédigez votre documentation dès le premier jour.",
  },
  {
    n: "03",
    title: "Assignez les rôles",
    desc: "Définissez qui peut faire quoi. Owner, PO, Dev - chacun voit ce dont il a besoin.",
  },
  {
    n: "04",
    title: "Livrez sans friction",
    desc: "Tout au même endroit. Fini les allers-retours entre trois outils différents.",
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="min-h-screen bg-background text-text-main font-sans selection:bg-accent/30">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border-dim bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a
              href="#features"
              className="hover:text-text-main transition-colors"
            >
              Fonctionnalités
            </a>
            <a href="#roles" className="hover:text-text-main transition-colors">
              Rôles
            </a>
            <a href="#how" className="hover:text-text-main transition-colors">
              Comment ça marche
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-text-muted hover:text-text-main transition-colors font-medium"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm bg-accent text-white px-5 py-2 rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              Commencer gratuitement
            </Link>
          </div>
          <button
            className="md:hidden text-text-muted p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border-dim bg-background px-4 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm text-text-muted font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Fonctionnalités
            </a>
            <a
              href="#roles"
              className="text-sm text-text-muted font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Rôles
            </a>
            <a
              href="#how"
              className="text-sm text-text-muted font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Comment ça marche
            </a>
            <hr className="border-border-dim my-2" />
            <Link
              href="/login"
              className="text-sm text-center text-text-muted font-medium py-2"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm text-center bg-accent text-white px-4 py-2.5 rounded-lg font-medium"
            >
              Commencer gratuitement
            </Link>
          </div>
        )}
      </header>

      <section className="pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center mt-8">
        <div className="inline-flex items-center gap-2 bg-surface border border-border-dim rounded-full px-4 py-1.5 text-xs text-text-main mb-8 backdrop-blur-sm">
          <Circle size={8} className="fill-accent text-accent animate-pulse" />
          Kanban · Documentation · RBAC - tout en un
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-text-main">
          Arrêtez de jongler entre
          <br />
          <span className="text-accent">trois outils différents</span>
        </h1>
        <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          NexTask centralise votre kanban, votre documentation et la gestion des
          membres en un seul espace de travail conçu pour les équipes dev.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex justify-center items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Créer mon espace de travail
            <ArrowRight size={18} />
          </Link>
          <a
            href="#features"
            className="inline-flex justify-center items-center gap-2 bg-surface border border-border-dim text-text-main px-8 py-3.5 rounded-xl font-medium hover:bg-surface-hover transition-all"
          >
            Voir une démo
          </a>
        </div>

        <div className="mt-20 relative mx-auto max-w-4xl">
          <div className="rounded-xl border border-border-dim bg-surface overflow-hidden shadow-2xl shadow-black/60">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-dim bg-background/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-surface-hover rounded-md px-3 py-1 text-xs text-text-muted text-center w-64 mx-auto font-mono">
                  localhost:3000/dashboard
                </div>
              </div>
            </div>
            <div className="flex h-96 text-left">
              <div className="w-48 shrink-0 border-r border-border-dim bg-background p-4 flex flex-col gap-1">
                <div className="mb-6">
                  <Logo />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] text-text-muted mb-2 font-bold uppercase tracking-wider">
                    Espace de travail
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-surface-hover text-sm text-text-main font-medium border border-border-dim">
                    <Kanban size={16} className="text-accent" />
                    <span>Kanban</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 rounded-md text-text-muted text-sm hover:bg-surface-hover transition-colors font-medium mt-1">
                    <FileText size={16} />
                    <span>Documentation</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-hidden bg-background">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-text-main">
                      Sprint Actuel
                    </h2>
                    <p className="text-sm text-text-muted mt-1">
                      Gérez vos tickets en les déplaçant dans les colonnes
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-xs font-medium bg-accent text-white px-4 py-2 rounded-md shadow-lg shadow-accent/20">
                      + Nouveau Ticket
                    </div>
                  </div>
                </div>
                <KanbanPreview />
              </div>
            </div>
          </div>
          <div className="absolute -inset-px rounded-xl bg-linear-to-b from-accent/10 to-transparent pointer-events-none" />
        </div>
      </section>

      <section id="features" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm text-accent font-bold uppercase tracking-widest mb-3">
            Fonctionnalités
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-text-main">
            Tout ce dont votre équipe a besoin
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
            Plus besoin de Jira pour le kanban, Notion pour la doc, et un
            troisième outil pour la gestion des accès. NexTask regroupe tout.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex lg:flex-col gap-3 lg:w-80 shrink-0">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.title}
                  onClick={() => setActiveFeature(i)}
                  className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300 ${
                    activeFeature === i
                      ? "border-accent/50 bg-accent/10 text-text-main"
                      : "border-border-dim bg-surface text-text-muted hover:border-border-focus hover:bg-surface-hover"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      activeFeature === i
                        ? "text-accent mt-0.5 shrink-0"
                        : "mt-0.5 shrink-0"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-text-main mb-1">
                      {f.title}
                    </div>
                    <div className="text-sm leading-relaxed line-clamp-2 hidden lg:block opacity-80">
                      {f.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 rounded-2xl border border-border-dim bg-surface p-8 overflow-hidden">
            <div className="mb-6">
              <Badge color="default">{features[activeFeature].badge}</Badge>
              <h3 className="text-2xl font-bold mt-4 text-text-main">
                {features[activeFeature].title}
              </h3>
              <p className="text-text-muted mt-2 text-base leading-relaxed max-w-xl">
                {features[activeFeature].desc}
              </p>
            </div>
            <div className="border-t border-border-dim pt-6">
              {features[activeFeature].preview}
            </div>
          </div>
        </div>
      </section>

      <section
        id="roles"
        className="py-24 px-4 sm:px-6 bg-surface/30 border-y border-border-dim"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-accent font-bold uppercase tracking-widest mb-3">
              Contrôle d&apos;accès
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-text-main">
              Des rôles pensés pour le dev
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Un système RBAC calé sur la réalité des équipes produit. Chaque
              rôle a exactement les permissions dont il a besoin - ni plus, ni
              moins.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.name}
                className={`rounded-xl border p-6 ${role.bg}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${role.dot}`} />
                  <span className={`font-bold text-base ${role.color}`}>
                    {role.name}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {role.perms.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-sm text-text-main/80"
                    >
                      <CheckSquare
                        size={14}
                        className={`${role.color} mt-0.5 shrink-0`}
                      />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-text-main">
            Opérationnel en 5 minutes
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
            Pas de configuration complexe. Créez votre espace, invitez votre
            équipe et commencez à travailler.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="relative rounded-xl border border-border-dim bg-surface p-5"
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-2 z-10">
                  <ChevronRight size={16} className="text-border-focus" />
                </div>
              )}
              <div className="text-3xl font-black text-accent/20 mb-3 leading-none">
                {step.n}
              </div>
              <h3 className="text-sm font-semibold mb-2 text-text-main">
                {step.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 bg-surface/30 border-y border-border-dim">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-px bg-border-dim rounded-xl overflow-hidden">
            {[
              {
                icon: LayoutDashboard,
                label: "Avant NexTask",
                items: [
                  "Jira pour le kanban",
                  "Notion pour la doc",
                  "Slack pour les rôles",
                  "Contexte fragmenté",
                ],
              },
              {
                icon: X,
                label: "Le problème",
                items: [
                  "3 abonnements",
                  "Synchro manuelle",
                  "Onboarding long",
                  "Perte de contexte",
                ],
              },
              {
                icon: CheckSquare,
                label: "Avec NexTask",
                items: [
                  "1 seul outil",
                  "Tout synchronisé",
                  "Setup en 5 min",
                  "Équipe alignée",
                ],
              },
            ].map((col, i) => {
              const Icon = col.icon;
              return (
                <div
                  key={col.label}
                  className={`bg-surface p-6 ${i === 2 ? "md:bg-accent/10" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon
                      size={16}
                      className={i === 2 ? "text-accent" : "text-text-muted"}
                    />
                    <span
                      className={`text-sm font-semibold ${i === 2 ? "text-accent" : "text-text-muted"}`}
                    >
                      {col.label}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {col.items.map((item) => (
                      <li
                        key={item}
                        className={`text-sm ${i === 2 ? "text-text-main" : "text-text-muted"}`}
                      >
                        {i === 0 && "→ "}
                        {i === 1 && "✗ "}
                        {i === 2 && "✓ "}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-32 px-4 sm:px-6 text-center max-w-4xl mx-auto relative">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-text-main">
          Votre équipe mérite un
          <br />
          <span className="text-accent">espace de travail unifié</span>
        </h2>
        <p className="text-text-muted text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
          Rejoignez les équipes dev qui ont centralisé leur workflow dans
          NexTask. Kanban, documentation et gestion des membres - au même
          endroit.
        </p>
        <div className="flex justify-center">
          <Link
            href="/register"
            className="inline-flex justify-center items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Créer mon espace gratuitement
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border-dim px-4 sm:px-6 py-10 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-text-muted font-medium">
          <Logo />
          <span>© 2026 NexTask - Centralisez. Collaborez. Livrez.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-main transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-text-main transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
