export { default } from "next-auth/middleware";

// 2. On lui donne ses consignes (Le "Matcher")
export const config = {
  // 🚨 À TOI DE JOUER ICI ! 🚨
  // Tu dois définir un tableau 'matcher' contenant les routes à protéger.
  matcher: ["/board", "/wiki"],
};
