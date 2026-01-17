import type { CollectionEntry } from 'astro:content';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export type ProjectPanel = {
  entry: CollectionEntry<'projects'>;
  Content: AstroComponentFactory;
};

type RenderResult = { Content: AstroComponentFactory };
export type RenderProjectEntry = (
  entry: CollectionEntry<'projects'>,
) => Promise<RenderResult>;

type BuildProjectPanelsOptions = {
  entries: CollectionEntry<'projects'>[];
  renderEntry?: RenderProjectEntry;
};

const defaultRenderEntry: RenderProjectEntry = async (entry) => {
  const { render } = await import('astro:content');
  return render(entry) as Promise<RenderResult>;
};

export const buildProjectPanels = async ({
  entries,
  renderEntry = defaultRenderEntry,
}: BuildProjectPanelsOptions): Promise<ProjectPanel[]> => {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('Project entries are missing.');
  }

  const seenOrders = new Map<number, string>();
  entries.forEach((entry) => {
    if (!entry.slug) {
      throw new Error('Project entry slug is missing.');
    }
    const order = entry.data.order;
    if (!Number.isInteger(order)) {
      throw new Error(`Project "${entry.slug}" has an invalid order.`);
    }
    if (order < 1) {
      throw new Error(`Project "${entry.slug}" order must be >= 1.`);
    }
    const existing = seenOrders.get(order);
    if (existing) {
      throw new Error(
        `Project order ${order} is duplicated (${existing}, ${entry.slug}).`,
      );
    }
    seenOrders.set(order, entry.slug);
  });

  const sortedEntries = [...entries].sort(
    (a, b) => a.data.order - b.data.order,
  );
  return Promise.all(
    sortedEntries.map(async (entry) => {
      const { Content } = await renderEntry(entry);
      return {
        entry,
        Content,
      };
    }),
  );
};
