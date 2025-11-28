import { CATEGORY_GROUPS } from "@/shared/constants/category.ts";
import { Label } from "@/shared/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select.tsx";

type CategoryFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="feed-category">카테고리</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="feed-category" className="w-full md:w-64">
          <SelectValue placeholder="카테고리를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="all" value="all">
            전체
          </SelectItem>
          <SelectSeparator />
          {CATEGORY_GROUPS.map((group) => (
            <SelectGroup key={group.id}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  <span>{child.label}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
