export interface Annex {
  _id?: string;
  title: string;
  url: string;
  description?: string;
}

export interface PageDocument {
  _id?: string;
  title: string;
  url: string;
  description?: string;
  annexes: Annex[];
}

export interface Section {
  _id?: string;
  title: string;
  type: string;
  documents: PageDocument[];
}

export interface Page {
  _id: string;
  title: string;
  slug: string;
  sections: Section[];
  createdAt?: string;
  updatedAt?: string;
}
