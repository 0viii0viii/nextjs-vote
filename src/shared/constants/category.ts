export type CategoryGroup = {
  id: string;
  label: string;
  children: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
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
