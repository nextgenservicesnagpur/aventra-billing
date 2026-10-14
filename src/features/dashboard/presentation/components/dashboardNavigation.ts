import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  CircleDollarSign,
  CircleHelp,
  ClipboardList,
  Contact,
  CreditCard,
  FileText,
  Handshake,
  Landmark,
  LayoutDashboard,
  Package,
  Percent,
  ReceiptText,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  UserRound,
  Users,
  Warehouse,
  WalletCards,
} from "lucide-react";

export type DashboardNavigationHref =
  | "/dashboard"
  | "/organization"
  | "/invoices"
  | "/credit-notes"
  | "/customers"
  | "/products"
  | "/services"
  | "/settings/billing";
export type DashboardNavigationAvailability = "available" | "planned";

type DashboardNavigationBase = {
  description: string;
  icon: LucideIcon;
  id: string;
  label: string;
  title: string;
};

export type DashboardNavigationItem =
  | (DashboardNavigationBase & {
      availability: "available";
      href: DashboardNavigationHref;
    })
  | (DashboardNavigationBase & {
      availability: "planned";
      href?: never;
    });

export type DashboardNavigationSection = {
  items: readonly DashboardNavigationItem[];
  label: string;
};

const planned = (
  item: Omit<DashboardNavigationBase, "id"> & { id: string },
): DashboardNavigationItem => ({ ...item, availability: "planned" });

const available = (
  item: Omit<DashboardNavigationBase, "id"> & {
    href: DashboardNavigationHref;
    id: string;
  },
): DashboardNavigationItem => ({ ...item, availability: "available" });

/** The complete dashboard information architecture. Planned entries have no invented URLs. */
export const dashboardNavigationSections = [
  {
    label: "Dashboard",
    items: [
      available({ description: "View business metrics, recent activity, and important updates.", href: "/dashboard", icon: LayoutDashboard, id: "dashboard-overview", label: "Dashboard", title: "Dashboard" }),
      planned({ description: "Analyze revenue, expenses, sales performance, and business trends.", icon: BarChart3, id: "dashboard-analytics", label: "Analytics", title: "Analytics" }),
      planned({ description: "Review recent business transactions and important updates.", icon: ClipboardList, id: "dashboard-recent-activity", label: "Recent activity", title: "Recent Activity" }),
    ],
  },
  {
    label: "Sales",
    items: [
      available({ description: "Maintain customer records and contact information.", href: "/customers", icon: Users, id: "sales-customers", label: "Customers", title: "Customers" }),
      planned({ description: "Prepare and track quotations before invoicing.", icon: FileText, id: "sales-estimates", label: "Estimates / quotations", title: "Estimates / Quotations" }),
      planned({ description: "Track customer orders before fulfilment and billing.", icon: ShoppingCart, id: "sales-orders", label: "Sales orders", title: "Sales Orders" }),
      planned({ description: "Record goods or services returned by customers.", icon: ReceiptText, id: "sales-returns", label: "Sales returns", title: "Sales Returns" }),
      planned({ description: "Track opportunities and customer sales progress.", icon: ChartNoAxesCombined, id: "sales-pipeline", label: "Sales pipeline", title: "Sales Pipeline" }),
      planned({ description: "Prepare delivery documentation for fulfilled orders.", icon: ClipboardList, id: "sales-delivery-challans", label: "Delivery challans", title: "Delivery Challans" }),
    ],
  },
  {
    label: "Billing",
    items: [
      available({ description: "Create, view, and manage customer invoices.", href: "/invoices", icon: ReceiptText, id: "billing-invoices", label: "Invoices", title: "Invoices" }),
      available({ description: "Record sales returns, credits, and customer adjustments.", href: "/credit-notes", icon: FileText, id: "billing-credit-notes", label: "Credit notes", title: "Credit Notes" }),
      planned({ description: "Manage debit adjustments for customers or suppliers.", icon: FileText, id: "billing-debit-notes", label: "Debit notes", title: "Debit Notes" }),
      planned({ description: "Track payments received against customer invoices.", icon: CreditCard, id: "billing-payments-received", label: "Payments received", title: "Payments Received" }),
      planned({ description: "Manage invoices that repeat on a defined schedule.", icon: ReceiptText, id: "billing-recurring-invoices", label: "Recurring invoices", title: "Recurring Invoices" }),
      planned({ description: "Configure invoice numbering, defaults, and billing preferences.", icon: Settings2, id: "billing-settings", label: "Billing settings", title: "Billing Settings" }),
    ],
  },
  {
    label: "Purchases",
    items: [
      planned({ description: "Maintain supplier and vendor information.", icon: Truck, id: "purchases-suppliers", label: "Suppliers", title: "Suppliers" }),
      planned({ description: "Create and track orders placed with suppliers.", icon: ShoppingCart, id: "purchases-orders", label: "Purchase orders", title: "Purchase Orders" }),
      planned({ description: "Review and manage bills received from suppliers.", icon: ClipboardList, id: "purchases-bills", label: "Purchase bills", title: "Purchase Bills" }),
      planned({ description: "Record goods or services returned to suppliers.", icon: ReceiptText, id: "purchases-returns", label: "Purchase returns", title: "Purchase Returns" }),
      planned({ description: "Track outstanding supplier balances and payments.", icon: WalletCards, id: "purchases-payments", label: "Supplier payments", title: "Supplier Payments" }),
      planned({ description: "Analyze purchasing activity and supplier spending.", icon: BarChart3, id: "purchases-reports", label: "Purchase reports", title: "Purchase Reports" }),
    ],
  },
  {
    label: "Expenses",
    items: [
      planned({ description: "Record and categorize business expenses.", icon: ReceiptText, id: "expenses-expenses", label: "Expenses", title: "Expenses" }),
      planned({ description: "Manage expense categories used for bookkeeping.", icon: Tags, id: "expenses-categories", label: "Expense categories", title: "Expense Categories" }),
      planned({ description: "Review expenses by category, party, and period.", icon: BarChart3, id: "expenses-reports", label: "Expense reports", title: "Expense Reports" }),
      planned({ description: "Track employee expense claims, if supported.", icon: WalletCards, id: "expenses-reimbursements", label: "Reimbursements", title: "Reimbursements" }),
    ],
  },
  {
    label: "Tax & GST",
    items: [
      planned({ description: "Review tax totals across business transactions.", icon: Calculator, id: "tax-summary", label: "Tax summary", title: "Tax Summary" }),
      planned({ description: "Review sales and output-tax information.", icon: BarChart3, id: "tax-gst-sales-summary", label: "GST sales summary", title: "GST Sales Summary" }),
      planned({ description: "Review purchases and input-tax information.", icon: BarChart3, id: "tax-gst-purchase-summary", label: "GST purchase summary", title: "GST Purchase Summary" }),
      planned({ description: "Review sales details relevant to GSTR-1 preparation.", icon: FileText, id: "tax-gstr-1", label: "GSTR-1", title: "GSTR-1" }),
      planned({ description: "Review summaries relevant to GSTR-3B preparation.", icon: FileText, id: "tax-gstr-3b", label: "GSTR-3B", title: "GSTR-3B" }),
      planned({ description: "Manage applicable goods and services classification codes.", icon: Tags, id: "tax-hsn-sac", label: "HSN / SAC codes", title: "HSN / SAC Codes" }),
      planned({ description: "Review configured tax rates and treatments.", icon: Percent, id: "tax-rates", label: "Tax rates", title: "Tax Rates" }),
      planned({ description: "Configure available GST and registration settings.", icon: Settings2, id: "tax-settings", label: "GST settings", title: "GST Settings" }),
      planned({ description: "Access e-invoice workflows when implemented.", icon: ReceiptText, id: "tax-e-invoice", label: "E-Invoice", title: "E-Invoice" }),
      planned({ description: "Access e-way bill workflows when implemented.", icon: Truck, id: "tax-e-way-bill", label: "E-Way Bill", title: "E-Way Bill" }),
    ],
  },
  {
    label: "Products & Services",
    items: [
      available({ description: "Maintain products, descriptions, and applicable prices.", href: "/products", icon: Package, id: "products-products", label: "Products", title: "Products" }),
      available({ description: "Maintain services offered to customers.", href: "/services", icon: Handshake, id: "products-services", label: "Services", title: "Services" }),
      planned({ description: "Organize products and services into categories.", icon: Tags, id: "products-categories", label: "Categories", title: "Categories" }),
      planned({ description: "Manage supported units for quantities and billing.", icon: Boxes, id: "products-units", label: "Units of measurement", title: "Units of Measurement" }),
      planned({ description: "Manage product and service pricing information.", icon: CircleDollarSign, id: "products-pricing", label: "Pricing", title: "Pricing" }),
      planned({ description: "Configure supported tax classification for products and services.", icon: Tags, id: "products-hsn-sac-mapping", label: "HSN / SAC mapping", title: "HSN / SAC Mapping" }),
    ],
  },
  {
    label: "Inventory & Stock",
    items: [
      planned({ description: "Review current stock information.", icon: Boxes, id: "inventory-overview", label: "Stock overview", title: "Stock Overview" }),
      planned({ description: "Review inventory movements and adjustments.", icon: ClipboardList, id: "inventory-movements", label: "Stock movements", title: "Stock Movements" }),
      planned({ description: "Record supported stock corrections.", icon: ReceiptText, id: "inventory-adjustments", label: "Stock adjustments", title: "Stock Adjustments" }),
      planned({ description: "Manage warehouse or storage locations.", icon: Warehouse, id: "inventory-warehouses", label: "Warehouses", title: "Warehouses" }),
      planned({ description: "Transfer stock between supported storage locations.", icon: Boxes, id: "inventory-transfers", label: "Stock transfers", title: "Stock Transfers" }),
      planned({ description: "Identify items that need replenishment.", icon: Package, id: "inventory-low-stock", label: "Low stock", title: "Low Stock" }),
      planned({ description: "Review stock-related reports.", icon: BarChart3, id: "inventory-reports", label: "Inventory reports", title: "Inventory Reports" }),
    ],
  },
  {
    label: "Parties & Contacts",
    items: [
      planned({ description: "View available customers, suppliers, and business contacts.", icon: Users, id: "parties-all", label: "All parties", title: "All Parties" }),
      planned({ description: "Access customer records.", icon: UserRound, id: "parties-customers", label: "Customers", title: "Customers" }),
      planned({ description: "Access supplier records.", icon: Truck, id: "parties-suppliers", label: "Suppliers", title: "Suppliers" }),
      planned({ description: "Review available customer and supplier balances.", icon: WalletCards, id: "parties-balances", label: "Party balances", title: "Party Balances" }),
      planned({ description: "Manage supported contact information.", icon: Contact, id: "parties-contacts", label: "Contacts", title: "Contacts" }),
    ],
  },
  {
    label: "Banking & Accounting",
    items: [
      planned({ description: "Review configured business bank accounts.", icon: Landmark, id: "accounting-bank-accounts", label: "Bank accounts", title: "Bank Accounts" }),
      planned({ description: "Review recorded financial transactions.", icon: CircleDollarSign, id: "accounting-transactions", label: "Transactions", title: "Transactions" }),
      planned({ description: "Review cash inflows and outflows.", icon: WalletCards, id: "accounting-cash-flow", label: "Cash flow", title: "Cash Flow" }),
      planned({ description: "Reconcile transactions against bank statements.", icon: Calculator, id: "accounting-reconciliation", label: "Bank reconciliation", title: "Bank Reconciliation" }),
      planned({ description: "Maintain the accounts used to classify financial activity.", icon: ClipboardList, id: "accounting-chart-of-accounts", label: "Chart of accounts", title: "Chart of Accounts" }),
      planned({ description: "Review ledger entries, if supported.", icon: ClipboardList, id: "accounting-general-ledger", label: "General ledger", title: "General Ledger" }),
      planned({ description: "Record manual accounting entries and adjustments.", icon: FileText, id: "accounting-journal-entries", label: "Journal entries", title: "Journal Entries" }),
      planned({ description: "Review account balances, if supported.", icon: BarChart3, id: "accounting-trial-balance", label: "Trial balance", title: "Trial Balance" }),
    ],
  },
  {
    label: "Reports",
    items: [
      planned({ description: "Review sales performance.", icon: BarChart3, id: "reports-sales", label: "Sales reports", title: "Sales Reports" }),
      planned({ description: "Review purchases and supplier spending.", icon: ShoppingCart, id: "reports-purchases", label: "Purchase reports", title: "Purchase Reports" }),
      planned({ description: "Review available tax summaries.", icon: Calculator, id: "reports-tax", label: "Tax reports", title: "Tax Reports" }),
      planned({ description: "Review outstanding customer balances.", icon: WalletCards, id: "reports-receivables", label: "Receivables", title: "Receivables" }),
      planned({ description: "Review outstanding supplier balances.", icon: WalletCards, id: "reports-payables", label: "Payables", title: "Payables" }),
      planned({ description: "Review profit and loss information.", icon: ChartNoAxesCombined, id: "reports-profit-loss", label: "Profit & loss", title: "Profit & Loss" }),
      planned({ description: "Review recorded expenses.", icon: ReceiptText, id: "reports-expenses", label: "Expense reports", title: "Expense Reports" }),
      planned({ description: "Review stock-related reports.", icon: Boxes, id: "reports-inventory", label: "Inventory reports", title: "Inventory Reports" }),
      planned({ description: "Build reports from supported data, when available.", icon: FileText, id: "reports-custom", label: "Custom reports", title: "Custom Reports" }),
    ],
  },
  {
    label: "Organization & Team",
    items: [
      available({ description: "Review organization information.", href: "/organization", icon: Building2, id: "organization-overview", label: "Organization overview", title: "Organization Overview" }),
      planned({ description: "Review organization identity and business information.", icon: Building2, id: "organization-business-profile", label: "Business profile", title: "Business Profile" }),
      planned({ description: "View and manage organization members according to permissions.", icon: Users, id: "organization-members", label: "Members", title: "Members" }),
      planned({ description: "Review available roles and access controls.", icon: ShieldCheck, id: "organization-roles", label: "Roles & permissions", title: "Roles & Permissions" }),
      planned({ description: "Manage supported member invitations.", icon: Handshake, id: "organization-invitations", label: "Invitations", title: "Invitations" }),
      planned({ description: "Manage available organization settings.", icon: Settings2, id: "organization-settings", label: "Organization settings", title: "Organization Settings" }),
    ],
  },
  {
    label: "Settings & Integrations",
    items: [
      available({ description: "Configure invoice numbering, defaults, and billing preferences.", href: "/settings/billing", icon: Settings2, id: "settings-billing", label: "Billing settings", title: "Billing Settings" }),
      planned({ description: "Configure available GST and tax preferences.", icon: Percent, id: "settings-tax", label: "Tax settings", title: "Tax Settings" }),
      planned({ description: "Manage inventory preferences, if supported.", icon: Boxes, id: "settings-inventory", label: "Inventory settings", title: "Inventory Settings" }),
      planned({ description: "Configure available notification preferences.", icon: Bell, id: "settings-notifications", label: "Notification settings", title: "Notification Settings" }),
      planned({ description: "Access supported external integrations.", icon: Handshake, id: "settings-integrations", label: "Integrations", title: "Integrations" }),
      planned({ description: "Access supported data import and export functionality.", icon: ClipboardList, id: "settings-import-export", label: "Import & export", title: "Import & Export" }),
      planned({ description: "Configure supported document numbering rules.", icon: FileText, id: "settings-document-numbering", label: "Document numbering", title: "Document Numbering" }),
    ],
  },
  {
    label: "Account & Support",
    items: [
      planned({ description: "Review personal account details.", icon: UserRound, id: "account-profile", label: "Profile", title: "Profile" }),
      planned({ description: "Manage available personal account preferences.", icon: Settings2, id: "account-settings", label: "Account settings", title: "Account Settings" }),
      planned({ description: "Access supported security-related settings.", icon: ShieldCheck, id: "account-security", label: "Security", title: "Security" }),
      planned({ description: "Review notification functionality, if implemented.", icon: Bell, id: "account-notifications", label: "Notifications", title: "Notifications" }),
      planned({ description: "Access an existing support destination, if available.", icon: CircleHelp, id: "account-support", label: "Help & support", title: "Help & Support" }),
    ],
  },
] as const satisfies readonly DashboardNavigationSection[];
