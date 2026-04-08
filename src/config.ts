export const SITE = {
  website: "https://galelmalah.com/",
  author: "Gal Elmalah",
  profile: "https://www.linkedin.com/in/gal-elmalah-71874115a/",
  desc: "Writing on engineering, systems, leadership, and the work behind the work.",
  title: "Gal Elmalah",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/galelmalah/personal-blog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Jerusalem", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
