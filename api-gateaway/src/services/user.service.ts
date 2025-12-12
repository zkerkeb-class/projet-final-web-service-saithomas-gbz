import type { User, GoogleProfile, GitHubProfile } from '../types/auth.types';

// Base de données temporaire en mémoire (à remplacer par une vraie DB)
const users = new Map<string, User>();

export class UserService {
  static findById(id: string): User | null {
    return users.get(id) || null;
  }

  static findByEmail(email: string): User | null {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  static findByProvider(provider: 'google' | 'github', providerId: string): User | null {
    for (const user of users.values()) {
      if (user.provider === provider && user.providerId === providerId) {
        return user;
      }
    }
    return null;
  }

  static createFromGoogleProfile(profile: GoogleProfile): User {
    const existingUser = this.findByProvider('google', profile.id);
    if (existingUser) {
      return existingUser;
    }

    const user: User = {
      id: crypto.randomUUID(),
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
      provider: 'google',
      providerId: profile.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(user.id, user);

    console.log(`✅ New Google google user created: ${user.email} (ID: ${user.id})`);
    return user;
  }

  static createFromGitHubProfile(profile: GitHubProfile): User {
    const existingUser = this.findByProvider('github', profile.id.toString());
    if (existingUser) {
      return existingUser;
    }

    const user: User = {
      id: crypto.randomUUID(),
      email: profile.email,
      name: profile.name || profile.login,
      avatar: profile.avatar_url,
      provider: 'github',
      providerId: profile.id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(user.id, user);
    console.log(`✅ New Github user created: ${user.email} (ID: ${user.id})`);
    return user;
  }

  static update(id: string, data: Partial<User>): User | null {
    const user = users.get(id);
    if (!user) {
      return null;
    }

    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };

    users.set(id, updatedUser);
    return updatedUser;
  }

  static delete(id: string): boolean {
    return users.delete(id);
  }

  static listAll(): User[] {
    return Array.from(users.values());
  }

  static count(): number {
    return users.size;
  }
}
