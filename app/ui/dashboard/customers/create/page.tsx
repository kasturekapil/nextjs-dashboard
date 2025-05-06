import { Metadata } from "next";
import Form from "@/app/ui/customers/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";

export const metadata: Metadata = {
  title: "Create Customer",
};

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Customers", href: "/ui/dashboard/customers" },
          {
            label: "Create Customers",
            href: "/ui/dashboard/customers/create",
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
