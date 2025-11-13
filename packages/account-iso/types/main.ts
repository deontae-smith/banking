// Convex-specific validators
// These are just for reference; we are creating TS interfaces

export interface NameObject {
  firstName: string;
  lastName: string;
}

export interface AddressObject {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ReturnedUserContact {
  clerk_id: string;
  firstName: string;
  phoneNumber: string;
}
export interface CardMeta {
  isLocked: boolean;
  spendingLimit: number;
  cardType: string; // e.g. "debit" | "credit"
}

export interface ExpirationObject {
  month: string; // e.g. "12"
  year: string; // e.g. "28" or "2028"
}

export type UserContact = {
  id: string;
  phoneNumber: string;
};

export interface UserMetadata {
  contacts: UserContact[];
}

// Tables
export interface User {
  name: NameObject;
  email: string;
  clerk_id: string;
  address: AddressObject;
  account: string; // reference to Account id
  phoneNumber: string;
  metadata: UserMetadata;
}

export interface Account {
  number: string;
  routing: string;
  user: string; // reference to User id
  card: string; // reference to Card id
}

export interface Card {
  number: string;
  expiration: ExpirationObject;
  cvv: string;
  metadata: CardMeta;
  account: string; // reference to Account id
  balance: number;
}

export interface RetunredAccountData {
  number: string;
  routing: string;
  balance: number;
  card: Card | null;
}

export interface UseUserAccountResult {
  account: RetunredAccountData | null;
  loading: boolean;
  error: string | null;
}
