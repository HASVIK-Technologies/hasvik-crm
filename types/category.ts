export interface BusinessCategory {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}
