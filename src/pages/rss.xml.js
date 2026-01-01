import rss from '@astrojs/rss';
import { seo, template } from '../settings';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog');
  const posts = blog
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return rss({
    // `<title>` field in output xml
    title: seo.default_title,
    // `<description>` field in output xml
    description: seo.default_description,
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: context.site,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: new URL(
        `${template.base}/blog/${post.slug}`,
        context.site,
      ).toString(),
    })),
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  });
}
