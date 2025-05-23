"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");

  const params = new URLSearchParams(searchParams);

  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching... ${term}`);
    params.set("page", "1");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 1000);

  const resetSearch = () => {
    console.log("reset");
    setSearchTerm("");
    params.set("page", "1");
    params.delete("query");
    replace(`${pathname}?${params.toString()}`);
    // replace(pathname); //// Remove all query params
  };

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const term = event.target.value.trim();
          setSearchTerm(term);
          handleSearch(term);
        }}
        value={searchTerm}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      <button
        onClick={resetSearch}
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900"
      >
        <XMarkIcon className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
