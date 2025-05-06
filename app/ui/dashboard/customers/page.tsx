import { Metadata } from "next";
import { Suspense } from "react";
import Table from "@/app/ui/customers/table";
import { CustomersTableSkeleton } from "@/app/ui/skeletons";
import { lusitana } from "@/app/ui/font";
import Search from "@/app/ui/search";
import { CreateCustomer } from "@/app/ui/customers/buttons";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-xl md:text-2xl`}>
          Customers
        </h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search customers..." />
        <CreateCustomer />
      </div>
      <Suspense key={query} fallback={<CustomersTableSkeleton />}>
        <Table query={query} />
      </Suspense>
    </div>
  );
}
