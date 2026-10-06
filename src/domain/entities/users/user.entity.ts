export class User {
  id: string;
  name: string;
  last_name: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
