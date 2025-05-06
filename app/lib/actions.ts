"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CustomerFormSchema = z.object({
  id: z.string(),
  name: z
    .string({
      invalid_type_error: "Please enter customer name.",
    })
    .min(1, "Please enter customer name.")
    .max(50, "Name is too long."),
  email: z
    .string({
      invalid_type_error: "Please enter customer email.",
    })
    .email("Please enter a valid email."),
  // imageUrl: z
  //   .instanceof(File, { message: "Please upload avatar image." })
  //   .refine((file) => file.size <= 5 * 1024 * 1024, "File must be under 5MB.")
  //   .refine(
  //     (file) => ["image/png"].includes(file.type),
  //     "Only PNG files are allowed."
  //   ),
});

export type InvoiceState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
    // imageUrl?: string[];
  };
  message?: string | null;
};

const CreateInvoice = InvoiceFormSchema.omit({
  id: true,
  date: true,
});

export async function createInvoice(
  prevState: InvoiceState,
  formData: FormData
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/ui/dashboard/invoices");
  redirect("/ui/dashboard/invoices");
}

const UpdateInvoice = InvoiceFormSchema.omit({
  id: true,
  date: true,
});

export async function updateInvoice(
  id: string,
  prevState: InvoiceState,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/ui/dashboard/invoices");
  redirect("/ui/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/ui/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.name) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

const CreateCustomer = CustomerFormSchema.omit({
  id: true,
});

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData
) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    // imageUrl: formData.get("imageUrl"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Customer.",
    };
  }

  // Prepare data for insertion into the database
  const { name, email } = validatedFields.data;

  const imageUrl = `/customers/${name.toLowerCase().split(" ").join("-")}.png`;

  try {
    await sql`
    INSERT INTO customers (name, email, image_url)
    VALUES (${name}, ${email}, ${imageUrl})
  `;
  } catch {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/ui/dashboard/customers");
  redirect("/ui/dashboard/customers");
}

const UpdateCustomer = CustomerFormSchema.omit({
  id: true,
});

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData
) {
  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Customer.",
    };
  }

  // Prepare data for insertion into the database
  const { name, email } = validatedFields.data;

  const imageUrl = `/customers/${name.toLowerCase().split(" ").join("-")}.png`;

  try {
    await sql`
    UPDATE customers
    SET name = ${name}, email = ${email}, imageUrl = ${imageUrl}
    WHERE id = ${id}
  `;
  } catch {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/ui/dashboard/invoices");
  redirect("/ui/dashboard/invoices");
}

export async function deleteCustomer(id: string) {
  await sql`DELETE FROM customers WHERE id = ${id}`;
  revalidatePath("/ui/dashboard/customers");
}
