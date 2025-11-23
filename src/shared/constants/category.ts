export type CategoryGroup = {
  id: string;
  label: string;
  children: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
};

export type CategoryOption = {
  id: string;
  label: string;
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "shopping",
    label: "쇼핑",
    children: [
      {
        id: "electronics",
        label: "전자제품",
      },
      {
        id: "fashion",
        label: "패션",
      },
    ],
  },
];

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: "all",
    label: "전체",
  },
  ...CATEGORY_GROUPS.flatMap((group) => group.children),
];

const CATEGORY_LOOKUP = CATEGORY_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.id] = option.label;
    return acc;
  },
  {}
);

export function getCategoryLabel(categoryId: string) {
  return CATEGORY_LOOKUP[categoryId] ?? "기타";
}
