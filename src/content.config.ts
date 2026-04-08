import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/content/posts";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().optional(),
      pubDatetime: z.coerce.date().optional(),
      date: z.coerce.date().optional(),
      modDatetime: z.coerce.date().optional().nullable(),
      updatedDate: z.coerce.date().optional(),
      title: z.string(),
      featured: z.boolean().optional(),
      pinned: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      ogImage: image().or(z.string()).optional(),
      cover: z.string().optional(),
      description: z.string().optional(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      type: z.enum(["post", "thought"]).optional(),
      thoughtId: z.string().optional(),
      showToc: z.boolean().optional(),
      showRelatedContent: z.boolean().optional(),
    })
    .transform((data, ctx) => {
      const pubDatetime = data.pubDatetime ?? data.date;

      if (!pubDatetime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Blog post requires either `pubDatetime` or `date`.",
        });
        return z.NEVER;
      }

      return {
        author: data.author ?? SITE.author,
        pubDatetime,
        modDatetime: data.modDatetime ?? data.updatedDate ?? null,
        title: data.title,
        featured: data.featured ?? data.pinned ?? false,
        draft: data.draft ?? false,
        tags: data.tags?.length ? data.tags : ["others"],
        ogImage: data.ogImage ?? data.cover,
        description: data.description ?? "",
        canonicalURL: data.canonicalURL,
        hideEditPost: data.hideEditPost,
        timezone: data.timezone ?? SITE.timezone,
        type: data.type ?? "post",
        thoughtId: data.thoughtId,
      };
    }),
});

export const collections = { blog };
