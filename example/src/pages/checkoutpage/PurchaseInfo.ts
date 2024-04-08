export type PurchaseInfo = {
    firstName: string;
    lastName: string;
    company: string;
    country: string;
    address1: string;
    address2: string;
    city: string;
    zip: string;
    phone: string;
    email: string;
    shouldCreateAccount?: boolean;
    shouldCheckPayment?: boolean;
}