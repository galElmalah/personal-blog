import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("Gal Elmalah"),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
    showToc: z.boolean().default(true),
    showRelatedContent: z.boolean().default(false),
  }),
});

export const collections = { posts };
