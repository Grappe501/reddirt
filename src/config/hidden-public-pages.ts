/**
 * Public biography / People’s Voice hub pages parked for now (restore later).
 * Soft redirects — not 301s — so we can bring the routes back without fighting caches.
 *
 * Hidden:
 * Overview `/about` · Experience `/about/experience` · Why I'm running `/about/why-im-running`
 * Journey `/about/journey` · Community `/about/community`
 * The People's Voice hub `/direct-democracy` · Initiatives & petitions `/about/initiatives-petitions`
 */
export const parkedPublicPageRedirects: Array<{
  source: string;
  destination: string;
  permanent: false;
}> = [
  { source: "/about/why-im-running", destination: "/office/why-this-race-matters", permanent: false },
  { source: "/about/why-kelly", destination: "/office/why-this-race-matters", permanent: false },
  { source: "/about/journey", destination: "/arkansas-visits", permanent: false },
  { source: "/about/community", destination: "/from-the-road", permanent: false },
  { source: "/about/initiatives-petitions", destination: "/direct-democracy/ballot-initiative-process", permanent: false },
  { source: "/about/experience", destination: "/kelly-speaks", permanent: false },
  { source: "/about", destination: "/kelly-speaks", permanent: false },
  { source: "/about/:path*", destination: "/kelly-speaks", permanent: false },
  { source: "/direct-democracy", destination: "/direct-democracy/ballot-initiative-process", permanent: false },
];
