"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SearchBoxProps = {
  defaultValue: string;
};

export default function SearchBox({ defaultValue }: SearchBoxProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      const keyword = value.trim();
      const currentKeyword = searchParams.get("search") ?? "";

      if (keyword === currentKeyword) {
        return;
      }

      if (keyword) {
        params.set("search", keyword);
      } else {
        params.delete("search");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [pathname, router, searchParams, value]);

  return (
    <label className="search-box">
      <span>검색</span>
      <input
        name="search"
        onChange={(event) => setValue(event.target.value)}
        placeholder="Todo 내용을 검색하세요"
        type="search"
        value={value}
      />
    </label>
  );
}
